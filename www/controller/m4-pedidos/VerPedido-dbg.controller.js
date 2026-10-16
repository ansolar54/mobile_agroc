sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/type/String",
    "sap/ui/table/Column",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/SearchField",
    "sap/m/Text",
    "sap/m/Label",
    "sap/m/Dialog",
    "sap/m/BusyDialog",
    "sap/m/MessageStrip",
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
   * @param {typeof sap.m.PDFViewer} PDFViewer
   */
  function (
    Controller,
    History,
    Fragment,
    JSONModel,
    Filter,
    FilterOperator,
    TypeString,
    UIColumn,
    MessageToast,
    MessageBox,
    SearchField,
    Text,
    Label,
    Dialog,
    BusyDialog,
    MessageStrip,
    PDFViewer,
    mobileLibrary,
    Formatter,
    Manager
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var path =
      "com.axelera.pe.gestioncomercial.view.m4-pedidos.consulta-pedidos";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m4-pedidos.VerPedido",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter
            .getRoute("RouteVerPedido")
            .attachPatternMatched(this.onRouteMatched, this);

          this.getView().byId(
            this.manager.isMobile() ? "txtItemMaterialVPMob" : "txtItemMaterialVP"
          ).addStyleClass("myCustBgY");
        },

        onRouteMatched: function (oEvent) {
          const nroPedido = oEvent.getParameter("arguments").nroPedido;
          const claseDoc = oEvent.getParameter("arguments").claseDoc; //+@ES20250328
          const tipoNota = oEvent.getParameter("arguments").tipoNota;
          let motivo = oEvent.getParameter("arguments").motivo;

          motivo = motivo == "EMPTY" ? "" : motivo;

          this.getDetallePedido(nroPedido, claseDoc, tipoNota, motivo);
          // this.deshabilitaInfo(); // +@JR
        },

        deshabilitaInfo: function () {
          if (this.manager.isMobile()) {
            let that = this;
            window.addEventListener("orientationchange", function () {
              // @JR - Ocultar info cuando cuando la pantalla del movil este en horizontal
              if (screen.orientation.type !== 'portrait-primary') {
                that.byId("txtOrgVentasVPInfo").setVisible(false);
              } else {
                that.byId("txtOrgVentasVPInfo").setVisible(true);
              }
            });
          }
        },

        initialization: function (oData, claseDoc, tipoNota, motivo) {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          if (oData) {
            this.setModelLocal(oData, claseDoc, tipoNota, motivo);
          } else {
            this.initialLocal();
          }
          this.manager.setBusy(false);
        },

        setModelLocal: function (oData, claseDoc, tipoNota, motivo) {
          const tablaPed = [];

          if (oData.consulta_materiales_nav.results.length > 0) {
            for (const item of oData.consulta_materiales_nav.results) {
              // PosBonif: true //+@
              item.Descripcion.substr(0, 4) == "ZBON"
                ? (item.PosBonif = false)
                : (item.PosBonif = true);

              tablaPed.push(item);
            }
          }

          oLocal.setData({
            LblAsumeFlete: "", //+@
            OrgVentas: oData.IsCabPedidos.Vkorg,
            OrgVentasInfo: oData.IsCabPedidos.Vkorgtxt,
            NroPedido: oData.IsCabPedidos.Vbeln,
            Solicitante: oData.IsCabPedidos.Kunnr,
            SolicInfo: oData.IsCabPedidos.Solicitante,
            DestMerc: oData.IsCabPedidos.Kunn2,
            DestMercInfo: oData.IsCabPedidos.Destinatario,
            CanalDist: oData.IsCabPedidos.Vtweg,
            CanalDistInfo: oData.IsCabPedidos.Vtwegtxt,
            Sector: oData.IsCabPedidos.Spart,
            SectorInfo: oData.IsCabPedidos.Sparttxt,
            OfiVentas: oData.IsCabPedidos.Vkbur,
            OfiVentasInfo: `${oData.IsCabPedidos.Vkbur} (${oData.IsCabPedidos.Oficina})`,
            // OfiVentasInfo: oData.IsCabPedidos.Oficina,
            ListaPrecios: oData.IsCabPedidos.Pltyp,
            ListaPreciosInfo: `${oData.IsCabPedidos.Pltyp} (${oData.IsCabPedidos.Pltyptxt})`,
            // ListaPreciosInfo: oData.IsCabPedidos.Pltyptxt,
            GrupoVend: oData.IsCabPedidos.Vkgrp,
            GrupoVendInfo: `${oData.IsCabPedidos.Vkgrp} (${oData.IsCabPedidos.Gpovend})`,
            // GrupoVendInfo: oData.IsCabPedidos.Gpovend,
            CondPago: oData.IsCabPedidos.Zterm,
            CondPagoInfo: oData.IsCabPedidos.CondPago,
            NroPedCliente: oData.IsCabPedidos.Bstnk, //+@ES
            ObsGuia: oData.IsCabPedidos.ObsGuia,
            ObsFactura: oData.IsCabPedidos.ObsFactura,
            Comercial: oData.IsCabPedidos.Comercial,
            Transportista: oData.IsCabPedidos.Kunn3,
            TranspInfo: oData.IsCabPedidos.Transportista,
            PosPedidos: {
              Index: "",
              Tabla: [...tablaPed],
            },
            CalcularPlazo: {
              FechaEmision: new Date(),
              TipoCambio: "",
              NroLetras: 0,
              ImpTotal: 0,
              Moneda: "",
              Prioridad: "", //+@
              Tabla: [],
            },
            Almacen: "",
            Stcd1: "",
            Pltyp: "",
            Moneda: "",
            MonedaDesc: "",
            Footer: {
              FletePed: oData.IsCabPedidos.FletePedido,
              SubTotal: oData.IsCabPedidos.Subtotal,
              IGV: oData.IsCabPedidos.Iva,
              Total: oData.IsCabPedidos.Total,
            },
            Correos: oData.consulta_correos_nav.results,
            NombFact: "",
            visible: {
              btnEnviarCP: false,
              btnEnviarCF: false,
            },
            TipoNota: tipoNota,
            Motivo: motivo,
            ClaseDoc: claseDoc, //+@ES20250328
            IsMobile: this.manager.isMobile(), //+@DEV-AS
          });

          if (this.manager.getBukrs() === "1000") {
            oLocal.setProperty("/LblAsumeFlete", i18n.getText("FmxAsumeFlete"));
          } 
          else if (this.manager.getBukrs() === "1200") {
            oLocal.setProperty("/LblAsumeFlete", i18n.getText("AgxAsumeFlete"));
          }

          if (oData.IsCabPedidos.Rmoneda === 1) {
            this.getView().byId(
              this.manager.isMobile() ? "rbtnMonedaVPMob" : "rbtnMonedaVP"
            ).setSelectedIndex(0);
          } else {
            this.getView().byId(
              this.manager.isMobile() ? "rbtnMonedaVPMob" : "rbtnMonedaVP"
            ).setSelectedIndex(1);
          }

          if (oData.IsCabPedidos.Documento === "BOLETA") {
            this.getView().byId(
              this.manager.isMobile() ? "rbtnClaseDocVPMob" : "rbtnClaseDocVP"
            ).setSelectedIndex(0);
          } else {
            this.getView().byId(
              this.manager.isMobile() ? "rbtnClaseDocVPMob" : "rbtnClaseDocVP"
            ).setSelectedIndex(1);
          }

          //
          const chkFlete = this.getView().byId(
            this.manager.isMobile() ? "chkFleteVPMob" : "chkFleteVP" );
          if (oData.IsCabPedidos.ChkFlete) {
            chkFlete.setSelected(true);
          } else {
            chkFlete.setSelected(false);
          }
        },

        initialLocal: function () {
          oLocal.setData({
            LblAsumeFlete: "", //+@
            OrgVentas: "",
            OrgVentasInfo: "",
            NroPedido: "", //+@
            Solicitante: "",
            SolicInfo: "",
            DestMerc: "",
            DestMercInfo: "",
            CanalDist: "",
            CanalDistInfo: "",
            Sector: "",
            SectorInfo: "",
            OfiVentas: "",
            OfiVentasInfo: "",
            ListaPrecios: "",
            ListaPreciosInfo: "",
            GrupoVend: "",
            GrupoVendInfo: "",
            CondPago: "",
            CondPagoInfo: "",
            NroPedCliente: "",
            ObsGuia: "",
            ObsFactura: "",
            Comercial: "",
            Transportista: "",
            TranspInfo: "",
            CentroSum: "",
            PosPedidos: {
              Index: "",
              Tabla: [],
            },
            CalcularPlazo: {
              FechaEmision: new Date(),
              TipoCambio: "",
              NroLetras: "", //0
              ImpTotal: 0,
              Moneda: "",
              Prioridad: "",
              Tabla: [],
            },
            Almacen: "",
            Stcd1: "",
            Pltyp: "",
            Moneda: "",
            MonedaDesc: "",
            Footer: {
              SubTotal: 0,
              IGV: 0,
              Total: 0,
            },
            Correos: [],
            TipoNota: "",
            Motivo: "",
          });

          if (this.manager.getBukrs() === "1000") {
            oLocal.setProperty("/LblAsumeFlete", i18n.getText("FmxAsumeFlete"));
          } 
          else if (this.manager.getBukrs() === "1200") {
            oLocal.setProperty("/LblAsumeFlete", i18n.getText("AgxAsumeFlete"));
          }
          
        },

        getDetallePedido: function (sNroPedido, sClaseDoc, sTipoNota, sMotivo) {
          const oService = this.manager.getService("PEDIDOS");
          const uri =
            "/ConsultaSet?/$expand=consulta_materiales_nav," +
            "consulta_deudacliente_nav," +
            "consulta_correos_nav";
          const data = {
            Accion: "VER_PEDIDO",
            IsVbeln: `${sNroPedido}`,
            IsCabPedidos: {},
            consulta_materiales_nav: [],
            consulta_deudacliente_nav: [],
            consulta_correos_nav: [],
          };

          this.manager.setBusy(true);

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              console.log("DETALLE_PEDIDO", oData);
              this.initialization(oData, sClaseDoc, sTipoNota, sMotivo);
              this.manager.setBusy(false);
            }.bind(this),
            error: function (oError) {
              console.error("Data editar pedido (error)");
              this.manager.setBusy(false);
            }.bind(this),
          });
        },

        onScreenCargaCorreos1: function (oEvent) {
          let nombreScreen = `CargaCorreos-1`;
          this.openCustomDialog(nombreScreen, null, null);
        },

        onScreenCargaCorreos2: function (oEvent) {
          let nombreScreen = `CargaCorreos-2`;
          const bindingContext = oEvent.getSource().getBindingContext("local");
          const nombFact = bindingContext.getProperty("NombFact");
          oLocal.setProperty("/NombFact", nombFact);

          if (nombFact === "") {
            MessageToast.show(i18n.getText("MsgCPErrVerFact"));
            return;
          }

//{+@ES20250325
          const nombGuia = bindingContext.getProperty("NombGuia");
          oLocal.setProperty("/NombGuia", nombGuia);

          // if (nombGuia === "") {
          //   MessageToast.show(i18n.getText("MsgCPErrVerGuia"));
          //   return;
          // }
//}+@ES20250325

          this.openCustomDialog(nombreScreen, null, null);
        },

        openCustomDialog: function (fragmentName, sModel, sPath) {
          // const oView = ;
          let realNombreScreen = fragmentName;
          if (fragmentName.includes("-")) {
            fragmentName = fragmentName.split("-").shift();
          }

          if (!this.byId(fragmentName)) {
            // load asynchronous XML fragment
            Fragment.load({
              id: this.getView().getId(),
              name: `${path}.${fragmentName}`,
              controller: this,
            }).then(
              function (oDialog) {
                // connect dialog to the root view
                //of this component (models, lifecycle)
                this.getView().addDependent(oDialog);
                if (realNombreScreen === "CargaCorreos-1") {
                  // Ajustar el ancho y alto del diálogo
                  // oDialog.setContentWidth("50%");
                  // oDialog.setContentHeight("70%");
                  // oView.byId("btnEnviarCorreoPedido").setVisible(true);
                  // oView.byId("btnEnviarCorreoFactura").setVisible(false);
                  oLocal.setProperty("/visible/btnEnviarCP", true);
                  oLocal.setProperty("/visible/btnEnviarCF", false);
                } else if (realNombreScreen === "CargaCorreos-2") {
                  // oDialog.setContentWidth("50%");
                  // oDialog.setContentHeight("70%");
                  // oView.byId("btnEnviarCorreoPedido").setVisible(false);
                  // oView.byId("btnEnviarCorreoFactura").setVisible(true);
                  oLocal.setProperty("/visible/btnEnviarCP", false);
                  oLocal.setProperty("/visible/btnEnviarCF", true);
                }

                sPath &&
                  oDialog.bindElement({
                    path: sPath,
                    model: sModel,
                  });
                oDialog.open();
              }.bind(this)
            );
          }
        },

        onAgregarCorreo: function () {
          let oModel = this.getView().getModel("local");
          let correo = this.getView().byId("txtAddCorreo").getValue();
          let modelCorreos = oModel.getProperty("/Correos");

          if (this.formatter.validaCorreo(correo)) {
            modelCorreos.push({ Kunnr: "", Correo: correo, Remark: "" });
            oModel.setProperty("/Correos", modelCorreos);
          } else {
            MessageToast.show(i18n.getText("MsgErrAddCorreo"));
          }
        },

        onDeleteCorreoPedido: function (oEvent) {
          let bindingContext = oEvent.getSource().getBindingContext("local");
          const correo = bindingContext.getProperty("Correo");
          this.deleteItem(correo);

          // const correo = this.getView()
          //   .getModel("local")
          //   .getProperty(
          //     "Correo",
          //     oEvent.getSource().getBindingContext("local")
          //   );
        },

        deleteItem: function (correo) {
          const oTable = this.byId("tblCorreos");
          const oModel = oTable.getModel("local");
          const aItems = oModel.getProperty("/Correos");
          const index = aItems.findIndex((item) => item.Correo === correo);

          if (index > -1) {
            aItems.splice(index, 1);
            oModel.setProperty("/Correos", aItems);
          }
        },

        onEnviarPdfPedido: function (oEvent) {
          let oModel = this.getView().getModel("local");
          let modelCorreos = oModel.getProperty("/Correos");

          const data = {
            Accion: "ENVIAR_PDF",
            IsVbeln: oModel.getProperty("/NroPedido"),
            consulta_listamail_nav: [], // {Mail: 'jrosales@gmail.com'}
          };

          // cargar correos a modelo
          if (modelCorreos && modelCorreos.length > 0) {
            for (let item of modelCorreos) {
              data.consulta_listamail_nav.push({
                Mail: item.Correo,
              });
            }
          }

          if (data.consulta_listamail_nav.length == 0) {
            return;
          }
          this.callEnviarPdfFactura(data);
        },

        onEnviarPdfFactura: function (oEvent) {
          let oModel = this.getView().getModel("local");
          let modelCorreos = oModel.getProperty("/Correos");

          const data = {
            Accion: "ENVIAR_FACTURA",
            IsNombFact: oLocal.getProperty("/NombFact"),
            IsNombCliente: oModel.getProperty("/SolicInfo"),
            consulta_listamail_nav: [], // {Mail: 'jrosales@gmail.com'}
          };

          // cargar correos a modelo
          if (modelCorreos && modelCorreos.length > 0) {
            for (let item of modelCorreos) {
              data.consulta_listamail_nav.push({
                Mail: item.Correo,
              });
            }
          }

          if (data.consulta_listamail_nav.length == 0) {
            return;
          }

          this.callEnviarPdfFactura(data);
        },

        onEnviarPdfDocs: function (oEvent) {
          let oModel = this.getView().getModel("local");
          let modelCorreos = oModel.getProperty("/Correos");

          const data = {
            Accion: "ENVIAR_DOCS",
            IsNombGuia: oLocal.getProperty("/NombGuia"),
            IsNombFact: oLocal.getProperty("/NombFact"),
            IsNombCliente: oModel.getProperty("/SolicInfo"),
            IsClaseDoc: oModel.getProperty("/ClaseDoc"), //+@ES20250328
            consulta_listamail_nav: [], // {Mail: 'jrosales@gmail.com'}
          };

          // cargar correos a modelo
          if (modelCorreos && modelCorreos.length > 0) {
            for (let item of modelCorreos) {
              data.consulta_listamail_nav.push({
                Mail: item.Correo,
              });
            }
          }

          if (data.consulta_listamail_nav.length == 0) {
            return;
          }

          this.callEnviarPdfFactura(data);
        },

        onEnviarPdfDocs: function (oEvent) {
          let oModel = this.getView().getModel("local");
          let modelCorreos = oModel.getProperty("/Correos");

          const data = {
            Accion: "ENVIAR_DOCS",
            IsNombGuia: oLocal.getProperty("/NombGuia"),
            IsNombFact: oLocal.getProperty("/NombFact"),
            IsNombCliente: oModel.getProperty("/SolicInfo"),
            consulta_listamail_nav: [], // {Mail: 'jrosales@gmail.com'}
          };

          // cargar correos a modelo
          if (modelCorreos && modelCorreos.length > 0) {
            for (let item of modelCorreos) {
              data.consulta_listamail_nav.push({
                Mail: item.Correo,
              });
            }
          }

          if (data.consulta_listamail_nav.length == 0) {
            return;
          }

          this.callEnviarPdfFactura(data);
        },


        onCloseDialog: function (oEvent, sId) {
          let oDialog = this.byId(sId);
          if (oDialog) {
            oDialog.close();
            oDialog.destroy();
          }
        },

        onVerPDFFactura: function (oEvent) {
          const bindingContext = oEvent.getSource().getBindingContext("local");
          let nombFact = bindingContext.getProperty("NombFact");
          // let xblnr = ""; //"01-0FP01-0000644"

          // // nombFact = "20100141583-01-F001-00148714";
          // if (nombFact.length == 28) {
          //   xblnr = nombFact.substring(12, 28);
          // }

          if (nombFact === "") {
            MessageToast.show(i18n.getText("MsgCPErrVerFact"));
            return;
          }

          // const oService = this.getOwnerComponent().getModel("PedidosService");
          // const oService = new sap.ui.model.odata.ODataModel(
          //   "/sap/opu/odata/sap/ZSD_RC_PEDIDOS_SRV/",
          //   false
          // );

          const oService = this.manager.getService("PEDIDOS", false);
          const uri = `/PdfReaderSet('${nombFact}')/$value`;

          this.manager.setBusy(true);

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

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
              this.manager.isMobile()
                ? cordova.InAppBrowser.open(oResponse.requestUri, "_system", "location=no")
                : oPdfViewer.open();
              //}
            }.bind(this),
            error: function (oError) {
              console.error(oError);
              this.manager.setBusy(false);
            }.bind(this),
          });
        },

        onVerPDFGuiaRem: function (oEvent) {
          const bindingContext = oEvent
            .getSource()
            .getBindingContext("local");
          let nombGuia = bindingContext.getProperty("NombGuia");

          if (nombGuia === "") {
            MessageToast.show(i18n.getText("MsgCPErrVerGuia"));
            return;
          }

          const oService = this.manager.getService("REPORTES", false);
          // const uri = `/PdfReaderSet('${nombGuia}')/$value`;
          const uri = `/FileReaderSet(Modulo='DESPACHO',Filtros='${nombGuia}')/$value`;

          this.manager.setBusy(true);
          
          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

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

        callEnviarPdfFactura: function (data) {
          const oService = this.manager.getService("PEDIDOS");
          const uri = "/ConsultaSet?/$expand=consulta_listamail_nav";

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              // console.log("Data envio pdf (success)", oData.EsMessage);
              MessageToast.show(oData.EsMessage);
            },
            error: function (oError) {
              console.error("Data envio pdf (error)");
            },
          });
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

        onNavBack: function () {
          const oHistory = History.getInstance();
          const sPreviousHash = oHistory.getPreviousHash();

          this.initialLocal();

          // if (sPreviousHash !== undefined) {
          //   window.history.go(-1);
          //   const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          //   oRouter.navTo("RouteMain", {}, true);
          // } else {
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteConsultaPedidos", {}, true);
          // }
        },
      }
    );
  }
);
