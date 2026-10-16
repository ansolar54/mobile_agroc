sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
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
    Fragment,
    JSONModel,
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator,
    Formatter,
    Manager
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var path =
      "com.axelera.pe.gestioncomercial.view.m2-reportes.estado-cuenta";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m2-reportes.EstadoCuenta",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("R05", "Clear", this.onInitEstadoCuenta, this);
        },

        onInitEstadoCuenta: function (channel, event, oData) {
          this.initialization(oData.active);
        },

        initialization: function (active) {
          this.initialLocal();
          this.pintarChkBox();
          if (active) {
            this.manager.setBusy(false);
          }
        },

        pintarChkBox: function () {
          let oCheckBox = this.byId("chkEstadoCuenta");
          let bIsLightTheme = oLocal.getProperty("/isLightTheme");
          let sClass = this.formatter.getColorClass(bIsLightTheme);
          oCheckBox.addStyleClass(sClass);
        },

        initialMCCliente: function () {
          oLocal.setProperty("/mcCliente", {
            CodCliente: "",
            NomCliente: "",
            RUC: "",
          });
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            Cliente: "",
            ClienteInfo: "",
            Estado: false,
            EstadoAux: "None",
            EstadoDesc: "",
            Campo: "",
            Orden: "",
            mcCliente: {
              CodCliente: "",
              NomCliente: "",
              RUC: "",
            },
            Correos: [],
            ResumenCount: 0, //+@ES
            DetalleCount: 0, //+@ES
            BtnEnvPdfEnabled: false,
            IsFilter: false,
            filters: {
              TipoDoc: "",
              NroDoc: "",
              FechaEmision: null,
              FechaVenci: null,
              Moneda: "",
              Deuda: "",
              AFavor: "",
              Banco: "",
              NroUnico: "",
              DocOrigen: "",
            },
            IsMobile: this.manager.isMobile(), //+@dev-jrosales
            isLightTheme: false,
          });
        },

        limpiarAntesDeBuscar: function (cliente) {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            Cliente: cliente,
            ClienteInfo: "",
            Estado: false,
            EstadoAux: "None",
            EstadoDesc: "",
            Campo: "",
            Orden: "",
            mcCliente: {
              CodCliente: "",
              NomCliente: "",
              RUC: "",
            },
            Correos: [],
            ResumenCount: 0, //+@ES
            DetalleCount: 0, //+@ES
            BtnEnvPdfEnabled: false,
            IsFilter: false,
            filters: {
              TipoDoc: "",
              NroDoc: "",
              FechaEmision: null,
              FechaVenci: null,
              Moneda: "",
              Deuda: "",
              AFavor: "",
              Banco: "",
              NroUnico: "",
              DocOrigen: "",
            },
            IsMobile: this.manager.isMobile(), //+@dev-jrosales
          });
        },

        matchcodeCliente: function () {
          // const oService = this.getOwnerComponent().getModel("ReportesService");
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const CodCliente = oLocal.getProperty("/mcCliente/CodCliente");
          const NomCliente = oLocal.getProperty("/mcCliente/NomCliente");
          const RUC = oLocal.getProperty("/mcCliente/RUC");
          const uri = "/MatcodeSet?/$expand=matcode_clientesic_nav";
          const data = {
            Accion: "CLIENTES_EC",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsKunnr: CodCliente,
            IsName1: NomCliente,
            IsStcd1: RUC,
            EsRegtot: "",
            matcode_clientesic_nav: [],
          };

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
              // console.log("Data matchcodes (success): InfoClientes - Clientes",oData);
              oModel.setData(oData);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });
          this.getView().setModel(oModel, "oDataMCCliente");
        },

        onBuscarCliente: function () {
          const cliente = oLocal.getProperty("/mcCliente/CodCliente");
          const nombCliente = oLocal.getProperty("/mcCliente/NomCliente");
          const ruc = oLocal.getProperty("/mcCliente/RUC");

          if (cliente === "" && nombCliente === "" && ruc === "" ) {
            MessageBox.warning("Ingrese filtro para buscar.");
          } else {
            this.matchcodeCliente();
          }
        },

        onMatchcodeCliente: function () {
          this.displayPopup("MatchcodeCliente");
        },

        onConfirmPress: function (oEvent, oDialog) {
          let oSelectedItem, oCells;

          switch (oDialog) {
            case "dialogClienteEC":
              oSelectedItem = oEvent.getParameter("listItem");
              oCells = oSelectedItem.getCells();
              oLocal.setProperty("/Cliente", oCells[0].getTitle());
              oLocal.setProperty("/ClienteInfo", oCells[1].getText());

              this.onCancelPress(null, "dialogClienteEC");
              break;
            default:
              break;
          }
        },

        setDatosCliente: function (data) {
          if (data && data.length > 0) {
            const cliente = data[0];
            oLocal.setProperty("/NomCliente", cliente.RazonSoc);
            oLocal.setProperty("/RUC", cliente.Ruc);
            oLocal.setProperty("/Direccion", cliente.Direccion);
            oLocal.setProperty("/Estado", this.formatter.booleano(cliente.Chk));
            // oLocal.setProperty("/Estado", true);
            oLocal.setProperty("/EstadoAux", cliente.Chk ? 'Error': 'Success');
            oLocal.setProperty("/EstadoDesc", cliente.ChkDesc);
          }
        },

        prepareCallReport: function () {
          const data = {
            Accion: "ESTADOCUENTA",
            IsCliente: oLocal.getProperty("/Cliente"), //"100000067",
            IsCampoAct: oLocal.getProperty("/Campo"),
            IsOrdenAct: oLocal.getProperty("/Orden"),
            IsChkCab: "",
            reporte_cabeceraec_nav: [],
            reporte_detalleec_nav: [],
            reporte_resumenec_nav: [],
            reporte_correosec_nav: [],
            reporte_filterec_nav: [],
          };

          const isFilter = oLocal.getProperty("/IsFilter");

          // VALIDANDO SI FILTRO EXISTE
          if (isFilter) {
            // data.Accion = "CONSULTASTOCK_FLTR";
            data.reporte_filterec_nav.push(oLocal.getProperty("/filters"));
          }

          return data;
        },

        removeSorters: function (oModel) {
          const bindings = oModel.aBindings;
          if (bindings && bindings.length > 0) {
            bindings[41].aSorters = null;
          }
        },

        removeFilters: function (oModel) {
          const bindings = oModel.aBindings;
          if (bindings && bindings.length > 0) {
            // bindings[0].aFilters = null;
            bindings[0].oCombinedFilter = null;
          }
        },

        callReport: function (data) {
          // const oService = this.getOwnerComponent().getModel("ReportesService");
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri =
            "/ReporteSet?/$expand=reporte_cabeceraec_nav," +
            "reporte_detalleec_nav," +
            "reporte_resumenec_nav," +
            "reporte_correosec_nav," +
            "reporte_filterec_nav";
          
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
              // console.log("Data matchcodes (success): Cons. Stock - LISTADO",oData);
              this.removeSorters(oModel);
              this.removeFilters(oModel); //+@ES
              oModel.setData(oData);
              this.setDatosCliente(oData.reporte_cabeceraec_nav.results);
              // HABILITAR BTN DESCARGAR EXCEL
              if (oData.reporte_correosec_nav.results.length > 0) {
                oLocal.setProperty(
                  "/Correos",
                  oData.reporte_correosec_nav.results
                );
                oLocal.setProperty("/BtnEnvPdfEnabled", true);
              }

              let count1 = oData.reporte_resumenec_nav.results.length;
              oLocal.setProperty("/ResumenCount", (count1 <= 15)? count1: 15 ); //+@ES
              let count2 = oData.reporte_detalleec_nav.results.length;
              oLocal.setProperty("/DetalleCount", (count2 <= 15)? count2: 15); //+@ES

              this.manager.isMobile() && SpinnerDialog.hide();
              // this.updatePagination(oData.EsRegtot);
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });

          this.getView().setModel(oModel, "oDataEstadoCuenta");
        },

        onBuscar: function () {
          const cliente = oLocal.getProperty("/Cliente");
          this.limpiarAntesDeBuscar(cliente); //+@JR
          if (cliente.length > 0) {
            // this.selCliente();
            const searchData = this.prepareCallReport();
            this.callReport(searchData);
          } else {
            MessageToast.show(`Debe seleccionar un "Cod. Cliente".`);
          }
        },

        onCancelPress: function (oEvent, dialog) {
          switch (dialog) {
            case "dialogClienteEC":
              this.byId(dialog).close();
              this.byId(dialog).destroy();
              this.initialMCCliente();
              this.getView().setModel(new JSONModel(), "oDataMCCliente");
              break;
            default:
              break;
          }
        },

        onLimpiarMCCliente: function () {
          this.initialMCCliente();
          this.getView().setModel(new JSONModel(), "oDataMCCliente");
        },

        clearFilterSortTable: function () {
          const oTable = this.byId("tblDetalleTable");
          const aColumns = oTable.getColumns();
          aColumns.forEach(function (oColumn) {
            oColumn.setFiltered(false);
            oColumn.setSorted(false);
          });
        },

        onLimpiarCampos: function () {
          this.initialLocal();
          this.getView().setModel(new JSONModel(), "oDataEstadoCuenta");
          this.clearFilterSortTable();
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

        onScreenCargaCorreos: function () {
          this.displayPopup("CargaCorreos");
        },

        onCloseDialog: function (oEvent, sId) {
          let oDialog = this.byId(sId);
          if (oDialog) {
            oDialog.close();
            oDialog.destroy();
          }
        },

        onAgregarCorreo: function () {
          // let oModel = this.getView().getModel("local");
          let correo = this.getView().byId("txtAddCorreoEC").getValue();
          let modelCorreos = oLocal.getProperty("/Correos");
          if (this.formatter.validaCorreo(correo)) {
            modelCorreos.push({ Kunnr: "", Correo: correo, Remark: "" });
            oLocal.setProperty("/Correos", modelCorreos);
          } else {
            MessageToast.show(i18n.getText("MsgErrAddCorreo"));
          }
        },

        onDeleteCorreo: function (oEvent) {
          const correo = this.getView()
            .getModel("local")
            .getProperty(
              "Correo",
              oEvent.getSource().getBindingContext("local")
            );
          this.deleteItem(correo);
        },

        deleteItem: function (correo) {
          // const oTable = this.byId("tblCorreos");
          // const oModel = oTable.getModel("local");
          const aItems = oLocal.getProperty("/Correos");
          const iIndex = aItems.findIndex((item) => item.Correo === correo);

          if (iIndex > -1) {
            aItems.splice(iIndex, 1);
            oLocal.setProperty("/Correos", aItems);
          }
        },

        onEnviarPdf: function () {
          // let oModel = this.getView().getModel("local");
          let modelCorreos = oLocal.getProperty("/Correos");
          // const oService = this.getOwnerComponent().getModel("ReportesService");
          const oService = this.manager.getService("REPORTES");

          const uri = "/ReporteSet?/$expand=reporte_listamail_nav";
          const data = {
            Accion: "ESTADOCUENTA_PDF",
            IsCliente: oLocal.getProperty("/Cliente"),
            EsRegtot: "",
            reporte_listamail_nav: [], // {Mail: 'jrosales@gmail.com'}
          };

          data.reporte_listamail_nav = [];
          // PROVISIONAL
          // let correosProvisional = modelCorreos.slice(1); // Eliminar correo sap

          // cargar correos a modelo
          if (modelCorreos.length > 0) {
            for (let item of modelCorreos) {
              data.reporte_listamail_nav.push({
                Mail: item.Correo,
              });
            }
          }

          this.manager.isMobile() && SpinnerDialog.show();

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              // console.log("Data envio pdf (success)", oData);
              MessageToast.show(oData.EsMessage);
              this.manager.isMobile() && SpinnerDialog.hide();
            },
            error: function (oError) {
              console.error("Data envio pdf (error)");
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });
        },

        onChange: function (oEvent, sField) {
          switch (sField) {
            case "Cliente":
              // const cliente = oLocal.getProperty("/Cliente");
              const cliente = oEvent.getParameter("value");
              if (cliente.length == 0) {
                this.onLimpiarCampos();
              }
              break;
          }
        },

        validarFiltros: function () {
          const campos = [
            "TipoDoc",
            "NroDoc",
            "FechaEmision",
            "FechaVenci",
            "Moneda",
            "Deuda",
            "AFavor",
            "Banco",
            "NroUnico",
            "DocOrigen",
          ];
          let isFilter = oLocal.getProperty("/IsFilter");
          for (const item of campos) {
            const valor = oLocal.getProperty(`/filters/${item}`);
            if (
              valor == "" ||
              valor == undefined ||
              valor == null ||
              valor == "0" ||
              valor == "0.0"
            ) {
              isFilter = false;
            } else {
              isFilter = true;
              break;
            }
          }
          return isFilter;
        },

        // ORDENAMIENTO
        onTableSort: function (oEvent) {
          const oColumn = oEvent.getParameter("column"); // Obtener la columna que se está ordenando
          const sSortOrder = oEvent.getParameter("sortOrder"); // Obtener el tipo de ordenación [Ascending - Descending]
          const nameColumn = oColumn.getProperty("sortProperty");
          let campo = nameColumn.toUpperCase();
          let orden = null;

          if (sSortOrder === "Ascending") {
            orden = "1";
          } else {
            orden = "0";
          }

          oLocal.setProperty("/Campo", campo); //+@
          oLocal.setProperty("/Orden", orden); //+@
          this.onBuscar();
        },

        onTableFilter: function (oEvent) {
          const oColumn = oEvent.getParameter("column"); // Obtener la columna que se está filtrando
          const sValue = oEvent.getParameter("value"); // Obtener el valor a filtrar
          const nameColumn = oColumn.getProperty("filterProperty");
          // let campo = nameColumn.toUpperCase();
          // let filtro = sValue;

          oLocal.setProperty(`/filters/${nameColumn}`, sValue); //+@
          oLocal.setProperty("/IsFilter", this.validarFiltros()); //+@

          //{+@
          oEvent.preventDefault();
          if (sValue.length == 0) {
            oColumn.setFiltered(false);
          } else {
            oColumn.setFiltered(true);
          }
          //}+@

          this.onBuscar();
        },

        onRowsUpdated: function (oEvent) {
          const complete_url = window.location.href;
          let classTheme = "bgColorResumenLastRow";
          if (!this.manager.isMobile()) {
            classTheme = complete_url.includes("gc_farmex_light") ? "bgColorResumenLastRowLight" : "bgColorResumenLastRowDark";
          }
          const oTable = oEvent.getSource();
          const aRows = oTable.getRows();
          if (aRows.length > 0) {
            for (let i = 0; i < aRows.length; i++) {
              const element = aRows[i];
              element.removeStyleClass(classTheme);
              if (i == 8) {
                element.addStyleClass(classTheme);
              }
            }
          }
        },

        onSelectCheck: function (oEvent) {
          var bSelected = true; //oEvent.getParameter("selected");
			    oLocal.setProperty("/Estado", bSelected); //+@
        },
      }
    );
  }
);
