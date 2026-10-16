sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/ui/model/type/String",
    "sap/m/SearchField",
    "sap/ui/core/Fragment",
    "sap/ui/table/Column",
    "sap/m/Text",
    "sap/m/Label",
    "sap/m/BusyDialog",
    "sap/m/PDFViewer",
    "sap/m/library",
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
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator,
    Spreadsheet,
    exportLibrary,
    TypeString,
    SearchField,
    Fragment,
    UIColumn,
    Text,
    Label,
    BusyDialog,
    PDFViewer,
    mobileLibrary,
    Formatter,
    Manager
  ) {
    "use strict";

    var path =
      "com.axelera.pe.gestioncomercial.view.m2-reportes.reporte-despacho";
    var oLocal = new JSONModel();
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m2-reportes.ReporteDespacho",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("R06", "Clear", this.onInitRepDespacho, this);
        },

        onInitRepDespacho: function (channel, event, oData) {
          this.initialization(oData.active);
          if (this.manager.isMobile()) {
            this.byId("btnDescargarRD").setVisible(false);
          }
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            this.matchcodeOrgVentas();
            this.matchcodeOfiVentas();
            this.matchcodePuestoExp();
            this.manager.setBusy(false);
          }
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            Sociedad: "1000", //1000 corresponde a la sociedad de Farmex
            OrgVentas1: "",
            OrgVentas2: "",
            FechaReg1: new Date(), // null
            FechaReg2: new Date(), // null
            PuestoExp1: "",
            PuestoExp2: "",
            Cliente1: "",
            Cliente2: "",
            NroPedido1: "",
            NroPedido2: "",
            OfiVentas1: "",
            OfiVentas2: "",
            Comercial1: "",
            Comercial2: "",
            Campo: "",
            Orden: "",
            Tabla: {
              items: [],
            },
            mcCliente: {
              CodCliente: "",
              NombreCliente: "",
              RUC: "",
            },
            mcComercial: {
              CodComercial: "",
              NombreComercial: "",
            },
            page: {
              CantFilas: 10,
              Indice: 0,
              TotalItems: 0,
              Page: 1,
              TotalPages: 0,
              PrevPageBtn: false,
              NextPageBtn: false,
            },
            nControl: null,
            Excel: {
              FileText: "",
              BtnEnabled: false,
            },
            Pdf: {
              Source: "",
              Title: "",
            },
            IsFilter: false,
            filters: {
              Kunnr: "",
              Name1: "",
              Bstkd: "",
              Erdat: "",
              Aubel: "",
              Xblnr: "",
              Xblnr1: "",
              Ctrans: "",
              Ntrans: "",
              Vkorg: "",
              Arktx: "",
              Werks: "",
              Werkstxt: "",
              Charg: "",
              Lfimg: "0",
              Vkbur: "",
              Vkburtxt: "",
              Vkgrp: "",
              Vkgrptxt: "",
              Sname: "",
            },
            loadingTbl: false, //+@
            IsMobile: this.manager.isMobile(), //+@dev-asolar
          });
        },

        initialMCCliente: function () {
          oLocal.setProperty("/mcCliente", {
            CodCliente: "",
            NombreCliente: "",
            RUC: "",
          });
          this.getView().setModel(new JSONModel(), "oDataMCCliente");
        },

        initialMCComercial: function () {
          oLocal.setProperty("/mcComercial", {
            CodComercial: "",
            NombreComercial: "",
          });
          this.getView().setModel(new JSONModel(), "oDataMCComerciales");
        },

        //#region OBTENER MATCHCODES
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
              // console.log("Data matchcode org ventas (success)", oData);
              this.manager.setBusy(false);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOrgVentas");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcode org ventas (error):", oError);
              this.manager.setBusy(false);
            }.bind(this),
          });
          this.getView().setModel(oModel, "oDataMCOrgVentas");
        },

        matchcodePuestoExp: function (popup) {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri = "/EtPuestoExpeSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "accion": "PUESTOEXPE",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.read(uri, {
            method: "GET",
            success: function (oData, oResponse) {
              // console.log("Data matchcode puesto exp (success)", oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodePuestoExp");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcode puesto exp (error)");
            },
          });

          this.getView().setModel(oModel, "oDataMCPuestoExp");
        },

        matchcodeCliente: function (popup) {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri =
            "/MatcodeSet?/$expand=matcode_vkorg_nav,matcode_clientesrd_nav";
          const data = {
            Accion: "CLIENTES_RD",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsKunnr: oLocal.getProperty("/mcCliente/CodCliente"), //+@
            IsName1: oLocal.getProperty("/mcCliente/NombreCliente"), //+@
            IsStcd1: oLocal.getProperty("/mcCliente/RUC"), //+@
            EsRegtot: "",
            matcode_vkorg_nav: [],
            matcode_clientesrd_nav: [],
          };
          const dataFiltros = oLocal.getData();
          let filaRango,
            valor1 = "",
            valor2 = "";

          valor1 = dataFiltros.OrgVentas1.trim();
          valor2 = dataFiltros.OrgVentas2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.matcode_vkorg_nav.push(filaRango);
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
              // console.log("Data matchcodeCliente (success)", oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeCliente");
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodeCliente (error)", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });

          this.getView().setModel(oModel, "oDataMCCliente");
        },

        matchcodeOfiVentas: function (popup) {
          const oService = this.manager.getService("PEDIDOS");
          const oModel = new JSONModel();
          const uri = "/EtOfiVentasSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "accion": "OFIVENTAS",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.read(uri, {
            method: "GET",
            success: function (oData, oResponse) {
              // console.log("Data matchcodes OfiVentas (success)", oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOfiVentas");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes OfiVentas (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataMCOfiVentas");
        },

        matchcodeComercial: function (popup) {
          // const oService = this.getOwnerComponent().getModel("PedidosService");
          const oService = this.manager.getService("PEDIDOS");
          const oModel = new JSONModel();
          const uri = "/ConsultaSet?/$expand=consulta_comerciales_nav";
          const data = {
            Accion: "COMERCIALES",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsKunnr: oLocal.getProperty("/mcComercial/CodComercial"), //+@
            IsName: oLocal.getProperty("/mcComercial/NombreComercial"), //+@
            consulta_comerciales_nav: [],
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
            success: function (oData, oResponse) {
              // console.log("Data matchcodes Comerciales (success)", oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeComercial");
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes Comerciales (error)", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });

          this.getView().setModel(oModel, "oDataMCComerciales");
        },

        onMatchcodeOrgVentas: function (nControl) {
          oLocal.setProperty("/nControl", nControl);
          this.displayPopup("MatchcodeOrgVentas");
          // this.matchcodeOrgVentas(true);
        },

        onMatchcodePuestoExp: function (nControl) {
          oLocal.setProperty("/nControl", nControl);
          this.displayPopup("MatchcodePuestoExp");
          // this.matchcodePuestoExp(true);
        },

        onMatchcodeCliente: function (nControl) {
          // const orgVentas = oLocal.getProperty("/OrgVentas1");
          // // // if (orgVentas.length == 0) {
          // // //   MessageBox.warning("Debe seleccionar una Org. Ventas.");
          // // //   return;
          // // // }

          oLocal.setProperty("/nControl", nControl);
          this.displayPopup("MatchcodeCliente");
          // this.matchcodeCliente(true);
        },

        onMatchcodeOfiVentas: function (nControl) {
          oLocal.setProperty("/nControl", nControl);
          this.displayPopup("MatchcodeOfiVentas");
          // this.matchcodeOfiVentas(true);
        },

        onMatchcodeComercial: function (nControl) {
          oLocal.setProperty("/nControl", nControl);
          this.displayPopup("MatchcodeComercial");
          // this.matchcodeComercial(true);
        },

        onMatchcodeMultiOrgVentas: function () {
          const sFragmentName = `${path}.MatchcodeMultiOrgVentas`;
          oLocal.setProperty("/nControl", "");

          this.loadFragment({
            name: sFragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Vkorg",
                  key: "Vkorg",
                  type: "string",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 7,
                    }
                  ),
                },
              ]);

              const mtxtOrgVentas = this.byId("mtxtOrgVentasRD");
              oDialog.setTokens(mtxtOrgVentas.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiFechaReg: function () {
          const sFragmentName = `${path}.MatchcodeMultiFechaReg`;
          oLocal.setProperty("/nControl", "");
          this.loadFragment({
            name: sFragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Fecha",
                  key: "Fecha",
                  type: "date",
                },
              ]);
              const mtxtFechaReg = this.byId("mtxtFechaRegRD");
              oDialog.setTokens(mtxtFechaReg.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiPuestoExp: function () {
          const sFragmentName = `${path}.MatchcodeMultiPuestoExpedicion`;
          oLocal.setProperty("/nControl", "");
          this.loadFragment({
            name: sFragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Clave",
                  key: "Clave",
                  type: "date",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 10,
                    }
                  ),
                },
              ]);

              const mtxtPuestoExpe = this.byId("mtxtPuestoExpeRD");
              oDialog.setTokens(mtxtPuestoExpe.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiCliente: function () {
          // const orgVentas = oLocal.getProperty("/OrgVentas1");
          // // // if (orgVentas.length == 0) {
          // // //   MessageBox.warning("Debe seleccionar una Org. Ventas.");
          // // //   return;
          // // // }
          const sFragmentName = `${path}.MatchcodeMultiCliente`;
          oLocal.setProperty("/nControl", "");
          this.loadFragment({
            name: sFragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Clave",
                  key: "Clave",
                  type: "date",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 10,
                    }
                  ),
                },
              ]);

              const mtxtCliente = this.byId("mtxtClienteRD");
              oDialog.setTokens(mtxtCliente.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiNroPedido: function () {
          const sFragmentName = `${path}.MatchcodeMultiNroPedido`;
          oLocal.setProperty("/nControl", "");
          this.loadFragment({
            name: sFragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Clave",
                  key: "Clave",
                  type: "date",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 10,
                    }
                  ),
                },
              ]);

              const mtxtNroPedido = this.byId("mtxtNroPedidoRD");
              oDialog.setTokens(mtxtNroPedido.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiOfiVentas: function () {
          const sFragmentName = `${path}.MatchcodeMultiOfiVentas`;
          oLocal.setProperty("/nControl", "");
          this.loadFragment({
            name: sFragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Clave",
                  key: "Clave",
                  type: "date",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 10,
                    }
                  ),
                },
              ]);

              const mtxtOfiVentas = this.byId("mtxtOfiVentasRD");
              oDialog.setTokens(mtxtOfiVentas.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiComercial: function () {
          const sFragmentName = `${path}.MatchcodeMultiComercial`;
          oLocal.setProperty("/nControl", "");
          this.loadFragment({
            name: sFragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Clave",
                  key: "Clave",
                  type: "date",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 10,
                    }
                  ),
                },
              ]);

              const mtxtComercial = this.byId("mtxtComercialRD");
              oDialog.setTokens(mtxtComercial.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },
        //#endregion

        //#region ACCIONES SELECCION MULTIPLE
        whitespace2Char: function (sOriginalText) {
          const sWhitespace = " ",
            sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

          if (typeof sOriginalText !== "string") {
            return sOriginalText;
          }

          return sOriginalText.replaceAll(
            sWhitespace + sWhitespace,
            sWhitespace + sUnicodeWhitespaceCharacter
          ); // replace spaces
        },

        onOkPress: function (oEvent, oDialog) {
          const aTokens = oEvent.getParameter("tokens");
          const mtxtOrgVentas = this.byId("mtxtOrgVentasRD");
          const mtxtFechaReg = this.byId("mtxtFechaRegRD");
          const mtxtPuestoExpe = this.byId("mtxtPuestoExpeRD");
          const mtxtCliente = this.byId("mtxtClienteRD");
          const mtxtNroPedido = this.byId("mtxtNroPedidoRD");
          const mtxtOfiVentas = this.byId("mtxtOfiVentasRD");
          const mtxtComercial = this.byId("mtxtComercialRD");
          aTokens.forEach(
            function (oToken) {
              oToken.setText(this.whitespace2Char(oToken.getText()));
            }.bind(this)
          );

          switch (oDialog) {
            case "dialogMultiOrgVentasRD":
              mtxtOrgVentas.setTokens(aTokens);
              break;
            case "dialogMultiFechaRegRD":
              mtxtFechaReg.setTokens(aTokens);
              break;
            case "dialogMultiPuestoExpeRD":
              mtxtPuestoExpe.setTokens(aTokens);
              break;
            case "dialogMultiClienteRD":
              mtxtCliente.setTokens(aTokens);
              break;
            case "dialogMultiNroPedidoRD":
              mtxtNroPedido.setTokens(aTokens);
              break;
            case "dialogMultiOfiVentasRD":
              mtxtOfiVentas.setTokens(aTokens);
              break;
            case "dialogMultiComercialRD":
              mtxtComercial.setTokens(aTokens);
              break;
            default:
              break;
          }
          if (oDialog.length > 0) {
            this.byId(oDialog).close();
          }
        },

        onCancelPress: function (oEvent, oDialog) {
          // console.error("oDialog Cancel", oDialog);
          switch (oDialog) {
            case "dialogMaterialRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogOrgVentasRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogOfiVentasRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogFechaRegRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogComercialRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              // limpiar tabla y campos filtro
              // this.getView().setModel(
              //   new JSONModel(),
              //   "oDataMCComerciales"
              // );
              this.initialMCComercial();
              break;
            case "dialogClienteRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              // limpiar tabla y campos filtro
              // this.getView().setModel(new JSONModel(), "oDataMCCliente");
              this.initialMCCliente();
              break;
            case "dialogPuestoExpeRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogNroPedidoRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogMultiClienteRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogMultiComercialRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogExcelRD":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              oLocal.setProperty("/Excel/FileText", "Reporte Despacho");
              break;
            default:
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
          }
          // if (oDialog.length > 0) {
          //   this.byId(oDialog).close();
          // }
        },

        onAfterClose: function (oEvent, oDialog) {
          if (oDialog.length > 0) {
            this.byId(oDialog).destroy();
          }
        },
        //#endregion

        onConfirmPress: function (oEvent, oDialog) {
          const n = oLocal.getProperty("/nControl");
          let oSelected, oCells; // oEvent.getParameter("selectedItem")

          switch (oDialog) {
            case "dialogOrgVentasRD":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/OrgVentas${n}`, oCells[0].getTitle());
              break;

            case "dialogPuestoExpRD":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/PuestoExp${n}`, oCells[0].getTitle());
              break;

            case "dialogClienteRD":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/Cliente${n}`, oCells[0].getTitle());
              this.onValidarCampos();
              this.onCancelPress(null, oDialog);
              break;

            case "dialogOfiVentasRD":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/OfiVentas${n}`, oCells[0].getTitle());
              break;

            case "dialogComercialRD":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/Comercial${n}`, oCells[0].getTitle());
              this.onValidarCampos();
              this.onCancelPress(null, oDialog);
              break;

            default:
              break;
          }

          this.onValidarCampos();
        },

        // onCloseDialog: function (oEvent, dialog) {
        //   this.byId(dialog).close();
        // },

        onCloseDialog: function (oEvent, sId) {
          let oDialog = this.byId(sId);
          if (oDialog) {
            oDialog.close();
            oDialog.destroy();
          }
        },

        descargarPdf: function (url, titulo) {
          oLocal.setProperty("/Pdf/Source", url);
          oLocal.setProperty("/Pdf/Title", titulo);
          this.displayPopup("DescargaPdf");
        },

        onVerPDFGuiaRem: function (oEvent) {
          const bindingContext = oEvent
            .getSource()
            .getBindingContext("oDataRepDespacho");
          let nombGuia = bindingContext.getProperty("NombGuia");
          // let xblnr = ""; //"01-0FP01-0000644"

          // // nombFact = "20100141583-01-F001-00148714";
          // if (nombFact.length == 28) {
          //   xblnr = nombFact.substring(12, 28);
          // }

          if (nombGuia === "") {
            MessageToast.show(i18n.getText("MsgCPErrVerGuia"));
            return;
          }

          // const oService = this.getOwnerComponent().getModel("PedidosService");
          // const oService = new sap.ui.model.odata.ODataModel(
          //   "/sap/opu/odata/sap/ZSD_RC_PEDIDOS_SRV/",
          //   false
          // );

          const oService = this.manager.getService("REPORTES", false);
          // const uri = `/PdfReaderSet('${nombGuia}')/$value`;
          const uri = `/FileReaderSet(Modulo='DESPACHO',Filtros='${nombGuia}')/$value`;

          this.manager.setBusy(true);
          

          oService.read(uri, {
            success: function (oData, oResponse) {
              // console.log({oData});
              // console.log({oResponse});
              if (oResponse.body.length == 0) {
                this.manager.setBusy(false);
                MessageToast.show("Archivo no encontrado.");
                return;
              }

              let oPdfViewer = new PDFViewer();
              this.getView().addDependent(oPdfViewer);
              oPdfViewer.setSource(oResponse.requestUri);
              oPdfViewer.setTitle("EXPORTAR A PDF");

              this.manager.setBusy(false);              
              // oPdfViewer.open();
              //{
              // sap.ui.core.util.Export()
              // const fileSave = sap.ui.core.util.File.save;
              
              this.manager.isMobile()
              ? cordova.InAppBrowser.open(oResponse.requestUri, "_system", "location=no")
              : oPdfViewer.open();
              // : this.descargarPdf(oResponse.requestUri, nombGuia);

              // ? mobileLibrary.URLHelper.redirect(oResponse.requestUri, true)
                // ? fileSave(oResponse.body, nombGuia, "pdf", "application/pdf")
                // : fileSave(oResponse.body, nombGuia, "pdf", "application/pdf");
              //}
            }.bind(this),
            error: function (oError) {
              console.error(oError);
              this.manager.setBusy(false);
            }.bind(this),
          });
        },

        onMatchcodeSearch: function (oEvent) {
          const sValue = oEvent.getParameter("value");

          let aFilters;
          switch (oDialog) {
            case "dialogOfiVentasRD":
              aFilters = [
                new Filter("Vkbur", FilterOperator.Contains, sValue),
                new Filter("Bezei", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogOrgVentasRD":
              aFilters = [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogPuestoExpRD":
              aFilters = [
                new Filter("Vstel", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue),
              ];
              break;
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

        setDataRango: function (valor1, valor2) {
          let filaRango = {
            Sign: "I",
            Option: "",
            Low: "",
            High: "",
          };

          valor1 = valor1 ? valor1 : "";
          valor2 = valor2 ? valor2 : "";

          if (valor2.length > 0) {
            if (valor1.length > 0) {
              filaRango.Option = "BT";
              filaRango.Low = valor1;
              filaRango.High = valor2;
            } else {
              return undefined;
            }
          } else if (valor1.length > 0) {
            filaRango.Option = "EQ";
            filaRango.Low = valor1;
          } else {
            return undefined;
          }

          return filaRango;
        },

        prepareCallReport: function (nPag, nRegxpag) {
          const data = {
            Accion: "DESPACHO",
            IsNpag: `${nPag}`,
            IsRegxpag: `${nRegxpag}`,
            IsCampo: oLocal.getProperty("/Campo"),
            IsOrden: oLocal.getProperty("/Orden"),
            IsExport: "",
            reporte_vkorg_nav: [], // org ventas
            reporte_kunnr_nav: [], // cliente
            reporte_erdat_nav: [], // fecha reg
            reporte_aubel_nav: [], // nro pedido - docu comercial
            reporte_vkbur_nav: [], // ofi ventas
            reporte_vstel_nav: [], // puesto expe
            reporte_kunnr2_nav: [], // comercial ** reporte_kunnr2_nav / reporte_pernr_nav
            reporte_despachoped_nav: [],
            reporte_filterrd_nav: [],
          };

          const isFilter = oLocal.getProperty("/IsFilter");

          // VALIDANDO SI FILTRO EXISTE
          if (isFilter) {
            // data.Accion = "CONSULTASTOCK_FLTR";
            data.reporte_filterrd_nav.push(oLocal.getProperty("/filters"));
          }

          const dataFiltros = oLocal.getData();
          let filaRango,
            valor1 = "",
            valor2 = "";

          // Org. ventas
          valor1 = dataFiltros.OrgVentas1.trim();
          valor2 = dataFiltros.OrgVentas2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.reporte_vkorg_nav.push(filaRango);
          }
          // Fecha reg.
          valor1 = this.formatter.getDateWithFormat(dataFiltros.FechaReg1);
          valor2 = this.formatter.getDateWithFormat(dataFiltros.FechaReg2);
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.reporte_erdat_nav.push(filaRango);
          }
          // Puesto exp.
          valor1 = dataFiltros.PuestoExp1.trim();
          valor2 = dataFiltros.PuestoExp2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.reporte_vstel_nav.push(filaRango);
          }
          // Cliente
          valor1 = dataFiltros.Cliente1.trim();
          valor2 = dataFiltros.Cliente2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.reporte_kunnr_nav.push(filaRango);
          }
          // Nro. pedidos
          valor1 = dataFiltros.NroPedido1.trim();
          valor2 = dataFiltros.NroPedido2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.reporte_aubel_nav.push(filaRango);
          }

          // Ofi. ventas
          valor1 = dataFiltros.OfiVentas1.trim();
          valor2 = dataFiltros.OfiVentas2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.reporte_vkbur_nav.push(filaRango);
          }
          // Comercial
          valor1 = dataFiltros.Comercial1.trim();
          valor2 = dataFiltros.Comercial2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.reporte_kunnr2_nav.push(filaRango);
          }

          // MULTI-INPUTS
          const mtxtOrgVentas = this.byId("mtxtOrgVentasRD");
          const mtxtFechaReg = this.byId("mtxtFechaRegRD");
          const mtxtPuestoExpe = this.byId("mtxtPuestoExpeRD");
          const mtxtCliente = this.byId("mtxtClienteRD");
          const mtxtNroPedido = this.byId("mtxtNroPedidoRD");
          const mtxtOfiVentas = this.byId("mtxtOfiVentasRD");
          const mtxtComercial = this.byId("mtxtComercialRD");

          // Textos
          if (mtxtOrgVentas.getValue().length > 0) {
            data.reporte_vkorg_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtOrgVentas.getValue(),
              High: "",
            });
          }
          if (mtxtFechaReg.getValue().length > 0) {
            data.reporte_erdat_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtFechaReg.getValue(),
              High: "",
            });
          }
          if (mtxtPuestoExpe.getValue().length > 0) {
            data.reporte_vstel_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtPuestoExpe.getValue(),
              High: "",
            });
          }
          if (mtxtCliente.getValue().length > 0) {
            data.reporte_kunnr_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtCliente.getValue(),
              High: "",
            });
          }
          if (mtxtNroPedido.getValue().length > 0) {
            data.reporte_aubel_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtNroPedido.getValue(),
              High: "",
            });
          }
          if (mtxtOfiVentas.getValue().length > 0) {
            data.reporte_vkbur_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtOfiVentas.getValue(),
              High: "",
            });
          }
          if (mtxtComercial.getValue().length > 0) {
            data.reporte_kunnr2_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtComercial.getValue(),
              High: "",
            });
          }

          // Tokens
          mtxtOrgVentas.getTokens().forEach(
            function (oToken) {
              data.reporte_vkorg_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );
          mtxtFechaReg.getTokens().forEach(
            function (oToken) {
              data.reporte_erdat_nav.push(this.formatter.rangeSAPFecha(oToken));
            }.bind(this)
          );
          mtxtPuestoExpe.getTokens().forEach(
            function (oToken) {
              data.reporte_vstel_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );
          mtxtCliente.getTokens().forEach(
            function (oToken) {
              data.reporte_kunnr_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );
          mtxtNroPedido.getTokens().forEach(
            function (oToken) {
              data.reporte_aubel_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );
          mtxtOfiVentas.getTokens().forEach(
            function (oToken) {
              data.reporte_vkbur_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );
          mtxtComercial.getTokens().forEach(
            function (oToken) {
              data.reporte_kunnr2_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );

          return data;
        },

        onBuscar: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = 1;
          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", 0);

          // // // const orgVentas1 = oLocal.getProperty("/OrgVentas1");
          const fechaReg1 = oLocal.getProperty("/FechaReg1");
          // // // if (!orgVentas1 && !fechaReg1) {
          // // //   MessageBox.error(i18n.getText("MsgRDValida1"));
          // // //   return;
          // // // }
          // // // if (!orgVentas1) {
          // // //   MessageBox.error(i18n.getText("MsgRDValida2"));
          // // //   return;
          // // // }
          if (!fechaReg1) {
            MessageBox.error(i18n.getText("MsgRDValida3"));
            return;
          }
          const searchData = this.prepareCallReport(page, cantFilas);
          // this.manager.auditoria(7); //-@20260820
          this.callReport(searchData, true);
        },

        callReport: function (data, busy) {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri =
            "/ReporteSet?/$expand=reporte_vkorg_nav," +
            "reporte_kunnr_nav," +
            "reporte_erdat_nav," +
            "reporte_aubel_nav," +
            "reporte_vkbur_nav," +
            "reporte_vstel_nav," +
            "reporte_pernr_nav," +
            "reporte_filterrd_nav";

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
            success: function (oData, oResponse) {
              // console.log("Listar Reporte Despacho (success)", oData); //+@ES
              this.removeSorters(oModel);
              this.removeFilters(oModel); //+@ES
              oModel.setData(oData);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.updatePagination(oData.EsRegtot);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Listar Reporte Despacho (error)", oError); //+@ES
              busy && oLocal.setProperty("/loadingTbl", false); //busyDialog.close();
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });

          this.getView().setModel(oModel, "oDataRepDespacho");
        },

        clearFilterSortTable: function () {
          const oTable = this.manager.isMobile() ? this.byId("tblReporteDespachoMob") : this.byId("tblReporteDespacho");
          const aColumns = oTable.getColumns();
          aColumns.forEach(function (oColumn) {
            oColumn.setFiltered(false);
            oColumn.setSorted(false);
          });
        },

        // LIMPIAR CAMPOS
        onLimpiarCampos: function () {
          const aIdMultiInputs = [
            { id: "mtxtOrgVentasRD" },
            { id: "mtxtFechaRegRD" },
            { id: "mtxtPuestoExpeRD" },
            { id: "mtxtClienteRD" },
            { id: "mtxtNroPedidoRD" },
            { id: "mtxtOfiVentasRD" },
            { id: "mtxtComercialRD" },
          ];

          for (const item of aIdMultiInputs) {
            const mtxt = this.byId(item.id);
            mtxt.removeAllTokens();
            mtxt.setValue("");
          }

          this.initialLocal();
          this.onValidarCampos();

          this.getView().setModel(new JSONModel(), "oDataRepDespacho"); // LIMPIANDO TABLA
          this.clearFilterSortTable();
        },

        onValidarCampos: function () {
          const oInputs = [
            { id1: "txtOrgVentas1RD", id2: "txtOrgVentas2RD" },
            { id1: "txtFechaReg1RD", id2: "txtFechaReg2RD" },
            { id1: "txtPuestoExp1RD", id2: "txtPuestoExp2RD" },
            { id1: "txtCliente1RD", id2: "txtCliente2RD" },
            { id1: "txtNroPedido1RD", id2: "txtNroPedido2RD" },
            { id1: "txtOfiVentas1RD", id2: "txtOfiVentas2RD" },
            { id1: "txtComercial1RD", id2: "txtComercial2RD" },
          ];

          for (const item of oInputs) {
            const txt1 = this.getView().byId(item.id1);
            const txt2 = this.getView().byId(item.id2);
            if (txt1.getValue().length > 0) {
              // txt2.setEnabled(true);
            } else {
              // txt2.setEnabled(false);
              txt2.setValue("");
            }
          }
        },

        onBuscarCliente: function () {
          const cliente = oLocal.getProperty("/mcCliente/CodCliente");
          const nombCliente = oLocal.getProperty("/mcCliente/NombreCliente");
          const ruc = oLocal.getProperty("/mcCliente/RUC");

          if (cliente === "" && nombCliente === "" && ruc === "" ) {
            MessageBox.warning("Ingrese filtro para buscar.");
          } else {
            this.matchcodeCliente();
          }
        },

        onLimpiarCliente: function () {
          this.initialMCCliente();
          this.getView().setModel(new JSONModel(), "oDataMCCliente");
        },

        onBuscarComercial: function () {
          const comercial = oLocal.getProperty("/mcComercial/CodComercial");
          const nombComercial = oLocal.getProperty("/mcComercial/NombreComercial");

          if (comercial === "" && nombComercial === "") {
            MessageBox.warning("Ingrese filtro para buscar.");
          } else {
            this.matchcodeComercial();
          }
        },

        onLimpiarComercial: function () {
          this.initialMCComercial();
          this.getView().setModel(new JSONModel(), "oDataMCComercial");
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

        //#region PAGINATION

        updatePagination: function (total) {
          let totalItems = total;
          let cantFilas = oLocal.getProperty("/page/CantFilas");
          let totalPages = Math.ceil(totalItems / cantFilas);

          oLocal.setProperty("/page/TotalPages", totalPages);
          oLocal.setProperty("/page/TotalItems", totalItems);
          this.fnNavButtonsEnable();

          if (total > 0) {
            oLocal.setProperty("/Excel/BtnEnabled", true);
          }
        },

        onNextPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          const totalItems = oLocal.getProperty("/page/TotalItems");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          if (indice + cantFilas < totalItems) {
            indice += cantFilas;
            page += 1;
            oLocal.setProperty("/page/Indice", indice);
            oLocal.setProperty("/page/Page", page);

            const searchData = this.prepareCallReport(page, cantFilas);
            this.callReport(searchData, true);
          }
        },

        onPreviousPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          if (indice > 0) {
            indice -= cantFilas;
            page -= 1;
            oLocal.setProperty("/page/Indice", indice);
            oLocal.setProperty("/page/Page", page);
            const searchData = this.prepareCallReport(page, cantFilas);
            this.callReport(searchData, true);
          }
        },

        onFirstPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          oLocal.setProperty("/page/Indice", 0);
          oLocal.setProperty("/page/Page", 1);
          const searchData = this.prepareCallReport(1, cantFilas);
          this.callReport(searchData, true);
        },

        onLastPress: function () {
          let totalItems = oLocal.getProperty("/page/TotalItems");
          let cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = Math.ceil(totalItems / cantFilas);
          let indice = (page - 1) * cantFilas;
          oLocal.setProperty("/page/Indice", indice);
          oLocal.setProperty("/page/Page", page);

          const searchData = this.prepareCallReport(page, cantFilas);
          this.callReport(searchData, true);
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
        //#endregion

        validarFiltros: function () {
          const campos = [
            "Name1",
            "Vkorg",
            "Aubel",
            "Erdat",
            "Arktx",
            "Lfimg",
            "Charg",
            "Xblnr",
            "Ntrans",
            "Xblnr1",
            "Bstkd",
            "Werks",
            "Vkburtxt",
            "Vkgrptxt",
            "Sname",
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

        onPress: function (oEvent, sInput) {
          let data = [];
          let results = [];
          let result = null;

          switch (sInput) {
            case "OrgVentas":
              data = this.getView().getModel("oDataMCOrgVentas")?.getData();
              if (data) {
                let orgVentas = oLocal.getProperty("/OrgVentas1");
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

                if (result) {
                  oLocal.setProperty("/OrgVentas1", result.Vkorg);
                  // oLocal.setProperty("/OrgVentasInfo", result.Vtext);
                  // oLocal.setProperty("/Sector", result.Spart);
                  // oLocal.setProperty("/SectorInfo", result.Vtext2);
                  // oInput.setValueState("None");
                } else {
                  oLocal.setProperty("/OrgVentas1", orgVentas);
                  // oLocal.setProperty("/OrgVentasInfo", "");
                  // oInput.setValueState("Error");
                  // oLocal.setProperty("/Sector", "");
                  // oLocal.setProperty("/SectorInfo", "");
                }
              }
              break;

            case "OfiVentas":
              data = this.getView().getModel("oDataMCOfiVentas")?.getData();
              if (data) {
                let ofiVentas = oLocal.getProperty("/OfiVentas1");
                results = data.results;

                if (ofiVentas.length > 0) {
                  result = results.find((item) => item.Vkbur == ofiVentas);
                }

                // let oInput = this.getView().byId("txtOrgVentasCP");

                if (result) {
                  oLocal.setProperty("/OfiVentas1", result.Vkbur);
                  // oLocal.setProperty("/OfiVentasInfo", result.Bezei);
                  // oInput.setValueState("None");
                } else {
                  oLocal.setProperty("/OfiVentas1", ofiVentas);
                  // oLocal.setProperty("/OfiVentasInfo", "");
                  // oInput.setValueState("Error");
                }
              }
              break;

            case "PuestoExp":
              data = this.getView().getModel("oDataMCPuestoExp")?.getData();
              if (data.matcode_puestos_nav) {
                let puestoExp = oLocal.getProperty("/PuestoExp1");
                results = data.matcode_puestos_nav.results;

                if (puestoExp.length > 0) {
                  result = results.find((item) => item.Vstel == puestoExp);
                }

                // let oInput = this.getView().byId("txtOrgVentasCP");

                if (result) {
                  oLocal.setProperty("/PuestoExp1", result.Vstel);
                  // oLocal.setProperty("/puestoExpInfo", result.Ptext);
                  // oInput.setValueState("None");
                } else {
                  oLocal.setProperty("/PuestoExp1", puestoExp);
                  // oLocal.setProperty("/puestoExpInfo", "");
                  // oInput.setValueState("Error");
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
            case "OFIVENTAS":
              this.matchcodeOfiVentas(false);
              break;
            case "PUESTOEXP":
              this.matchcodePuestoExp(false);
              break;
            case "COMERCIAL":
              this.matchcodeComercial(false);
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
              oLocal.setProperty("/OrgVentas1", keys[0]);
              oLocal.setProperty("/Sector", keys[1]);
              // this.onPress(null, "OrgVentas");
              this.onValidarCampos(); //+@
              break;
            case "OFIVENTAS":
              oLocal.setProperty("/OfiVentas1", oSel.getKey());
              // this.onPress(null, "OfiVentas");
              this.onValidarCampos(); //+@
              break;
            case "PUESTOEXP":
              oLocal.setProperty("/PuestoExp1", oSel.getKey());
              // this.onPress(null, "PuestoExp");
              this.onValidarCampos(); //+@
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

        onDescargarExcel: function () {
          this.displayPopup("DescargaExcel");
        },

        onDescargar: function () {
          // const oTable = this.byId("tblReporteDespacho");
          const oTable = this.manager.isMobile() ? this.byId("tblReporteDespachoMob") : this.byId("tblReporteDespacho");
          const sfileName = oLocal.getProperty("/Excel/FileText");
          const oInputNombre = this.getView().byId("txtNombreArchivoRD");

          if (!sfileName) {
            oInputNombre.setValueState("Error");
            return;
          } else {
            oInputNombre.setValueState("None");
          }

          oLocal.setProperty("/Excel/FileText", "Reporte Despacho");

          const aCols = [
            {
              label: "CLIENTE",
              property: "Name1",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "ORG. VENTAS",
              property: "Vkorg",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "PEDIDO",
              property: "Aubel",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "FECHA ENT.",
              property: "Erdat",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "FECHA TRAS.",
              property: "Wadat",
              type: exportLibrary.EdmType.Date,
            },
            {
              label: "DENOMINACION",
              property: "Arktx",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "CTD. ENT.",
              property: "Lfimg",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "LOTE",
              property: "Charg",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "GUIA REMISION",
              property: "Xblnr",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "TRANSPORTE",
              property: "Ntrans",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "FAC/BOL. VTA",
              property: "Xblnr1",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "N° OC",
              property: "Bstkd",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "CENTRO",
              property: "Werks",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "DENOM. OFI.",
              property: "Vkburtxt", //+@JR - Bkburbezei
              type: exportLibrary.EdmType.String,
            },
            {
              label: "GRUPO VENTAS",
              property: "Vkgrptxt",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "VENDEDOR",
              property: "Sname",
              type: exportLibrary.EdmType.String,
            },
          ];

          const oRowBinding = oTable.getBinding("rows");
          const aSelectedIndices = oTable.getSelectedIndices();

          let aData = [];

          if (
            aSelectedIndices.length === oRowBinding.getLength() ||
            aSelectedIndices.length === 0
          ) {
            const totalItems = oLocal.getProperty("/page/TotalItems");
            const searchData = this.prepareCallReport(1, totalItems);

            this.ondataExcelAll(searchData, true).then((oData) => {
              const exportData = oData.reporte_despachoped_nav.results;
              // console.log("Datos a exportar All:", exportData);
              const dataFormateada = this.formatearFechasDespacho(exportData);
              this.exportToExcel(dataFormateada, sfileName, aCols);
            });
          } else {
            aData = aSelectedIndices.map((index) =>
              oRowBinding.getContexts()[index].getObject()
            );
            // console.log("Datos a exportar Choose:", aData);
            const dataFormateada = this.formatearFechasDespacho(aData);
            this.exportToExcel(dataFormateada, sfileName, aCols);
          }
          this.onCancelPress(null, "dialogExcelRD");
        },

        formatearFechasDespacho: function (data) {
          let newData = [];
          for (const element of data) {
            element.Erdat = this.formatter.fecha2(element.Erdat);
            newData.push(element);
          }
          return newData;
        },

        exportToExcel: function (data, fileName, columns) {
          const oSettings = {
            workbook: {
              columns: columns,
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

        ondataExcelAll: function (data, busy) {
          // const oTable = this.byId("tblReporteDespacho");
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri =
            "/ReporteSet?/$expand=reporte_vkorg_nav," +
            "reporte_kunnr_nav," +
            "reporte_erdat_nav," +
            "reporte_aubel_nav," +
            "reporte_vkbur_nav," +
            "reporte_vstel_nav," +
            "reporte_pernr_nav";

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
                // console.log("Lista REPORTE DESPACHO all (success)", oData);
                oModel.setData(oData);
                busy && oLocal.setProperty("/loadingTbl", false);
                resolve(oData);
              }.bind(this),
              error: function (oError) {
                console.error("Lista REPORTE DESPACHO (error)", oError);
                busy && oLocal.setProperty("/loadingTbl", false);
                reject(oError);
              },
            });
          });
        },

        onScreenCantidadFilas: function () {
          this.displayPopup("CantidadFilas");
        },

        onSearchPedidosCantFilas: function () {
          this.onBuscar();
          this.onCloseDialog(null, "dialogCantFilasRD");
        },

        onSelectedItemCantFilas: function (oEvent) {
          const cantFilas = oEvent.getParameter("selectedItem").getText();
          oLocal.setProperty("/page/CantFilas", Number(cantFilas));
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
      }
    );
  }
);
