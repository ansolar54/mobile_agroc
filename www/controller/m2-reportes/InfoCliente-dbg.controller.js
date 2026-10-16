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
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
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
    Manager,
    Spreadsheet,
    exportLibrary
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var path =
      "com.axelera.pe.gestioncomercial.view.m2-reportes.info-cliente";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m2-reportes.InfoCliente",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("R04", "Clear", this.onInitInfoCliente, this);
        },

        onInitInfoCliente: function (channel, event, oData) {
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
          let oCheckBox = this.byId("chkInfoCliente");
          let bIsLightTheme = oLocal.getProperty("/isLightTheme");
          let sClass = this.formatter.getColorClass(bIsLightTheme);
          oCheckBox.addStyleClass(sClass);
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            Cliente: "",
            NomCliente: "",
            CanalDistri: "",
            CreadoEl: "",
            Estado: false, //@JR - false default
            EstadoAux: "None",
            EstadoDesc: "",
            CondicionLP: {
              Fila1: { Lbl: "", C: "", Cx: false, LP: "", LPx: false },
              Fila2: { Lbl: "", C: "", Cx: false, LP: "", LPx: false },
              Fila3: { Lbl: "", C: "", Cx: false, LP: "", LPx: false },
              Fila4: { Lbl: "", C: "", Cx: false, LP: "", LPx: false },
            },
            mcCliente: {
              CodCliente: "",
              NomCliente: "",
              RUC: "",
            },
            ssVerPedidos: {
              Tipo: "",
              FechaDesde: null,
              FechaHasta: null,
              Campo: "",
              Orden: "",
              IsFilter: false,
              filters: {
                Vkorg: "",
                Matnr: "",
                Maktx: "",
                Kwmeng: "",
                Vrkme: "",
                Netwr: "",
                Waerk: "",
              },
              NombreTabla: "",
            },
            Excel: {
              FileText: "Reporte",
              BtnEnabled: false,
            },
            IsMobile: this.manager.isMobile(), //+@dev-jrosales
            ResumenCount: 0, //+@JR
            DetalleCount: 0, //+@JR
          });
        },

        limpiarAntesDeBuscar: function (cliente) {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            Cliente: cliente,
            NomCliente: "",
            CanalDistri: "",
            CreadoEl: "",
            Estado: false, //@JR - false default
            EstadoAux: "None",
            EstadoDesc: "",
            CondicionLP: {
              Fila1: { Lbl: "", C: "", Cx: false, LP: "" },
              Fila2: { Lbl: "", C: "", Cx: false, LP: "" },
              Fila3: { Lbl: "", C: "", Cx: false, LP: "" },
              Fila4: { Lbl: "", C: "", Cx: false, LP: "" },
            },
            mcCliente: {
              CodCliente: "",
              NomCliente: "",
              RUC: "",
            },
            ssVerPedidos: {
              Tipo: "",
              FechaDesde: null,
              FechaHasta: null,
              Campo: "",
              Orden: "",
              IsFilter: false,
              filters: {
                Vkorg: "",
                Matnr: "",
                Maktx: "",
                Kwmeng: "",
                Vrkme: "",
                Netwr: "",
                Waerk: "",
              },
              NombreTabla: "",
            },
            Excel: {
              FileText: "Reporte",
              BtnEnabled: false,
            },
            IsMobile: this.manager.isMobile(), //+@dev-jrosales
            ResumenCount: 0, //+@JR
            DetalleCount: 0, //+@JR
          });
        },

        initialMCCliente: function () {
          oLocal.setProperty("/mcCliente", {
            CodCliente: "",
            NomCliente: "",
            RUC: "",
          });
        },

        initialSSPedidos: function () {
          oLocal.setProperty("/ssVerPedidos", {
            Tipo: "",
            FechaDesde: null,
            FechaHasta: null,
            Campo: "",
            Orden: "",
            IsFilter: false,
            filters: {
              Vkorg: "",
              Matnr: "",
              Maktx: "",
              Kwmeng: "",
              Vrkme: "",
              Netwr: "",
              Waerk: "",
            },
            NombreTabla: "",
            loadingTbl: false, //+@
          });
        },

        matchcodeCliente: function (oIsDuplicate, popup) {
          // const oService = this.getOwnerComponent().getModel("ReportesService");
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri = "/MatcodeSet?/$expand=matcode_clientesic_nav";
          const data = {
            Accion: "CLIENTES_IC",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsDuplicate: oIsDuplicate,
            IsKunnr: oLocal.getProperty("/mcCliente/CodCliente"),
            IsName1: oLocal.getProperty("/mcCliente/NomCliente"),
            IsStcd1: oLocal.getProperty("/mcCliente/RUC"),
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
              popup && this.displayPopup("MatchcodeCliente");
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              this.manager.isMobile() && SpinnerDialog.hide();
              console.error("Data matchcodes (error):", oError);
            }.bind(this),
          });
          this.getView().setModel(oModel, "oDataMCCliente");
        },

        setCamposSector: function (oData) {
          console.log(oData);
          if (oData) {
            const data = oData.matcode_clientesic_nav.results;
            for (const item of data) {
              let condicion = `${item.Zterm} / ${item.Vtext}`;
              let listaPrec = `${item.Pltyp} / ${item.PltypPtext}`;
              let etiqueta = `${item.VkorgVtext} / ${item.Spart}`;
              let indicador = 0;

              if (item.Vkorg == "1001" && item.Spart == "99") {
                indicador = 1;
              } else if (item.Vkorg == "1001" && item.Spart == "SE") {
                indicador = 2;
              } else if (item.Vkorg == "1002" && item.Spart == "SR") {
                indicador = 3;
              } else if (item.Vkorg == "1003" && item.Spart == "SA") {
                indicador = 4;
              } else {
                continue;
              }
              oLocal.setProperty(`/CondicionLP/Fila${indicador}/Lbl`, etiqueta);
              oLocal.setProperty(`/CondicionLP/Fila${indicador}/C`, condicion);
              oLocal.setProperty(`/CondicionLP/Fila${indicador}/LP`, listaPrec);
            }

            // const c3 = oLocal.getProperty("/CondicionLP/C3");
            const c1 = oLocal.getProperty("/CondicionLP/Fila1/C");
            const c2 = oLocal.getProperty("/CondicionLP/Fila2/C");
            const c3 = oLocal.getProperty("/CondicionLP/Fila3/C");
            const c4 = oLocal.getProperty("/CondicionLP/Fila4/C");

            const lp1 = oLocal.getProperty("/CondicionLP/Fila1/LP");
            const lp2 = oLocal.getProperty("/CondicionLP/Fila2/LP");
            const lp3 = oLocal.getProperty("/CondicionLP/Fila3/LP");
            const lp4 = oLocal.getProperty("/CondicionLP/Fila4/LP");
            // Cx
            if (typeof c1 == "string" && c1.length > 0) {
              oLocal.setProperty("/CondicionLP/Fila1/Cx", true);
            } else {
              oLocal.setProperty("/CondicionLP/Fila1/Cx", false);
            }
            if (typeof c2 == "string" && c2.length > 0) {
              oLocal.setProperty("/CondicionLP/Fila2/Cx", true);
            } else {
              oLocal.setProperty("/CondicionLP/Fila2/Cx", false);
            }
            if (typeof c3 == "string" && c3.length > 0) {
              oLocal.setProperty("/CondicionLP/Fila3/Cx", true);
            } else {
              oLocal.setProperty("/CondicionLP/Fila3/Cx", false);
            }
            if (typeof c4 == "string" && c4.length > 0) {
              oLocal.setProperty("/CondicionLP/Fila4/Cx", true);
            } else {
              oLocal.setProperty("/CondicionLP/Fila4/Cx", false);
            }
            // LPx
            if (typeof lp1 == "string" && lp1.length > 0 && lp1.trim() != "/") {
              oLocal.setProperty("/CondicionLP/Fila1/LPx", true);
            } else {
              oLocal.setProperty("/CondicionLP/Fila1/LPx", false);
            }
            if (typeof lp2 == "string" && lp2.length > 0 && lp2.trim() != "/") {
              oLocal.setProperty("/CondicionLP/Fila2/LPx", true);
            } else {
              oLocal.setProperty("/CondicionLP/Fila2/LPx", false);
            }
            if (typeof lp3 == "string" && lp3.length > 0 && lp3.trim() != "/") {
              oLocal.setProperty("/CondicionLP/Fila3/LPx", true);
            } else {
              oLocal.setProperty("/CondicionLP/Fila3/LPx", false);
            }
            if (typeof lp4 == "string" && lp4.length > 0 && lp4.trim() != "/") {
              oLocal.setProperty("/CondicionLP/Fila4/LPx", true);
            } else {
              oLocal.setProperty("/CondicionLP/Fila4/LPx", false);
            }
          }
        },

        setDatosCliente: function (clientes) {
          if (clientes && clientes.length > 0) {
            const cliente = clientes[0];
            const canalDist = cliente.Vtweg + " / " + cliente.VtwegVtext;
            oLocal.setProperty("/NomCliente", cliente.Name1);
            oLocal.setProperty("/CanalDistri", canalDist);
            oLocal.setProperty("/CreadoEl", cliente.Fcreacion);
            oLocal.setProperty("/Estado", this.formatter.booleano(cliente.Chk));
            // oLocal.setProperty("/Estado", true);
            oLocal.setProperty("/EstadoAux", cliente.Chk ? 'Error': 'Success');
            oLocal.setProperty("/EstadoDesc", cliente.ChkDesc);
            oLocal.setProperty("/RespCuenta", cliente.RespCuenta); //+@ES20241129
            oLocal.setProperty("/RespCuentaTxt", `(${ cliente.RespCuentaTxt })`); //+@ES20241129
          }
        },

        selCliente: function () {
          // const oService = this.getOwnerComponent().getModel("ReportesService");
          const oService = this.manager.getService("REPORTES");
          const uri = "/MatcodeSet?/$expand=matcode_clientesic_nav";
          const data = {
            Accion: "CLIENTES_IC",
            IsNpag: "1",
            IsRegxpag: "10",
            IsDuplicate: "X",
            IsKunnr: oLocal.getProperty("/Cliente"),
            IsName1: "",
            IsStcd1: "",
            matcode_clientesic_nav: [],
          };

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData) {
              // console.log(
              //   "Data matchcodes (success): InfoClientes - Clientes",
              //   oData
              // );
              this.setDatosCliente(oData.matcode_clientesic_nav.results);
              this.setCamposSector(oData);
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
            },
          });
        },

        onShowPedidoAnio: function (sTipo) {
          let titulo;
          let fecha = new Date();
          let anio = fecha.getFullYear();
          let mes = fecha.getMonth() + 1;
          mes = mes - 3;

          switch (sTipo) {
            case "ANTERIOR":
              titulo = i18n.getText("PedAAnt3UM");
              oLocal.setProperty("/ssVerPedidos/Titulo", titulo);
              oLocal.setProperty("/ssVerPedidos/Tipo", sTipo);

              oLocal.setProperty(
                "/ssVerPedidos/FechaDesde",
                new Date(anio - 1, mes, 1)
              );
              oLocal.setProperty(
                "/ssVerPedidos/FechaHasta",
                new Date(anio - 1, mes + 1, 0)
              );
              this.displayPopup("ListaPedidosAnt");
              break;
            case "ACTUAL":
              titulo = i18n.getText("PedAAct3UM");
              oLocal.setProperty("/ssVerPedidos/Titulo", titulo);
              oLocal.setProperty("/ssVerPedidos/Tipo", sTipo);

              oLocal.setProperty(
                "/ssVerPedidos/FechaDesde",
                new Date(anio, mes, 1)
              );
              oLocal.setProperty(
                "/ssVerPedidos/FechaHasta",
                new Date(anio, mes + 1, 0)
              );
              this.displayPopup("ListaPedidosAct");
              break;
            default:
              return; //break;
          }

          this.onBuscarPedidos(); //+@
          // this.displayPopup("ListaPedidos");
        },

        removeSorters: function (oModel) {
          const bindings = oModel.aBindings;
          if (bindings && bindings.length > 0) {
            bindings[0].aSorters = null;
          }
        },

        removeFilters: function (oModel) {
          const bindings = oModel.aBindings;
          if (bindings && bindings.length > 0) {
            // bindings[0].aFilters = null;
            bindings[0].oCombinedFilter = null;
          }
        },

        callDataPedidos: function (sAccion) {
          const data = {
            Accion: sAccion,
            IsKunnr: oLocal.getProperty("/Cliente"),
            IsFecha1: oLocal.getProperty("/ssVerPedidos/FechaDesde"),
            IsFecha2: oLocal.getProperty("/ssVerPedidos/FechaHasta"),
            IsCampo: oLocal.getProperty("/ssVerPedidos/Campo"),
            IsOrden: oLocal.getProperty("/ssVerPedidos/Orden"),
            reporte_productos_nav: [],
          };

          const isFilter = oLocal.getProperty("/ssVerPedidos/IsFilter");

          // VALIDANDO SI FILTRO EXISTE
          if (isFilter) {
            data.reporte_productos_nav.push(
              oLocal.getProperty("/ssVerPedidos/filters")
            );
          }

          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri = "/ReporteSet?/$expand=reporte_productos_nav";

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
              // console.log(
              //   "Data matchcodes (success): InfoCliente - LISTADO",
              //   oData
              // );
              this.removeSorters(oModel);
              this.removeFilters(oModel); //+@ES
              oModel.setData(oData);
              // HABILITAR BTN DESCARGAR EXCEL
              if (oData.reporte_productos_nav.results.length > 0) {
                oLocal.setProperty("/Excel/BtnEnabled", true);
              }
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataPedidos");
        },

        onBuscarPedidos: function () {
          const sTipo = oLocal.getProperty("/ssVerPedidos/Tipo");

          switch (sTipo) {
            case "ANTERIOR":
              this.callDataPedidos("INFOC_PEDI_ANT");
              break;
            case "ACTUAL":
              this.callDataPedidos("INFOC_PEDI_ACT");
              break;
            default:
              break;
          }
        },

        onMatchcodeCliente: function () {
          this.displayPopup("MatchcodeCliente");
        },

        onConfirmPress: function (oEvent, oDialog) {
          let oSelectedItem;
          let sCodigo;
          oSelectedItem = oEvent.getParameter("listItem");

          switch (oDialog) {
            case "dialogClienteIC":
              sCodigo = oSelectedItem.getCells()[0].getTitle();
              oLocal.setProperty("/Cliente", sCodigo);

              this.onCancelPress(null, "dialogClienteIC");
              break;
            case "dialogExcelIC":
              this.onCancelPress(null, "dialogExcelIC");
              break;
            default:
              break;
          }
        },

        prepareCallReport: function () {
          const data = {
            Accion: "INFOCLIENTE",
            IsKunnr: oLocal.getProperty("/Cliente"),
            reporte_infocred_nav: [],
            reporte_ncuentap_nav: [],
          };

          return data;
        },

        callReport: function (data) {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri =
            "/ReporteSet?/$expand=reporte_infocred_nav,reporte_ncuentap_nav";

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
              // console.log("Data", oData);
              oModel.setData(oData);

              let count1 = oData.reporte_infocred_nav.results.length;
              oLocal.setProperty("/ResumenCount", (count1 <= 15)? count1: 15 ); //+@ES
              let count2 = oData.reporte_ncuentap_nav.results.length;
              oLocal.setProperty("/DetalleCount", (count2 <= 15)? count2: 15); //+@ES

              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });
          this.getView().setModel(oModel, "oDataInfoCliente");
        },

        onBuscarCliente: function () {
          const cliente = oLocal.getProperty("/mcCliente/CodCliente");
          const nombCliente = oLocal.getProperty("/mcCliente/NomCliente");
          const ruc = oLocal.getProperty("/mcCliente/RUC");

          if (cliente === "" && nombCliente === "" && ruc === "" ) {
            MessageBox.warning("Ingrese filtro para buscar.");
          } else {
            this.matchcodeCliente("", false);
          }
        },

        onBuscar: function () {
          const cliente = oLocal.getProperty("/Cliente");
          this.limpiarAntesDeBuscar(cliente); //+@JR
          if (typeof cliente == "string" && cliente.length > 0) {
            this.selCliente();
            const searchData = this.prepareCallReport();
            this.callReport(searchData);
          } else {
            MessageToast.show(`Debe seleccionar un "Cod. Cliente".`);
          }
        },

        onCancelPress: function (oEvent, dialog) {
          switch (dialog) {
            case "dialogClienteIC":
              this.byId(dialog).close();
              this.byId(dialog).destroy();
              this.onLimpiarMCCliente();
              break;
            case "dialogPedidosICAnt":
              this.byId(dialog).close();
              this.byId(dialog).destroy();
              this.onLimpiarListaPed();
              oLocal.setProperty("/Excel/BtnEnabled", false);
              // this.getView().setModel(new JSONModel(), "local>oDataMCCliente");
              break;
            case "dialogPedidosICAct":
              this.byId(dialog).close();
              this.byId(dialog).destroy();
              this.onLimpiarListaPed();
              oLocal.setProperty("/Excel/BtnEnabled", false);
              // this.getView().setModel(new JSONModel(), "local>oDataMCCliente");
              break;
            case "dialogExcelIC":
              this.byId(dialog).close();
              this.byId(dialog).destroy();
              break;
            default:
              break;
          }
        },

        clearFilterSortTable: function () {
          const oTable = this.byId("tblListaPedidos");
          const aColumns = oTable.getColumns();
          aColumns.forEach(function (oColumn) {
            oColumn.setFiltered(false);
            oColumn.setSorted(false);
          });
        },

        onLimpiarCampos: function () {
          this.initialLocal();
          this.getView().setModel(new JSONModel(), "oDataInfoCliente");
          this.clearFilterSortTable();
        },

        onLimpiarMCCliente: function () {
          this.initialMCCliente();
          this.getView().setModel(new JSONModel(), "oDataMCCliente");
        },

        onLimpiarListaPed: function () {
          this.initialSSPedidos();
          this.getView().setModel(new JSONModel(), "oDataPedidos");
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

        prepareDataPedidos: function (sAccion) {
          const postData = {
            Accion: sAccion,
            IsKunnr: oLocal.getProperty("/Cliente"),
            IsFecha1: oLocal.getProperty("/ssVerPedidos/FechaDesde"),
            IsFecha2: oLocal.getProperty("/ssVerPedidos/FechaHasta"),
            IsCampo: oLocal.getProperty("/ssVerPedidos/Campo"),
            IsOrden: oLocal.getProperty("/ssVerPedidos/Orden"),
            reporte_productos_nav: [],
          };

          const isFilter = oLocal.getProperty("/ssVerPedidos/IsFilter");

          // VALIDANDO SI FILTRO EXISTE
          if (isFilter) {
            postData.reporte_productos_nav.push(
              oLocal.getProperty("/ssVerPedidos/filters")
            );
          }

          return postData;
        },

        onDescargar: function () {
          const nombTabla = oLocal.getProperty("/ssVerPedidos/NombreTabla");
          const oTable = this.byId(nombTabla);
          const sfileName = oLocal.getProperty("/Excel/FileText");
          const oInputNombre = this.getView().byId("txtNombreArchivoIC");

          if (!sfileName) {
            oInputNombre.setValueState("Error");
            return;
          } else {
            oInputNombre.setValueState("None");
          }

          oLocal.setProperty("/Excel/FileText", "Reporte InfoCliente");

          const aCols = [
            {
              // label: "ORG. VENTAS",
              label: " ",
              property: "Vkorg",
              width: 15,
              type: exportLibrary.EdmType.String,
            },
            {
              // label: "MATERIAL",
              label: " ",
              property: "Matnr",
              width: 15,
              textAlign: "center",
              type: exportLibrary.EdmType.String,
            },
            {
              // label: "DENOMINACION",
              label: " ",
              property: "Maktx",
              width: 30,
              type: exportLibrary.EdmType.String,
            },
            {
              // label: "CANTIDAD",
              label: " ",
              property: "Kwmeng",
              width: 15,
              textAlign: "center",
              type: exportLibrary.EdmType.String,
            },
            {
              // label: "UM",
              label: " ",
              property: "Vrkme",
              width: 10,
              textAlign: "center",
              type: exportLibrary.EdmType.String,
            },
            {
              // label: "VALOR NETO",
              label: " ",
              property: "Netwr",
              width: 15,
              type: exportLibrary.EdmType.String,
            },
            {
              // label: "MONEDA",
              label: " ",
              property: "Waerk",
              width: 10,
              textAlign: "center",
              type: exportLibrary.EdmType.String,
            },
          ];
          const oRowBinding = oTable.getBinding("rows");
          // const aSelectedIndices = oTable.getSelectedIndices();

          let aCustomHeader = [
            {
              Vkorg: `Código: ${oLocal.getProperty("/Cliente")}`,
              Matnr: "",
              Maktx: "",
            },
            {
              Vkorg: `Cliente: ${oLocal.getProperty("/NomCliente")}`,
              Matnr: "",
              Maktx: "",
            },
            {
              Vkorg: `Desde: ${this.formatter.fecha(
                oLocal.getProperty("/ssVerPedidos/FechaDesde")
              )}`,
              Matnr: "",
              Maktx: "",
            },
            {
              Vkorg: `Hasta: ${this.formatter.fecha(
                oLocal.getProperty("/ssVerPedidos/FechaHasta")
              )}`,
              Matnr: "",
              Maktx: "",
            },
            { Vkorg: "", Matnr: "", Maktx: "" },
          ];

          // let aData = [];

          if (oRowBinding.getLength() > 0) {
            const sTipo = oLocal.getProperty("/ssVerPedidos/Tipo");
            const param =
              sTipo === "ANTERIOR" ? "INFOC_PEDI_ANT" : "INFOC_PEDI_ACT";
            const searchData = this.prepareDataPedidos(param);

            this.ondataExcelAll(searchData, true, nombTabla).then((oData) => {
              const newElement = [
                {
                  Kwmeng: "CANTIDAD",
                  Maktx: "DENOMINACION",
                  Matnr: "MATERIAL",
                  Netwr: "VALOR NETO",
                  Vkorg: "ORG. VENTAS",
                  Vrkme: "UM",
                  Waerk: "MONEDA",
                },
              ];
              const exportData = newElement.concat(
                oData.reporte_productos_nav.results
              );
              // console.log("Datos a exportar All:", exportData);
              let aExportData = aCustomHeader.concat(exportData);
              this.exportToExcel(aExportData, sfileName, aCols);
            });
          }
          // else {
          //   aData = aSelectedIndices.map((index) =>
          //     oRowBinding.getContexts()[index].getObject()
          //   );
          //   // console.log("Datos a exportar Choose:", aData);
          //   this.exportToExcel(aData, sfileName, aCols);
          // }
          this.onCancelPress(null, "dialogExcelIC");
        },

        exportToExcel: function (data, fileName, columns) {
          const oSettings = {
            workbook: {
              columns: columns,
              context: {
                sheetName: "Datos Exportados",
                // No incluir `applyFilters: true` para evitar los filtros
              },
            },
            dataSource: data,
            fileName: fileName,
            worker: true,
          };

          const oSheet = new Spreadsheet(oSettings);
          oSheet.build().finally(function () {
            oSheet.destroy();
          });
        },

        ondataExcelAll: function (data, busy, nombTabla) {
          // const oTable = this.byId(nombTabla);
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri = "/ReporteSet?/$expand=reporte_productos_nav";

          busy && oLocal.setProperty("/loadingTbl", true);

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "descarga": "X",
            "mobile": this.manager.getIndMobile(),
          });
          
          return new Promise((resolve, reject) => {
            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("Data matchcodes (success): InfoCliente - LISTADO", oData);
                oModel.setData(oData);
                busy && oLocal.setProperty("/loadingTbl", false);
                resolve(oData);
              }.bind(this),
              error: function (oError) {
                console.error("Data matchcodes (error):", oError);
                busy && oLocal.setProperty("/loadingTbl", false);
                reject(oError);
              },
            });
          });
        },

        onMatchcodeDescargar: function (oEvent, nombTabla) {
          oLocal.setProperty("/ssVerPedidos/NombreTabla", nombTabla);
          this.displayPopup("DescargaExcel");
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
            "Vkorg",
            "Matnr",
            "Maktx",
            "Kwmeng",
            "Vrkme",
            "Netwr",
            "Waerk",
          ];
          let isFilter = oLocal.getProperty("/ssVerPedidos/IsFilter");
          for (const item of campos) {
            const valor = oLocal.getProperty(`/ssVerPedidos/filters/${item}`);
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

          oLocal.setProperty("/ssVerPedidos/Campo", campo); //+@
          oLocal.setProperty("/ssVerPedidos/Orden", orden); //+@
          this.onBuscarPedidos();

          // Continuar con la ordenación predeterminada
          // oColumn.setSorted(true);  // Marcar la columna como ordenada
          // oColumn.setSortOrder(sSortOrder);  // Aplicar el tipo de ordenación
        },

        onTableFilter: function (oEvent) {
          const oColumn = oEvent.getParameter("column"); // Obtener la columna que se está filtrando
          const sValue = oEvent.getParameter("value"); // Obtener el valor a filtrar
          const nameColumn = oColumn.getProperty("filterProperty");
          // let campo = nameColumn.toUpperCase();
          // let filtro = sValue;

          oLocal.setProperty(`/ssVerPedidos/filters/${nameColumn}`, sValue); //+@
          oLocal.setProperty("/ssVerPedidos/IsFilter", this.validarFiltros()); //+@

          //{+@
          oEvent.preventDefault();
          if (sValue.length == 0) {
            oColumn.setFiltered(false);
          } else {
            oColumn.setFiltered(true);
          }
          //}+@

          this.onBuscarPedidos();
        },

        onSelectCheck: function (oEvent) {
          var bSelected = true; //oEvent.getParameter("selected");
			    oLocal.setProperty("/Estado", bSelected); //+@
        },

        onRowsUpdated: function (oEvent) {
          const complete_url = window.location.href;
          let classTheme = "colorInfoCliVencidos";
          if (!this.manager.isMobile()) {
            classTheme = complete_url.includes("gc_farmex_light") ? "colorInfoCliVencidosLight" : "colorInfoCliVencidosDark";
          }
          const oTable = oEvent.getSource();
          const aRows = oTable.getRows();
          const fields = ["KlimuVen", "Deu930", "Deu3160", "Deu6190", "Deu91"];
          if (aRows.length > 0) {
            aRows.forEach((oRow) => {
              oRow.getCells().forEach((oCell) => {
                let field = oCell.mBindingInfos["text"].binding.sPath;
                oCell.removeStyleClass(classTheme);
                for (const f of fields) {
                  if (f === field && oCell.getText() !== "0.00" && !oCell.getText().includes("-")) {
                    oCell.addStyleClass(classTheme);
                  }
                }
              });
            });
          }
        },
      }
    );
  }
);
