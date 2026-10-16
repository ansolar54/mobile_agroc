sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../../model/Formatter",
    "../../model/Manager",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {typeof sap.m.MessageToast} MessageToast
   * @param {typeof sap.m.MessageBox} MessageBox
   * @param {typeof sap.ui.model.mvc.Filter} Filter
   * @param {typeof sap.ui.model.mvc.FilterOperator} FilterOperator
   */
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast,
    Formatter,
    Manager
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var path =
      "com.axelera.pe.gestioncomercial.view.m3-cambio-precio.reporte-solicitud";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m3-cambio-precio.ReporteSolicitud",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("CP04", "Clear", this.onInitRepSolicitud, this);
        },

        onInitRepSolicitud: function (channel, event, oData) {
          this.initialization(oData.active);
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            this.matchcodeSolicitanteAprob();
            this.matchcodeOrgVentas(false); //+
            this.manager.setBusy(false);
          }
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            FechaDesde: new Date(), //null,
            FechaHasta: new Date(),
            Estado: "",
            NroSol: "",
            OrgVentas: "",
            OrgVentasInfo: "",
            Sector: "",
            SectorInfo: "",
            Cliente: "",
            Solicitante: "",
            Aprobador: "",
            Solicitudes: {
              items: [],
            },
            mcCliente: {
              Cliente: "",
              NombreCliente: "",
              RUC: "",
            },
            Sociedad: this.manager.getBukrs(), //+@ES
            page: {
              CantFilas: 10,
              Indice: 0,
              TotalItems: 0,
              Page: 1,
              TotalPages: 0,
              PrevPageBtn: false,
              NextPageBtn: false,
            },
            loadingTbl: false, //+@
            IsMobile: this.manager.isMobile(), //+@DEV-AS
          });
        },

        initialMCCliente: function () {
          oLocal.setProperty("/mcCliente", {
            Cliente: "",
            NombreCliente: "",
            RUC: "",
          });
          this.getView().setModel(new JSONModel(), "oDataMCCliente");
        },

        matchcodeOrgVentas: function (popup) {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri = "/EtOrgVentasSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "accion": "ORGVENTAS",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.read(uri, {
            method: "GET",
            success: function (oData) {
              //   console.log("Data matchcodes (success): Reporte Solicitud Org Ventas", oData);
              this.manager.setBusy(false);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOrgVentas");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error)");
              this.manager.setBusy(false);
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataMCOrgVentas");
        },

        matchcodeCliente: function (popup) {
          const oService = this.manager.getService("CAMBIOP");
          const oModel = new JSONModel();
          const uri = "/MatcodeSet?/$expand=matcode_clientes_nav";
          const data = {
            Accion: "CLIENTES",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsKunnr: oLocal.getProperty("/mcCliente/Cliente"), //+@
            IsName1: oLocal.getProperty("/mcCliente/NombreCliente"), //+@
            IsStcd1: oLocal.getProperty("/mcCliente/RUC"), //+@
            IsVkorg: oLocal.getProperty("/OrgVentas"),
            matcode_clientes_nav: [],
          };

          data.IsVkorg = data.IsVkorg ? data.IsVkorg : "";

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData) {
              //   console.log("Data matchcodes (success): Reporte Solicitud Clientes",oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeCliente");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error)");
            },
          });

          this.getView().setModel(oModel, "oDataMCCliente");
        },

        matchcodeSolicitanteAprob: function () {
          const oService = this.manager.getService("ADMIN");
          const oModelSol = new JSONModel();
          const oModelApr = new JSONModel();
          const uri =
            "/ConsultaSet?/$expand=consulta_comerciales_nav,consulta_gerentes_nav";
          const data = {
            Accion: "USUARIOS_CAMBIOP",
            IdUsuario: this.manager.getIdUser(),
            consulta_comerciales_nav: [],
            consulta_gerentes_nav: [],
          };

          data.IdUsuario = data.IdUsuario ? data.IdUsuario : 0;

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData) {
              // console.log( "Data matchcodes (success): Reporte Solicitud Solicitante",oData );
              oModelSol.setData(oData);
              oModelApr.setData(oData);
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
            },
          });

          this.getView().setModel(oModelSol, "oDataMCSolicitante");
          this.getView().setModel(oModelApr, "oDataMCAprobador");
        },

        prepareCallReport: function () {
          const idSolicitante = this.getIdSolicitante(
            oLocal.getProperty("/Solicitante")
          );
          const idAprobador = this.getIdAprobador(
            oLocal.getProperty("/Aprobador")
          );
          const data = {
            Accion: "LISTAR_REPORTE",
            IsIdsolicitud: Number(oLocal.getProperty("/NroSol")),
            IsIdsolicitante: Number(idSolicitante),
            IsIdaprobador: Number(idAprobador),
            IsEstado: Number(oLocal.getProperty("/Estado")),
            IsVkorg: oLocal.getProperty("/OrgVentas"),
            IsSpart: oLocal.getProperty("/Sector"), //+@
            IsKunnr: oLocal.getProperty("/Cliente"),
            IsFecha1: this.formatter.fechaEstandard(
              oLocal.getProperty("/FechaDesde")
            ),
            IsFecha2: this.formatter.fechaEstandard(
              oLocal.getProperty("/FechaHasta")
            ),
            IsSolicitudCab: {},
            cp_repsolicitudes_nav: [],
          };

          // data.IsIdsolicitud = data.IsIdsolicitud
          //   ? Number(data.IsIdsolicitud)
          //   : 0;
          // data.IsIdsolicitante = data.IsIdsolicitante
          //   ? Number(data.IsIdsolicitante)
          //   : 0;
          // data.IsIdaprobador = data.IsIdaprobador
          //   ? Number(data.IsIdaprobador)
          //   : 0;
          // data.IsEstado = data.IsEstado ? Number(data.IsEstado) : 0;

          data.IsFecha1 = this.formatter.cadenaFecha(data.IsFecha1);
          data.IsFecha2 = this.formatter.cadenaFecha(data.IsFecha2);

          return data;
        },

        callReport: async function (data, page, indice, busy) {
          const oService = this.manager.getService("CAMBIOP");
          const uri = "/CambioPrecioSet?/$expand=cp_repsolicitudes_nav";

          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", indice);
          busy && oLocal.setProperty("/loadingTbl", true);

          this.manager.isMobile() && SpinnerDialog.show();
          
          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData) {
              // console.log("Data mis solicitudes (success)", oData);
              this.setSolicitudes(oData.cp_repsolicitudes_nav.results);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.updatePagination(oData.Pagination.Total);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data mis solicitudes (error):", oError);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });
        },

        onBuscar: function () {
          const fecha = oLocal.getProperty("/FechaDesde");

          if (typeof fecha == "object" && fecha !== null) {
            // this.onListarRepSolicitud();
          } else {
            MessageToast.show(`Debe seleccionar una "Fecha (Desde)"`);
            return;
          }

          oLocal.setProperty("/page/Page", 1);
          oLocal.setProperty("/page/Indice", 0);

          const cantFilas = oLocal.getProperty("/page/CantFilas");
          const searchData = this.prepareCallReport();
          searchData.Pagination = {
            CantidadFilas: cantFilas,
            Indice: 0,
          };
          // this.manager.auditoria(9); //-@20260820
          this.callReport(searchData, 1, 0, true);
        },

        getIdSolicitante: function (userName) {
          const data = this.getView().getModel("oDataMCSolicitante").getData()
            .consulta_comerciales_nav.results;
          const user = data.find((user) => user.Usuario === userName);
          if (user && user.Id) {
            return user.Id;
          } else {
            return "";
          }
        },

        getIdAprobador: function (userName) {
          const data = this.getView().getModel("oDataMCAprobador").getData()
            .consulta_gerentes_nav.results;
          const user = data.find((user) => user.Usuario === userName);
          if (user && user.Id) {
            return user.Id;
          } else {
            return "";
          }
        },

        onConfirmPress: function (oEvent, oDialog) {
          let oSelected, oCells;

          switch (oDialog) {
            case "dialogOrgVentasRS":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/OrgVentas", oCells[0].getTitle());
              oLocal.setProperty("/OrgVentasInfo", oCells[1].getText());
              oLocal.setProperty("/Sector", oCells[2].getText());
              oLocal.setProperty("/SectorInfo", oCells[3].getText());
              break;
            case "dialogClienteRS":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/Cliente", oCells[0].getTitle());
              oLocal.setProperty("/ClienteInfo", oCells[1].getText());
              // oLocal.setProperty("/Canalventas", sCanal);

              this.onCancelPress(null, oDialog);
              break;
            default:
              break;
          }
        },

        onCancelPress: function (oEvent, oDialog) {
          switch (oDialog) {
            case "dialogClienteRS":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              this.initialMCCliente();
              break;
          }
        },

        matchcodeSearch: function (oEvent, oDialog) {
          const sValue = oEvent.mParameters.value;
          let aFilters;

          switch (oDialog) {
            case "dialogOrgVentasRS":
              aFilters = [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogClienteRS":
              aFilters = [
                new Filter("Kunnr", FilterOperator.Contains, sValue),
                new Filter("Name1", FilterOperator.Contains, sValue),
                new Filter("Zona", FilterOperator.Contains, sValue),
                new Filter("Stcd1", FilterOperator.Contains, sValue),
              ];
            default:
              break;
          }

          const oFilter = new Filter({
            filters: aFilters,
            and: false,
          });

          const oBinding = oEvent.getSource().getBinding("items");
          oBinding.filter([oFilter]);
        },

        onMatchcodeOrgVentas: function () {
          this.matchcodeOrgVentas(true);
        },

        onMatchcodeCliente: function () {
          this.displayPopup("MatchcodeCliente");
        },

        onLimpiarCampos: function () {
          this.initialLocal();
        },

        quitarDecimales: function (num) {
          let arrNum = num.split(".");
          if (arrNum[1].includes("00")) {
            num = arrNum[0];
          }
          return num;
        },

        onRowsUpdated: function (oEvent) {
          const oTable = oEvent.getSource();
          const aRows = oTable.getRows();
          if (aRows.length > 0) {
            aRows.forEach((oRow) => {
              oRow.getCells().forEach((oCell) => {
                let field = oCell.mBindingInfos["text"].binding.sPath;
                let margen = oCell.getText();
                if (field === "Margen") { // Margen
                  if (Number(margen.split('%')[0]) < 20) {
                    oCell.addStyleClass("redText");
                  } else {
                    oCell.removeStyleClass("redText");
                  }
                }
              });
            });
          }
        },

        setSolicitudes: function (data) {
          const tabla = [];

          if (data) {
            for (const item of data) {
              tabla.push({
                Id: item.Id,
                Solicitante: item.Solicitante,
                Aprobador: item.Aprobador,
                Orgventas: item.Orgventas,
                Sector: item.Sector,
                Cliente: item.Cliente,
                Clientetxt: item.Clientetxt,
                Material: item.Material,
                Materialtxt: item.Materialtxt,
                Moneda: item.Moneda,
                Iduser: item.Iduser,
                Estado: item.Estado,
                Preciosugerido: item.Preciosugerido,
                Fechacrea: this.formatter.fechaEstandardRet(item.Fechacrea),
                Fechafin: this.formatter.fechaEstandardRet(item.Fechafin),
                Ofiventas: item.Ofiventas,
                Limiteinf: item.Limiteinf,
                Ofiventastxt: item.Ofiventastxt,
                Idmanager: item.Idmanager,
                Fechaaprob: this.formatter.fechaEstandardRet(item.Fechaaprob),
                Margen: this.quitarDecimales(item.Margen),
                Canalventas: item.Canalventas,
                Canalventastxt: item.Canalventastxt,
              });
            }

            oLocal.setProperty("/Solicitudes/items", tabla);
          }
        },

        onBuscarCliente: function () {
          const cliente = oLocal.getProperty("/mcCliente/Cliente");
          const nombCliente = oLocal.getProperty("/mcCliente/NombreCliente");
          const ruc = oLocal.getProperty("/mcCliente/RUC");
          
          if (cliente === "" && nombCliente === "" && ruc === "") {
            MessageBox.warning("Ingrese filtro para buscar.");
          } else {
            this.matchcodeCliente();
          }
        },

        onLimpiarCliente: function () {
          this.initialMCCliente();
          this.getView().setModel(new JSONModel(), "oDataMCCliente");
        },

        onChange: function (oEvent, sField) {
          switch (sField) {
            case "OrgVentas":
              // const orgVentas = oLocal.getProperty("/OrgVentas");
              const orgVentas = oEvent.getParameter("value");
              if (orgVentas.length == 0) {
                oLocal.setProperty("/OrgVentasInfo", "");
                oLocal.setProperty("/Sector", "");
                oLocal.setProperty("/SectorInfo", "");
              }
              break;
            case "Cliente":
              // const cliente = oLocal.getProperty("/Cliente");
              const cliente = oEvent.getParameter("value");
              if (cliente.length == 0) {
                oLocal.setProperty("/ClienteInfo", "");
              }
              break;
            default:
              break;
          }
        },

        onPress: function (oEvent, sInput) {
          let data = [];
          let results = [];
          let result = null;

          switch (sInput) {
            case "OrgVentas":
              data = this.getView().getModel("oDataMCOrgVentas")?.getData();
              if (data) {
                let orgVentas = oLocal.getProperty("/OrgVentas");
                let sector = oLocal.getProperty("/Sector");
                results = data.results;

                if (orgVentas.length > 0) {
                  if (sector.length > 0) {
                    result = results.find(
                      (item) => item.Vkorg == orgVentas && item.Spart == sector
                    );
                  } else {
                    result = results.find((item) => item.Vkorg == orgVentas);
                  }
                }

                // let oInput = this.getView().byId("txtOrgVentasCP");
                // this.initialLocal();

                if (result) {
                  oLocal.setProperty("/OrgVentas", result.Vkorg);
                  oLocal.setProperty("/OrgVentasInfo", result.Vtext);
                  oLocal.setProperty("/Sector", result.Spart);
                  oLocal.setProperty("/SectorInfo", result.Vtext2);
                  // oInput.setValueState("None");
                } else {
                  oLocal.setProperty("/OrgVentas", orgVentas);
                  oLocal.setProperty("/OrgVentasInfo", "");
                  // oInput.setValueState("Error");
                  // oLocal.setProperty("/Sector", "");
                  // oLocal.setProperty("/SectorInfo", "");
                }
              }
              break;

            default:
              break;
          }
        },

        onSuggest: function (oEvent, sInput) {
          switch (sInput) {
            case "ORGVENTAS":
              this.matchcodeOrgVentas(false);
              break;
            default:
              break;
          }
        },

        onSuggeItemSelected: function (oEvent, sInput) {
          let oSel = oEvent.getParameter("selectedItem");

          switch (sInput) {
            case "ORGVENTAS":
              let keys = oSel.getKey().split("|");
              oLocal.setProperty("/OrgVentas", keys[0]);
              oLocal.setProperty("/Sector", keys[1]);
              this.onPress(null, "OrgVentas");
              break;
          }
        },

        displayPopup: function (dialog) {
          this.loadFragment({
            name: `${path}.${dialog}`,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.open();
            }.bind(this)
          );
        },

        // #region PAGINATION

        updatePagination: function (total) {
          let totalItems = total;
          let cantFilas = oLocal.getProperty("/page/CantFilas");
          let totalPages = Math.ceil(totalItems / cantFilas);

          oLocal.setProperty("/page/TotalPages", totalPages);
          oLocal.setProperty("/page/TotalItems", totalItems);
          this.fnNavButtonsEnable();
        },

        onNextPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          const totalItems = oLocal.getProperty("/page/TotalItems");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          if (indice + cantFilas < totalItems) {
            indice += cantFilas;
            page += 1;

            const searchData = this.prepareCallReport();
            searchData.Pagination = {
              CantidadFilas: cantFilas,
              Indice: indice,
            };
            this.callReport(searchData, page, indice, true);
          }
        },

        onPreviousPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          if (indice > 0) {
            indice -= cantFilas;
            page -= 1;

            const searchData = this.prepareCallReport();
            searchData.Pagination = {
              CantidadFilas: cantFilas,
              Indice: indice,
            };
            this.callReport(searchData, page, indice, true);
          }
        },

        onFirstPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          const searchData = this.prepareCallReport();
          searchData.Pagination = {
            CantidadFilas: cantFilas,
            Indice: 0,
          };
          this.callReport(searchData, 1, 0, true);
        },

        onLastPress: function () {
          let totalItems = oLocal.getProperty("/page/TotalItems");
          let cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = Math.ceil(totalItems / cantFilas);
          let indice = (page - 1) * cantFilas;
          const searchData = this.prepareCallReport();
          searchData.Pagination = {
            CantidadFilas: cantFilas,
            Indice: indice,
          };
          this.callReport(searchData, page, indice, true);
        },

        fnNavButtonsEnable: function () {
          const totalItems = oLocal.getProperty("/page/TotalItems");
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          const indice = oLocal.getProperty("/page/Indice");

          oLocal.setProperty("/page/PrevPageBtn", false);
          oLocal.setProperty("/page/NextPageBtn", false);

          if (indice + cantFilas < totalItems) {
            oLocal.setProperty("/page/NextPageBtn", true);
          }

          if (indice >= cantFilas) {
            oLocal.setProperty("/page/PrevPageBtn", true);
          }
        },

        //#endregion PAGINATION
      }
    );
  }
);
