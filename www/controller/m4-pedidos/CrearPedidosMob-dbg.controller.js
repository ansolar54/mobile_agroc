sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
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
      Formatter,
      Manager
    ) {
      "use strict";
  
      var oLocal = new JSONModel();
      var path =
        "com.axelera.pe.gestioncomercial.view.m4-pedidos.crear-pedidos";
      var i18n = null;
  
      return Controller.extend(
        "com.axelera.pe.gestioncomercial.controller.m4-pedidos.CrearPedidosMob",
        {
          formatter: Formatter,
          manager: Manager,
  
          onInit: function () {
            const oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("GP01", "Clear", this.onInitCrearPedido, this);
  
            this.getView().byId("txtItemMaterialCPMob").addStyleClass("myCustBgY");
            // this.getView()
            //   .byId(this.manager.isMobile() ? "txtItemMaterialCPMob" : "txtItemMaterialCP")
            //   .addStyleClass("myCustBgY");
          },
  
          onInitCrearPedido: function (channel, event, oData) {
            this.initialization(oData.active);
            // this.deshabilitaInfo(); // +@JR
          },
  
          deshabilitaInfo: function () {
            if (this.manager.isMobile()) {
              let that = this;
              window.addEventListener("orientationchange", function () {
                // @JR - Ocultar info cuando cuando la pantalla del movil este en horizontal
                if (screen.orientation.type !== 'portrait-primary') {
                  that.byId("txtOrgVentasCPInfo").setVisible(false);
                } else {
                  that.byId("txtOrgVentasCPInfo").setVisible(true);
                }
              });
              // }.bind(this));
  
              // this.byId("txtSolicCPInfo").setVisible(false);
              // this.byId("txtDestMercCPInfo").setVisible(false);
              // this.byId("txtTranspCPInfo").setVisible(false);
            }
          },
  
          initialization: function (active) {
            this.initialLocal();
  
            if (active) {
              this.clearPanelMsg();
              this.matchcodeOrgVentas(false); //+
              this.manager.setBusy(false);
            }
          },
  
          initialLocal: function () {
            this.getView().setModel(oLocal, "local");
            i18n = this.manager.getI18nModel(this);
  
            oLocal.setData({
              Sociedad: this.manager.getBukrs(), //+@
              LblAsumeFlete: "", //+@
              OrgVentas: "",
              OrgVentasInfo: "",
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
              mcMaterial: {
                CodProducto: "",
                NombreProd: "",
              },
              mcSolicitante: {
                Cliente: "",
                NombreCliente: "",
                RUC: "",
              },
              chkMessages: false,
              visible: {
                Panel: false,
              },
              editable: {
                DestMerc: false,
                NroPedCliente: false,
                ObsGuia: false,
                ObsFactura: false,
                Transp: false,
              },
              IsMobile: this.manager.isMobile(), //+@DEV-AS
            });

            if (this.manager.getBukrs() === "1000") {
              oLocal.setProperty("/LblAsumeFlete", i18n.getText("FmxAsumeFlete"));
            } 
            else if (this.manager.getBukrs() === "1200") {
              oLocal.setProperty("/LblAsumeFlete", i18n.getText("AgxAsumeFlete"));
            }

          },
  
          resetSolicitante: function () {
            oLocal.setProperty("/Solicitante", "");
            oLocal.setProperty("/SolicInfo", "");
            oLocal.setProperty("/DestMerc", "");
            oLocal.setProperty("/DestMercInfo", "");
            oLocal.setProperty("/CanalDist", "");
            oLocal.setProperty("/CanalDistInfo", "");
            oLocal.setProperty("/OfiVentas", "");
            oLocal.setProperty("/OfiVentasInfo", "");
            oLocal.setProperty("/ListaPrecios", "");
            oLocal.setProperty("/ListaPreciosInfo", "");
            oLocal.setProperty("/GrupoVend", "");
            oLocal.setProperty("/GrupoVendInfo", "");
            oLocal.setProperty("/CondPago", "");
            oLocal.setProperty("/CondPagoInfo", "");
            oLocal.setProperty("/NroPedCliente", "");
            oLocal.setProperty("/ObsGuia", "");
            oLocal.setProperty("/ObsFactura", "");
            oLocal.setProperty("/Comercial", "");
            oLocal.setProperty("/Transportista", "");
            oLocal.setProperty("/TranspInfo", "");
            oLocal.setProperty("/CentroSum", "");
          },
  
          resetDestMerc: function () {
            oLocal.setProperty("/DestMerc", "");
            oLocal.setProperty("/DestMercInfo", "");
            oLocal.setProperty("/CanalDist", "");
            oLocal.setProperty("/CanalDistInfo", "");
            oLocal.setProperty("/OfiVentas", "");
            oLocal.setProperty("/OfiVentasInfo", "");
            oLocal.setProperty("/ListaPrecios", "");
            oLocal.setProperty("/ListaPreciosInfo", "");
            oLocal.setProperty("/GrupoVend", "");
            oLocal.setProperty("/GrupoVendInfo", "");
            oLocal.setProperty("/CondPago", "");
            oLocal.setProperty("/CondPagoInfo", "");
            oLocal.setProperty("/NroPedCliente", "");
            oLocal.setProperty("/ObsGuia", "");
            oLocal.setProperty("/ObsFactura", "");
            oLocal.setProperty("/Comercial", "");
            oLocal.setProperty("/Transportista", "");
            oLocal.setProperty("/TranspInfo", "");
            oLocal.setProperty("/CentroSum", "");
          },
  
          initialMCMaterial: function () {
            oLocal.setProperty("/mcMaterial", {
              CodProducto: "",
              NombreProd: "",
            });
          },
  
          initialMCSolicitante: function () {
            oLocal.setProperty("/mcSolicitante", {
              Cliente: "",
              NombreCliente: "",
              RUC: "",
            });
          },
  
          posicionesVacias: function (cantidad = 10) {
            const data = [];
            let tabla = oLocal.getProperty("/PosPedidos/Tabla");
  
            if (tabla && tabla.length > 0) {
              return;
            }
  
            for (let index = 0; index < cantidad; index++) {
              data.push({
                Posnr: `${index + 1}`,
                Werks: "",
                Lgort: "",
                Matnr: "",
                Maktx: "",
                Labst: "0.00",
                Vrkme: "",
                Zmeng: "",
                Precio: "0.00",
                PrecioDesc: "0.00",
                PrecioLista: "0.00",
                PrecioMin: "0.00",
                Desc: "0.00",
                Flete: "0.00",
                Subtotal: "0.00",
                PrecioFlete: "0.00",
                PrecioOriginal: "0.00",
                KschaOriginal: "",
                DescOriginal: "0.00",
                FleteOriginal: "0.00",
                ZmengOriginal: "0.00",
                Netwr: "0.00",
                Mwsbp: "0.00",
              });
            }
  
            oLocal.setProperty("/PosPedidos/Tabla", [...data]);
          },
  
          getCondicionPago: function () {
            const sPath = "/CalcularPlazo";
  
            //{+@ES20250214
            let valor = oLocal.getProperty(`${sPath}/NroLetras`);
            let valor_aux = valor.replace(/[^\d]/g, "");
            if (valor !== valor_aux ) {
              oLocal.setProperty(`${sPath}/NroLetras`, valor_aux);
            }
            //}+@ES20250214
  
            const oData = {
              Austd: oLocal.getProperty(`${sPath}/FechaEmision`),
              Waers: oLocal.getProperty(`${sPath}/Moneda`),
              Numle: oLocal.getProperty(`${sPath}/NroLetras`),
              Ukurs: oLocal.getProperty(`${sPath}/TipoCambio`),
              Mosel: oLocal.getProperty(`${sPath}/ImpTotal`),
              Zterm: oLocal.getProperty("/CondPago"),
              Priori: oLocal.getProperty(`${sPath}/Prioridad`),
            };
  
            oData.Austd = this.formatter.fechaEstandard(oData.Austd);
            oData.Ukurs = oData.Ukurs == "" ? "0.0" : oData.Ukurs;
            oData.Mosel = oData.Mosel == "" ? "0.0" : oData.Mosel;
            oData.Numle = oData.Numle == 0 ? "" : oData.Numle;
  
            return oData;
          },
  
          onCrearPedido: function () {
            this.actualizarFilas(); //+@ES20241118
  
            const data = {
              Accion: "CREARPEDIDO_VAL",
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsKunnr: oLocal.getProperty("/Solicitante"),
              IsKunn2: oLocal.getProperty("/DestMerc"),
              IsBstkd: oLocal.getProperty("/NroPedCliente"), //+@ES20240913
              IsPltyp: oLocal.getProperty("/ListaPrecios"),
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsTransp: oLocal.getProperty("/Transportista"),
              IsWaerk: "",
              IsSpart: oLocal.getProperty("/Sector"),
              IsVkbur: oLocal.getProperty("/OfiVentas"),
              IsZterm: oLocal.getProperty("/CondPago"),
              IsStcd1: oLocal.getProperty("/Stcd1"),
              IsComercial: oLocal.getProperty("/Comercial"),
              IsFlagEsporadico: false,
              IsChkflete: "",
              IsFletePedido: "",
              IsTotalPed: oLocal.getProperty("/Footer/Total"),
              IsObsGuia: oLocal.getProperty("/ObsGuia"),
              IsObsFactura: oLocal.getProperty("/ObsFactura"),
              IsMoneda: "",
              IsClaseDoc: "",
              IsChkllegada: "",
              EsDestinatario: {},
              creapedi_materiales_nav: [],
              creapedi_condpagodet_nav: [],
              creapedi_messages2_nav: [],
            };
  
            data.IsTotalPed = data.IsTotalPed.toString();
            if (data.IsTotalPed.length == 0) data.IsTotalPed = "0";
  
            // const mobweb = this.manager.isMobile() ? this.getView().byId("rbtnMonedaCPMob") : this.getView().byId("rbtnMonedaCP");
  
            switch (this.getView().byId("rbtnMonedaCPMob").getSelectedIndex()) {
              case 0:
                data.IsMoneda = "1"; //SOLES
                data.IsWaerk = "PEN";
                break;
              case 1:
                data.IsMoneda = "2"; //DOLARES
                data.IsWaerk = "USD";
                break;
              default:
                break;
            }
  
            // const mobwebClasesDoc = this.manager.isMobile() ? this.getView().byId("rbtnClaseDocCPMob") : this.getView().byId("rbtnClaseDocCP");
  
            switch (
              this.getView().byId("rbtnClaseDocCPMob").getSelectedIndex()
              // this.manager.isMobile() ? "rbtnClaseDocCPMob" : "rbtnClaseDocCP".getSelectedIndex()
            ) {
              case 0:
                data.IsClaseDoc = "1"; //Boleta
                break;
              case 1:
                data.IsClaseDoc = "2"; //Factura
                break;
              default:
                break;
            }
  
            // if (_chkLlegada.getSelected()) {
            //   data.IsChkllegada = "X";
            // } else {
            //   data.IsChkllegada = "";
            // }
  
            data.IsFlagEsporadico = false;
            data.IsFletePedido = "0";
  
            // const mobwebChkFlete = this.manager.isMobile() ? this.getView().byId("chkFleteCPMob") : this.getView().byId("chkFleteCP");
  
            if (this.getView().byId("chkFleteCPMob").getSelected()) {
              data.IsChkflete = "X";
            } else {
              data.IsChkflete = "";
            }
  
            data.creapedi_materiales_nav = this.getPosicionesPed();
            data.IsCondpagoCab = this.getCondicionPago();
            data.creapedi_condpagodet_nav = this.getPosCalPlazo();
  
            this.crearPedidoVal(data);
          },
  
          confirmarCrearPedido: function (data) {
            MessageBox.confirm(i18n.getText("MsgCPConfCrearPed"), {
              icon: MessageBox.Icon.INFORMATION,
              title: i18n.getText("Confirmacion"),
              actions: [
                MessageBox.Action.YES,
                MessageBox.Action.NO,
                MessageBox.Action.CLOSE,
              ],
              emphasizedAction: "Si",
              onClose: function (sAction) {
                switch (sAction) {
                  case "YES":
                    this.crearPedidoYes(data);
                    break;
                  case "NO":
                    break;
                  case "CLOSE":
                    break;
                  default:
                    break;
                }
              }.bind(this),
            });
          },
  
          crearPedidoVal: function (data) {
            const oService = this.manager.getService("PEDIDOS");
            const uri =
              "/CreapediSet?/$expand=creapedi_materiales_nav," +
              "creapedi_condpagodet_nav," +
              "creapedi_messages2_nav";
  
            data.Accion = "CREARPEDIDO_VAL";
            this.manager.setBusy(true);
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
                // console.log("Crear pedido (success)", oData, oResponse);
                this.manager.setBusy(false);
                const mensajes = oData.creapedi_messages2_nav.results;
                if (this.showMensajeStrip(mensajes)) {
                  this.confirmarCrearPedido(data);
                }
                this.manager.isMobile() && SpinnerDialog.hide();
              }.bind(this),
              error: function (oError) {
                this.manager.isMobile() && SpinnerDialog.hide();
                this.manager.setBusy(false);
                console.error("Crear pedido (error)", oError);
              },
            });
          },
  
          crearPedidoYes: function (data) {
            const oService = this.manager.getService("PEDIDOS");
            const uri =
              "/CreapediSet?/$expand=creapedi_materiales_nav," +
              "creapedi_condpagodet_nav," +
              "creapedi_messages2_nav";
  
            data.Accion = "CREARPEDIDO_YES";
            this.manager.setBusy(true);
            // this.manager.auditoria(10); //+@ES20250326  //-@20260820
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
                // console.log("Crear pedido (success)", oData, oResponse);
                this.manager.setBusy(false);
                const mensajes = oData.creapedi_messages2_nav.results;
                if (this.showMensajeStrip(mensajes)) {
                  const mensaje = mensajes.find((item) => item.Success == "S");
                  MessageBox.success(`${mensaje.Message} ${mensaje.Message1}`);
                  this.initialLocal();
                }
                this.manager.isMobile() && SpinnerDialog.hide();
              }.bind(this),
              error: function (oError) {
                this.manager.isMobile() && SpinnerDialog.hide();
                this.manager.setBusy(false);
                console.error("Crear pedido (error)", oError);
              },
            });
          },
  
          onEvaluarPos: function () {
            if (
              oLocal.getProperty("/OrgVentas").length > 0 &&
              oLocal.getProperty("/Solicitante").length > 0 &&
              oLocal.getProperty("/DestMerc").length > 0
            ) {
              this.posicionesVacias(10);
            }
          },
  
          matchcodeOrgVentas: function (popup) {
            const oService = this.manager.getService("PEDIDOS");
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
              success: function (oData, oResponse) {
                // console.log("Data matchcodes OrgVentas (success)", oData);
                this.manager.setBusy(false);
                oModel.setData(oData);
                popup && this.displayPopup("MatchcodeOrgVentas");
              }.bind(this),
              error: function (oError) {
                console.error("Data matchcodes OrgVentas (error)", oError);
              },
            });
  
            this.getView().setModel(oModel, "oDataMCOrgVentas");
          },
  
          onMatchcodeOrgVentas: function () {
            this.matchcodeOrgVentas(true);
            this.clearPanelMsg();
          },
  
          onMatchcodeSolicitante: function () {
            this.initialMCSolicitante();
            this.getView().setModel(new JSONModel(), "oDataMCSolicitante");
            this.displayPopup("MatchcodeSolicitante");
          },
  
          onMatchcodeDestMerc: function () {
            this.matchcodeDestMercancia(true);
          },
  
          onMatchcodeCondPago: function () {
            this.matchcodeCondPago(true);
          },
  
          onMatchcodeTransportista: function () {
            this.matchcodeTransp(true);
          },
  
          onMatchcodeMaterial: function (oEvent) {
            const index = oEvent
              .getSource()
              .getBindingContext("local")
              .getPath()
              .replace("/PosPedidos/Tabla/", "");
  
            oLocal.setProperty("/PosPedidos/Index", index);
            this.initialMCMaterial();
            this.getView().setModel(new JSONModel(), "oDataMCMaterial");
  
            this.displayPopup("MatchcodeMaterial");
          },
  
          // SOLICITANTES
          matchcodeSolicitante: function (popup) {
            const oService = this.manager.getService("PEDIDOS");
            const oModel = new JSONModel();
            const uri = "/CreapediSet?/$expand=creapedi_solicitantes_nav";
            const data = {
              Accion: "SOLICITANTES",
              IsNpag: "1",
              IsRegxpag: "1000",
              IsKunnr: oLocal.getProperty("/mcSolicitante/Cliente"),
              IsName1: oLocal.getProperty("/mcSolicitante/NombreCliente"), //+@
              IsStcd1: oLocal.getProperty("/mcSolicitante/RUC"),
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsSpart: oLocal.getProperty("/Sector"), //+@
              creapedi_solicitantes_nav: [],
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
              success: function (oData, oResponse) {
                // console.log("Data matchcodes Solicitantes (success)", oData);
                oModel.setData(oData);
                popup && this.displayPopup("MatchcodeSolicitante");
              }.bind(this),
              error: function (oError) {
                console.error("Data matchcodes Solicitantes (error)", oError);
              },
            });
  
            this.getView().setModel(oModel, "oDataMCSolicitante");
          },
  
          // CONDICION DE PAGO
          matchcodeCondPago: function (popup) {
            const oService = this.manager.getService("PEDIDOS");
            const oModel = new JSONModel();
            const uri = "/CreapediSet?/$expand=creapedi_condpago_nav";
            const data = {
              Accion: "CONDPAGO",
              IsNpag: "1",
              IsRegxpag: "1000",
              IsCondpago: oLocal.getProperty("/CondPago"),
              creapedi_condpago_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("Data matchcodes CondPago (success)", oData);
                oModel.setData(oData);
                popup && this.displayPopup("MatchcodeCondPago");
              }.bind(this),
              error: function (oError) {
                console.error("Data matchcodes CondPago (error)", oError);
              },
            });
  
            this.getView().setModel(oModel, "oDataMCCondPago");
          },
  
          matchcodeMaterial: function (popup) {
            const oService = this.manager.getService("PEDIDOS");
            const oModel = new JSONModel();
            const uri = "/CreapediSet?/$expand=creapedi_materiales3_nav";
            const data = {
              Accion: "MATERIALITEM",
              IsNpag: "1",
              IsRegxpag: "1000",
              IsMatnr: oLocal.getProperty("/mcMaterial/CodProducto"),
              IsNameMatnr: oLocal.getProperty("/mcMaterial/NombreProd"),
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsSpart: oLocal.getProperty("/Sector"), //+@
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsPltyp: oLocal.getProperty("/ListaPrecios"),
              IsVkbur: oLocal.getProperty("/OfiVentas"),
              IsVwerk: oLocal.getProperty("/CentroSum"),
              creapedi_materiales3_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("Data matchcodes Materiales (success)", oData);
                oModel.setData(oData);
                popup && this.displayPopup("MatchcodeMaterial");
              }.bind(this),
              error: function (oError) {
                console.error("Data matchcodes Materiales (error)", oError);
              },
            });
            this.getView().setModel(oModel, "oDataMCMaterial");
          },
  
          matchcodeDestMercancia: function (popup) {
            const oService = this.manager.getService("PEDIDOS");
            const oModel = new JSONModel();
            const uri = "/CreapediSet?/$expand=creapedi_destinatarios_nav";
            const data = {
              Accion: "DESTINATARIOS",
              IsKunnr: oLocal.getProperty("/Solicitante"),
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsSpart: oLocal.getProperty("/Sector"),
              IsNpag: "1",
              IsRegxpag: "1000",
              EsDestinatario: {},
              creapedi_destinatarios_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("Data matchcodes DM (success)", oData);
                oModel.setData(oData);
                popup && this.displayPopup("MatchcodeDestMerc");
                this.matchcodeTransp(false);
              }.bind(this),
              error: function (oError) {
                console.error("Data matchcodes DM (error)", oError);
              },
            });
            this.getView().setModel(oModel, "oDataMCDestMerc");
          },
  
          matchcodeTransp: function (popup) {
            const oService = this.manager.getService("PEDIDOS");
            const oModel = new JSONModel();
            const uri = "/CreapediSet?/$expand=creapedi_transportistas_nav";
            const data = {
              Accion: "TRANSPORTISTAS",
              IsKunnr: oLocal.getProperty("/Solicitante"),
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsSpart: oLocal.getProperty("/Sector"),
              IsNpag: "1",
              IsRegxpag: "1000",
              EsDestinatario: {},
              creapedi_transportistas_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("Data matchcodes Transp (success)", oData);
                // oData.creapedi_transportistas_nav.results.map((t) => {
                //   t.Name1 = `${ t.Name1 } ${ t.Name2 } ${ t.Name3 } ${ t.Name4 }`
                // })
                oModel.setData(oData);
                popup && this.displayPopup("MatchcodeTransportista");
              }.bind(this),
              error: function (oError) {
                console.error("Data matchcodes Transp (error)", oError);
              },
            });
            this.getView().setModel(oModel, "oDataMCTransportista");
          },
  
          matchcodeSearch: function (oEvent, oDialog) {
            const sValue = oEvent.getParameter("value");
  
            let aFilters;
            switch (oDialog) {
              case "dialogOrgVentasCP":
                aFilters = [
                  new Filter("Vkorg", FilterOperator.Contains, sValue),
                  new Filter("Vtext", FilterOperator.Contains, sValue),
                ];
                break;
  
              case "dialogCondPagoCP":
                aFilters = [
                  new Filter("Zterm", FilterOperator.Contains, sValue),
                  new Filter("Vtext", FilterOperator.Contains, sValue),
                ];
                break;
  
              case "dialogDestMercCP":
                aFilters = [
                  new Filter("Kunnr", FilterOperator.Contains, sValue),
                  new Filter("Name1", FilterOperator.Contains, sValue),
                  new Filter("Zona", FilterOperator.Contains, sValue),
                ];
                break;
              case "dialogTransportistaCP":
                aFilters = [
                  new Filter("Lifnr", FilterOperator.Contains, sValue),
                  new Filter("Name1", FilterOperator.Contains, sValue),
                  new Filter("Zona", FilterOperator.Contains, sValue),
                ];
                break;
              default:
                return;
            }
  
            const oFilter = new Filter({
              filters: aFilters,
              and: false,
            });
  
            const oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
          },
  
          onConfirmPress: function (oEvent, oDialog) {
            let oSelected;
            let oCells = [];
            let oItem = {};
  
            switch (oDialog) {
              case "dialogOrgVentasCP":
                oSelected = oEvent.getParameter("selectedItem");
                oCells = oSelected.getCells();
  
                oLocal.setProperty("/OrgVentas", oCells[0].getTitle());
                oLocal.setProperty("/OrgVentasInfo", oCells[1].getText());
                oLocal.setProperty("/Sector", oCells[2].getText());
                oLocal.setProperty("/SectorInfo", oCells[3].getText());
  
                this.onEvaluarPos();
                break;
              case "dialogCondPagoCP":
                oSelected = oEvent.getParameter("selectedItem");
                oCells = oSelected.getCells();
  
                oLocal.setProperty("/CondPago", oCells[0].getTitle());
                oLocal.setProperty("/CondPagoInfo", oCells[1].getText());
                break;
  
              case "dialogDestMercCP":
                oSelected = oEvent.getParameter("selectedItem");
                oCells = oSelected.getCells();
  
                oLocal.setProperty("/DestMerc", oCells[0].getTitle());
                oLocal.setProperty("/DestMercInfo", oCells[2].getText());
  
                this.selDestinatario();
                this.onEvaluarPos();
                break;
  
              case "dialogTransportistaCP":
                oSelected = oEvent.getParameter("selectedItem");
                oCells = oSelected.getCells();

                oLocal.setProperty("/Transportista", oCells[0].getTitle());
                oLocal.setProperty("/TranspInfo", oCells[1].getText());
  
                break;
  
              case "dialogSolicitanteCP":
                oSelected = oEvent.getParameter("listItem");
                oCells = oSelected.getCells();
  
                oItem = {
                  kunnr: oCells[0].getTitle(),
                  kunnrTxt: oCells[1].getText(),
                  vkorg: oCells[4].getText(),
                  vtweg: oCells[5].getText(),
                  spart: oCells[6].getText(),
                  spartTxt: oCells[7].getText(),
                  vtext: oCells[8].getText(),
                };
  
                oLocal.setProperty("/OrgVentas", oItem.vkorg);
                oLocal.setProperty("/Solicitante", oItem.kunnr);
                oLocal.setProperty("/SolicInfo", oItem.kunnrTxt);
                oLocal.setProperty("/CanalDist", oItem.vtweg);
                oLocal.setProperty("/CanalDistInfo", oItem.vtext);
                oLocal.setProperty("/Sector", oItem.spart);
                oLocal.setProperty("/SectorInfo", oItem.spartTxt);
  
                this.selSolicitante(oItem);
                this.onEvaluarPos();
                this.onCancelPress(null, oDialog);
                break;
  
              case "dialogMaterialCP":
                const index = Number(oLocal.getProperty("/PosPedidos/Index"));
                const sPath = `/PosPedidos/Tabla/${index}`;
                oSelected = oEvent.getParameter("listItem");
                oCells = oSelected.getCells();
                oItem = {
                  Material: oCells[0].getTitle(),
                  Descripcion: oCells[1].getText(),
                  StockDisp: oCells[3].getText(),
                  Centro: oCells[4].getText(),
                  Almacen: oCells[5].getText(), //+@ES20240926
                };
  
                oLocal.setProperty(`${sPath}/Werks`, oItem.Centro);
                oLocal.setProperty(`${sPath}/Matnr`, oItem.Material);
                oLocal.setProperty(`${sPath}/Maktx`, oItem.Descripcion);
                oLocal.setProperty(`${sPath}/Labst`, oItem.StockDisp);
                oLocal.setProperty(`${sPath}/Lgort`, oItem.Almacen); //+@ES20240926
  
                //{+@ES20240926
                const centroSum = oLocal.getProperty("/CentroSum");
                const centros = [];
  
                if (centroSum == "1001") {
                  centros.push({ centro: centroSum });
                } else {
                  centros.push({ centro: "1001" });
                  centros.push({ centro: centroSum });
                }
  
                oLocal.setProperty(`${sPath}/Centros`, centros);
                //}+@ES20240926
  
                this.selMaterial(oItem.Material);
                this.onCancelPress(null, oDialog);
                break;
  
              default:
                break;
            }
          },
  
          onChangeCentro: function (oEvent) {
            let bindingContext = oEvent.getSource().getBindingContext("local");
            let index = bindingContext
              .getPath()
              .replace("/PosPedidos/Tabla/", "");
            const centro = oEvent.getSource().getSelectedKey();
            const sPath = `/PosPedidos/Tabla/${index}`;
            oLocal.setProperty(`${sPath}/Werks`, centro);
  
            this.onPressMaterial(oEvent);
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
  
                  let oInput = this.getView().byId("txtOrgVentasCPMob");
                  this.initialLocal();
  
                  if (result) {
                    oLocal.setProperty("/OrgVentas", result.Vkorg);
                    oLocal.setProperty("/OrgVentasInfo", result.Vtext);
                    oLocal.setProperty("/Sector", result.Spart);
                    oLocal.setProperty("/SectorInfo", result.Vtext2);
                    oInput.setValueState("None");
                  } else {
                    oLocal.setProperty("/OrgVentas", orgVentas);
                    oInput.setValueState("Error");
                    // oLocal.setProperty("/OrgVentasInfo", "");
                    // oLocal.setProperty("/Sector", "");
                    // oLocal.setProperty("/SectorInfo", "");
                  }
  
                  this.onEvaluarPos();
                }
                break;
  
              case "Solicitante":
                data = this.getView().getModel("oDataMCSolicitante")?.getData();
                if (data.creapedi_solicitantes_nav) {
                  let solicitante = oLocal.getProperty("/Solicitante");
                  results = data.creapedi_solicitantes_nav.results;
  
                  if (solicitante.length > 0) {
                    result = results.find((item) => item.Kunnr == solicitante);
                  }
  
                  let oInput = this.getView().byId("txtSolicitanteCPMob");
  
                  if (result) {
                    oLocal.setProperty("/Solicitante", result.Kunnr);
                    oLocal.setProperty("/SolicInfo", result.Name1);
                    oInput.setValueState("None");
  
                    const oItem = {
                      kunnr: result.Kunnr,
                      vkorg: result.Vkorg,
                      vtweg: result.Vtweg,
                      spart: result.Spart,
                      spartTxt: result.Sparttxt,
                      vtext: result.Vtext,
                    };
  
                    this.selSolicitante(oItem);
                  } else {
                    this.resetSolicitante();
                    oLocal.setProperty("/Solicitante", solicitante);
                    oInput.setValueState("Error");
                  }
  
                  this.onEvaluarPos();
                }
                break;
  
              case "DestMerc":
                data = this.getView().getModel("oDataMCDestMerc")?.getData();
  
                if (data.creapedi_destinatarios_nav) {
                  let destMerc = oLocal.getProperty("/DestMerc");
                  results = data.creapedi_destinatarios_nav.results;
  
                  if (destMerc.length > 0) {
                    result = results.find((item) => item.Kunnr == destMerc);
                  }
  
                  let oInput = this.getView().byId("txtDestMercCPMob");
  
                  if (result) {
                    oLocal.setProperty("/DestMerc", result.Kunnr);
                    oLocal.setProperty("/DestMercInfo", result.Direccion);
                    oInput.setValueState("None");
                    this.selDestinatario();
                  } else {
                    // oLocal.setProperty("/DestMercInfo", "");
                    this.resetDestMerc();
                    oLocal.setProperty("/DestMerc", destMerc);
                    oInput.setValueState("Error");
                  }
                }
  
                this.onEvaluarPos();
                break;
  
              case "Transportista":
                data = this.getView().getModel("oDataMCTransportista")?.getData();
                if (data.creapedi_transportistas_nav) {
                  let transp = oLocal.getProperty("/Transportista");
                  results = data.creapedi_transportistas_nav.results;
  
                  if (transp.length > 0) {
                    result = results.find((item) => item.Lifnr == transp);
                  }
  
                  if (result) {
                    oLocal.setProperty("/Transportista", result.Lifnr);
                    oLocal.setProperty("/TranspInfo", result.Name1);
                  } else {
                    oLocal.setProperty("/TranspInfo", "");
                  }
                }
                break;
  
              default:
                break;
            }
          },
  
          onPressMaterial: function (oEvent) {
            let index = oEvent
              .getSource()
              .getBindingContext("local")
              .getPath()
              .replace("/PosPedidos/Tabla/", "");
  
            const sPath = `/PosPedidos/Tabla/${index}`;
            const centro = oLocal.getProperty(`${sPath}/Werks`);
            const centroSum = oLocal.getProperty(`/CentroSum`);
  
            if (centro.length == 0) {
              oLocal.setProperty(`${sPath}/Werks`, centroSum);
            }
  
            //{+@ES20240926
            const centros = [];
  
            if (centroSum == "1001") {
              centros.push({ centro: centroSum });
            } else {
              centros.push({ centro: "1001" });
              centros.push({ centro: centroSum });
            }
  
            oLocal.setProperty(`${sPath}/Centros`, centros);
            //}+@ES20240926
  
            this.actionEnterMaterial(index);
          },
  
          inputBGColor: function (oEvent, sEstilo, active) {
            let index = oEvent
              .getSource()
              .getBindingContext("local")
              .getPath()
              .replace("/PosPedidos/Tabla/", "");
            const sPath = `/PosPedidos/Tabla/${index}`;
  
            if (oEvent) {
              if (active) {
                oEvent.getSource().addStyleClass(sEstilo);
                oLocal.setProperty(`${sPath}/itemActive`, false);
                oLocal.setProperty(`${sPath}/Subtotal`, "0.00");
                oEvent.getSource().setEditable(true);
              } else {
                oEvent.getSource().removeStyleClass(sEstilo);
                oLocal.setProperty(`${sPath}/itemActive`, true);
              }
            }
          },
  
          onPressCantidad: function (oEvent, sInput) {
            let index = oEvent
              .getSource()
              .getBindingContext("local")
              .getPath()
              .replace("/PosPedidos/Tabla/", "");
  
            //{+@ES20250214
            let valor = "", valor_aux = "";
            
            switch (sInput) {
              case "ZMENG":
                valor = oLocal.getProperty(`/PosPedidos/Tabla/${index}/Zmeng`);
                valor_aux = valor.replace(/[^\d]/g, "");
                if (valor !== valor_aux ) {
                  oLocal.setProperty(`/PosPedidos/Tabla/${index}/Zmeng`, valor_aux);
                }
                break;
                // case "PRECFIN":
                //   valor = oLocal.getProperty(`/PosPedidos/Tabla/${index}/PrecioDesc`);
                //   valor_aux = valor.replace(/[^\d]/g, "");
                //   if (valor !== valor_aux ) {
                //     oLocal.setProperty(`/PosPedidos/Tabla/${index}/PrecioDesc`, valor_aux);
                //   }
                //   break;
              default:
                break;
            }
            //}+@ES20250214
  
            this.actionEnterCantidad(oEvent, index);
          },
  
          actualizarFilas: function () {
            // const oTblCrearPed = this.byId("tblCrearPedidos");
            const oTblCrearPed = this.byId("tblCrearPedidosMob");
            const aRows = oTblCrearPed.getRows();
            const sPath = "/PosPedidos/Tabla";
            const oTable = oLocal.getProperty(sPath);
  
            for (const index in oTable) {
              const posicion = oLocal.getProperty(`${sPath}/${index}`);
              const posChanged = oLocal.getProperty(
                `${sPath}/${index}/posChanged`
              );
  
              if (posicion.Matnr.length == 0) continue;
              if (posicion.Descripcion?.substr(0, 4) == "ZBON") continue;
              if (posChanged) {
                oLocal.setProperty(`${sPath}/${index}/posChanged`, false);
                oLocal.setProperty(`${sPath}/${index}/itemActive`, true);
                oLocal.setProperty(`${sPath}/${index}/itemActive1`, true);
                oLocal.setProperty(`${sPath}/${index}/itemActive2`, true);
                this.actionEnterCantidad2(index);
              }
            }
  
            if (aRows.length > 0) {
              aRows.forEach((oRow) => {
                // oRow.removeStyleClass("custBGColor2");
                oRow.getAggregation("cells")[6].removeStyleClass("custBGColor2");
                oRow.getAggregation("cells")[8].removeStyleClass("custBGColor2");
              });
            }
          },
  
          onCalcularPlazo: function (oEvent) {
            this.actualizarFilas(); //+@ES20241118
            this.actionCalcPlazo();
          },
  
          calcularPlazoPopup: function (cabecera) {
            this.setCalcularPlazoCab(cabecera);
            this.displayPopup("CalcularPlazo");
          },
  
          clearCalcularPlazo: function () {
            oLocal.setProperty(`/CalcularPlazo/FechaEmision`, new Date());
            oLocal.setProperty(`/CalcularPlazo/TipoCambio`, "");
            oLocal.setProperty(`/CalcularPlazo/NroLetras`, ""); //0
            oLocal.setProperty(`/CalcularPlazo/ImpTotal`, 0);
            oLocal.setProperty(`/CalcularPlazo/Moneda`, "");
            oLocal.setProperty(`/CalcularPlazo/Prioridad`, "");
            oLocal.setProperty(`/CalcularPlazo/Tabla`, []);
          },
  
          setCalcularPlazoCab: function (oData) {
            oLocal.setProperty(`/CalcularPlazo/FechaEmision`, new Date());
            oLocal.setProperty(`/CalcularPlazo/TipoCambio`, oData.Ukurs);
            oLocal.setProperty(`/CalcularPlazo/ImpTotal`, oData.Mosel);
            oLocal.setProperty(`/CalcularPlazo/Moneda`, oData.Waers);
            oLocal.setProperty(`/CalcularPlazo/Prioridad`, oData.Priori);
            //{+@20260401
            oLocal.setProperty(`/CalcularPlazo/NroLetras`, oData.Numle);
            if (oData.NoEditable == "X") {
              oLocal.setProperty(`/CalcularPlazo/NroLetrasEditable`, false);
              const tabla = oLocal.getProperty(`/CalcularPlazo/Tabla`);
              if (tabla.length == 0) {
                this.onNroLetrasEnter();
              } else if (tabla.length > oData.Numle) {
                oLocal.setProperty(`/CalcularPlazo/Tabla`, []);
                this.onNroLetrasEnter();
              }
            } else {
              oLocal.setProperty(`/CalcularPlazo/NroLetrasEditable`, true); 
            } 
            //}+@20260401
          },
  
          setCalcularPlazoDet: function (oData) {
            const aRows = [];
            for (const item of oData) {
              aRows.push({
                NroDias: "",
                FechaVenc: null,
                Importe: item.Wrbtr,
              });
            }
            oLocal.setProperty("/CalcularPlazo/Tabla", aRows);
          },
  
          actionCalcPlazo: function () {
            const oService = this.manager.getService("PEDIDOS");
            const uri =
              "/CreapediSet?/$expand=creapedi_materiales_nav," +
              "creapedi_messages2_nav";
            const data = {
              Accion: "CALCPLAZO",
              IsVkorg: oLocal.getProperty("/OrgVentas"), //+@20260219
              IsSpart: oLocal.getProperty("/Sector"),    //+@20260219
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsZterm: oLocal.getProperty("/CondPago"),
              IsTotPed: oLocal.getProperty("/Footer/Total"),
              IsMoneda: oLocal.getProperty("/Moneda"),
              EsItemMaterial: this.getPosicionPed(0),
              creapedi_materiales_nav: this.getPosicionesPed(),
              IsCondpagoCab: {},
              creapedi_messages2_nav: [],
            };
  
            data.IsTotPed = this.formatter.cadenaDec(data.IsTotPed);
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "contexto": "CP",
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("Calcular Plazo (success)", oData);
                const mensajes = oData.creapedi_messages2_nav.results;
                const cabecera = oData.IsCondpagoCab;
                if (this.showMensajeStrip(mensajes)) {
                  this.calcularPlazoPopup(cabecera);
                }
              }.bind(this),
              error: function (oError) {
                console.error("oError (error)", oError);
              },
            });
          },
  
          showMensajes: function (aMensajes) {
            let ok = true;
            if (aMensajes.length > 0) {
              ok = this.manager.msgResult4(aMensajes);
            }
            return ok;
          },
  
          actionCalcPlazoOk: function () {
            const oService = this.manager.getService("PEDIDOS");
            const uri =
              "/CreapediSet?/$expand=creapedi_condpagodet_nav,creapedi_messages2_nav";
            const data = {
              Accion: "CALCPLAZO_OK",
              IsVkorg: oLocal.getProperty("/OrgVentas"), //+@20260325
              IsSpart: oLocal.getProperty("/Sector"),    //+@20260325
              IsCondpagoCab: this.getCondicionPago(),
              creapedi_messages2_nav: [],
              creapedi_condpagodet_nav: this.getPosCalPlazo(),
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "contexto": "CP",
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("Calcular Plazo Ok (success)", oData);
                oLocal.setProperty("/ObsFactura", oData.IsObsFactura);
                const mensajes = oData.creapedi_messages2_nav.results;
                if (this.showMensajes(mensajes)) {
                  this.onCancelPress(null, "dialogCalcPlazoCP");
                }
              }.bind(this),
              error: function (oError) {
                console.error("oError (error)", oError);
              },
            });
          },
  
          onNroLetrasEnter: function (oEvent) {
            const oService = this.manager.getService("PEDIDOS");
            const uri =
              "/CreapediSet?/$expand=creapedi_condpagodet_nav,creapedi_messages2_nav";
            const data = {
              Accion: "CALCPLAZO_LETRA",
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsZterm: oLocal.getProperty("/CondPago"),
              IsTotPed: oLocal.getProperty("/Footer/Total"),
              IsMoneda: oLocal.getProperty("/Moneda"),
              IsCondpagoCab: this.getCondicionPago(),
              creapedi_messages2_nav: [],
              creapedi_condpagodet_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "contexto": "CP",
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("Nro. Letras Enter (success)", oData);
                const condpagodet = oData.creapedi_condpagodet_nav.results;
                this.setCalcularPlazoDet(condpagodet);
                const mensajes = oData.creapedi_messages2_nav.results;
                this.showMensajes(mensajes);
              }.bind(this),
              error: function (oError) {
                console.error("oError (error)", oError);
              },
            });
          },
  
          //{+@ES20250214
          valPosicionesCalPlazo: function () {
            const data = [];
            const tabla = oLocal.getProperty("/CalcularPlazo/Tabla");
            let ok = true;
  
            for (const fila of tabla) {
              if (fila.FechaVenc == null && fila.NroDias == 0) {
                ok = false;
              }
            }
  
            return ok;
          },
          //}+@ES20250214
  
          getPosCalPlazo: function () {
            const data = [];
            const tabla = oLocal.getProperty("/CalcularPlazo/Tabla");
  
            for (const fila of tabla) {
              data.push({
                Posnr: "000",
                // Zfbdt: fila.FechaVenc,
                Zfbdt: this.formatter.fechaEstandard(fila.FechaVenc),
                Numdi: fila.NroDias,
                Wrbtr: fila.Importe,
              });
            }
  
            return data;
          },
  
          setPosCalPlazo: function (oData) {
            const tabla = [];
            oLocal.setProperty("/CalcularPlazo/Tabla", []);
  
            for (const fila of oData) {
              tabla.push({
                FechaVenc: this.formatter.fechaEstandard(fila.Zfbdt), //+@JR
                NroDias: fila.Numdi,
                Importe: fila.Wrbtr,
              });
            }
  
            oLocal.setProperty("/CalcularPlazo/Tabla", tabla);
          },
  
          onNroDiasSubmit: function (oEvent) {
  
            if (!this.valPosicionesCalPlazo()) {
              return;
            }
  
            const oService = this.manager.getService("PEDIDOS");
            const uri =
              "/CreapediSet?/$expand=creapedi_condpagodet_nav,creapedi_messages2_nav";
            const data = {
              Accion: "CALCPLAZO_NDIA",
              IsCondpagoCab: this.getCondicionPago(),
              creapedi_messages2_nav: [],
              creapedi_condpagodet_nav: this.getPosCalPlazo(),
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "contexto": "CP",
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("oData", oData);
                this.setPosCalPlazo(oData.creapedi_condpagodet_nav.results);
                const mensajes = oData.creapedi_messages2_nav.results;
                this.showMensajes(mensajes);
              }.bind(this),
              error: function (oError) {
                console.error("oError (error)", oError);
              },
            });
          },
  
          actionEnterMaterial: function (sIndex) {
            const oService = this.manager.getService("PEDIDOS");
            const uri = "/CreapediSet?/$expand=creapedi_messages2_nav";
            const sPath = `/PosPedidos/Tabla/${sIndex}`;
            const data = {
              Accion: "ENTER_MATERIAL",
              IsKunnr: oLocal.getProperty("/Solicitante"),
              IsMatnr: oLocal.getProperty(`${sPath}/Matnr`),
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsSpart: oLocal.getProperty("/Sector"),
              IsPltyp: oLocal.getProperty("/ListaPrecios"),
              IsMoneda: oLocal.getProperty("/Moneda"),
              IsLgort: oLocal.getProperty(`${sPath}/Lgort`),
              IsVwerk: oLocal.getProperty(`${sPath}/Werks`), //+@
              EsItemMaterial2: {},
              creapedi_messages2_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("ENTER MATERIAL", oData);
                this.clearCalcularPlazo();
                this.setPosicionPedMat(sIndex, oData);
                const mensajes = oData.creapedi_messages2_nav.results;
                this.showMensajeStrip(mensajes);
              }.bind(this),
              error: function (oError) {
                console.error("oError (error)", oError);
              },
            });
          },
  
          setPosicionesPed: function (oData) {
            let tabla = [],
              item,
              filasVacias;
            for (const fila of oData) {
              if (fila.Matnr === "") {
                continue;
              }
  
              item = {
                Posnr: fila.Posnr, // "1",
                Werks: fila.Werks, // "1001",
                Lgort: fila.Lgort, // "1002",
                Matnr: fila.Matnr, // "7100100066",
                Maktx: fila.Maktx, // "SEM.PEPINILLO SALVADOR F1 X 15 MIL",
                Labst: this.formatter.importe(fila.Labst), // "30710.00",
                Vrkme: fila.Vrkme, // "UN",
                Zmeng: this.formatter.cantidad(fila.Zmeng), // "0.00",
                Precio: this.formatter.importe(fila.Precio), // "280.00",
                PrecioDesc: this.formatter.importe(fila.PrecioDesc), // "280.00",
                PrecioLista: this.formatter.importe(fila.PrecioLista), // "280.00",
                PrecioMin: this.formatter.importe(fila.PrecioMin), // "280.00",
                Desc: this.formatter.importe(fila.Desc), // "0.00",
                Flete: this.formatter.importe(fila.Flete), // "0.00",
                Subtotal: this.formatter.importe(fila.Subtotal), // "0.00",
                Descripcion: fila.Descripcion, // "",
                TtDesc: this.formatter.importe(fila.TtDesc), // "",
                Kscha: this.formatter.cadena(fila.Kscha), // "",
                Correl: fila.Correl, // "",
                PosBonif: true, //+@ES
                Centros: [], //+@ES
              };
  
              item.Descripcion.substr(0, 4) == "ZBON"
                ? (item.PosBonif = false)
                : (item.PosBonif = true);
  
              //{+@ES20240926
              const centroSum = oLocal.getProperty("/CentroSum");
              const centros = [];
  
              if (centroSum == "1001") {
                centros.push({ centro: centroSum });
              } else {
                centros.push({ centro: "1001" });
                centros.push({ centro: centroSum });
              }
              item.Centros = centros;
              //}+@ES20240926
  
              tabla.push(item);
            }
  
            filasVacias = 10 - tabla.length;
            if (filasVacias == 0 || filasVacias < 0) {
              filasVacias = 1;
            }
  
            for (let index = 0; index < filasVacias; index++) {
              tabla.push({
                Posnr: "", // `${index + 1}`,
                Werks: "",
                Lgort: "",
                Matnr: "",
                Maktx: "",
                Labst: "0.00",
                Vrkme: "",
                Zmeng: "",
                Precio: "0.00",
                PrecioDesc: "0.00",
                PrecioLista: "0.00",
                PrecioMin: "0.00",
                Desc: "0.00",
                Flete: "0.00",
                Subtotal: "0.00",
                PrecioFlete: "0.00",
                PrecioOriginal: "0.00",
                KschaOriginal: "0.00",
                DescOriginal: "0.00",
                FleteOriginal: "0.00",
                ZmengOriginal: "0.00",
                Netwr: "0.00",
                Mwsbp: "0.00",
              });
            }
  
            // { > Calcula Subtotal
            let subtotal = 0;
            for (const item of tabla) {
              subtotal = Number(item.Subtotal) + subtotal;
            }
            oLocal.setProperty("/Footer/SubTotal", subtotal);
            oLocal.setProperty("/PosPedidos/Tabla", tabla);
          },
  
          setPosicionPedMat: function (sIndex, oData) {
            let sPath = `/PosPedidos/Tabla/${sIndex}`;
  
            oLocal.setProperty(`${sPath}/Werks`, oData.EsVwerk);
            oLocal.setProperty(`${sPath}/Lgort`, oData.EsLgort);
  
            const item = oData.EsItemMaterial2;
            oLocal.setProperty(
              `${sPath}/Labst`,
              this.formatter.importe(item.Labst)
            );
            oLocal.setProperty(`${sPath}/Maktx`, item.Maktx);
            oLocal.setProperty(`${sPath}/Vrkme`, item.Meins);
            oLocal.setProperty(
              `${sPath}/Precio`,
              this.formatter.importe(item.Precio)
            );
            oLocal.setProperty(
              `${sPath}/PrecioDesc`,
              this.formatter.importe(item.PrecioDesc)
            );
            oLocal.setProperty(
              `${sPath}/PrecioLista`,
              this.formatter.importe(item.PrecioLista)
            );
            oLocal.setProperty(
              `${sPath}/PrecioMin`,
              this.formatter.importe(item.PrecioMin)
            );
            oLocal.setProperty(
              `${sPath}/Zmeng`,
              this.formatter.cantidad(item.Zmeng)
            );
            oLocal.setProperty(
              `${sPath}/Desc`,
              this.formatter.importe(item.Desc)
            );
            oLocal.setProperty(
              `${sPath}/Flete`,
              this.formatter.importe(item.Flete)
            );
          },
  
          setPosicionPed: function (sIndex, oItem) {
            let sPath = `/PosPedidos/Tabla/${sIndex}`;
  
            oLocal.setProperty(`${sPath}/Posnr`, `${sIndex + 1}`);
            oLocal.setProperty(`${sPath}/Vrkme`, oItem.Vrkme);
            oLocal.setProperty(
              `${sPath}/Zmeng`,
              this.formatter.cantidad(oItem.Zmeng)
            );
            oLocal.setProperty(
              `${sPath}/Precio`,
              this.formatter.importe(oItem.Precio)
            );
            oLocal.setProperty(
              `${sPath}/PrecioDesc`,
              this.formatter.importe(oItem.PrecioDesc)
            );
            oLocal.setProperty(
              `${sPath}/PrecioLista`,
              this.formatter.importe(oItem.PrecioLista)
            );
            oLocal.setProperty(
              `${sPath}/PrecioMin`,
              this.formatter.importe(oItem.PrecioMin)
            );
            oLocal.setProperty(
              `${sPath}/Desc`,
              this.formatter.importe(oItem.Desc)
            );
            oLocal.setProperty(
              `${sPath}/Flete`,
              this.formatter.importe(oItem.Flete)
            );
            oLocal.setProperty(
              `${sPath}/Subtotal`,
              this.formatter.importe(oItem.Subtotal)
            );
            oLocal.setProperty(
              `${sPath}/PrecioFlete`,
              this.formatter.importe(oItem.PrecioFlete)
            );
            oLocal.setProperty(
              `${sPath}/PrecioOriginal`,
              this.formatter.importe(oItem.PrecioOriginal)
            );
            oLocal.setProperty(
              `${sPath}/KschaOriginal`,
              this.formatter.importe(oItem.KschaOriginal)
            );
            oLocal.setProperty(
              `${sPath}/DescOriginal`,
              this.formatter.importe(oItem.DescOriginal)
            );
            oLocal.setProperty(
              `${sPath}/FleteOriginal`,
              this.formatter.importe(oItem.FleteOriginal)
            );
            oLocal.setProperty(
              `${sPath}/ZmengOriginal`,
              this.formatter.importe(oItem.ZmengOriginal)
            );
            oLocal.setProperty(
              `${sPath}/Netwr`,
              this.formatter.importe(oItem.Netwr)
            );
            oLocal.setProperty(
              `${sPath}/Mwsbp`,
              this.formatter.importe(oItem.Mwsbp)
            );
          },
  
          getPosicionesPed: function () {
            const data = [];
            const tablaPed = oLocal.getProperty("/PosPedidos/Tabla");
  
            for (const item of tablaPed) {
              if (item.Matnr == "") {
                continue;
              }
  
              data.push({
                Posnr: this.formatter.cadenaDec(item.Posnr), // "1",
                Werks: this.formatter.cadena(item.Werks), // "1001",
                Lgort: this.formatter.cadena(item.Lgort), // "1002",
                Matnr: this.formatter.cadena(item.Matnr), // "7100100066",
                Maktx: this.formatter.cadena(item.Maktx), // "SEM.PEPINILLO SALVADOR F1 X 15 MIL",
                Labst: this.formatter.cadenaDec(item.Labst), // "30710.00",
                Vrkme: this.formatter.cadena(item.Vrkme), // "UN",
                Zmeng: this.formatter.cadenaDec(item.Zmeng), // "0.00",
                Precio: this.formatter.cadenaDec(item.Precio), // "280.00",
                PrecioDesc: this.formatter.cadenaDec(item.PrecioDesc), // "280.00",
                PrecioLista: this.formatter.cadenaDec(item.PrecioLista), // "280.00",
                PrecioMin: this.formatter.cadenaDec(item.PrecioMin), // "280.00",
                Desc: this.formatter.cadenaDec(item.Desc), // "0.00",
                Flete: this.formatter.cadenaDec(item.Flete), // "0.00",
                Subtotal: this.formatter.cadenaDec(item.Subtotal), // "0.00",
                Descripcion: this.formatter.cadena(item.Descripcion), // "",
                TtDesc: this.formatter.cadena(item.TtDesc), // "",
                Kscha: this.formatter.cadena(item.Kscha), // "",
                Correl: this.formatter.cadena(item.Correl), // "",
                PrecioFlete: this.formatter.cadenaDec(item.PrecioFlete),
                PrecioOriginal: this.formatter.cadenaDec(item.PrecioOriginal),
                KschaOriginal: this.formatter.cadenaDec(item.KschaOriginal),
                DescOriginal: this.formatter.cadenaDec(item.DescOriginal),
                FleteOriginal: this.formatter.cadenaDec(item.FleteOriginal),
                ZmengOriginal: this.formatter.cadenaDec(item.ZmengOriginal),
                Netwr: this.formatter.cadenaDec(item.Netwr),
                Mwsbp: this.formatter.cadenaDec(item.Mwsbp),
              });
            }
  
            return data;
          },
  
          getPosicionPed: function (sIndex) {
            const sPath = `/PosPedidos/Tabla/${sIndex}`;
            const data = {
              // Posnr: oLocal.getProperty(`${sPath}/Posnr`),
              Posnr: `${Number(sIndex) + 1}`,
              Werks: oLocal.getProperty(`${sPath}/Werks`),
              Lgort: oLocal.getProperty(`${sPath}/Lgort`),
              Labst: oLocal.getProperty(`${sPath}/Labst`),
              Precio: oLocal.getProperty(`${sPath}/Precio`),
              PrecioDesc: oLocal.getProperty(`${sPath}/PrecioDesc`),
              PrecioLista: oLocal.getProperty(`${sPath}/PrecioLista`),
              PrecioMin: oLocal.getProperty(`${sPath}/PrecioMin`),
              Zmeng: oLocal.getProperty(`${sPath}/Zmeng`),
              Matnr: oLocal.getProperty(`${sPath}/Matnr`),
              Maktx: oLocal.getProperty(`${sPath}/Maktx`),
              Desc: oLocal.getProperty(`${sPath}/Desc`),
              Flete: oLocal.getProperty(`${sPath}/Flete`),
            };
  
            data.Werks = this.formatter.cadena(data.Werks);
            data.Lgort = this.formatter.cadena(data.Lgort);
            data.Labst = this.formatter.cadenaDec(data.Labst);
            data.Precio = this.formatter.cadenaDec(data.Precio);
            data.PrecioDesc = this.formatter.cadenaDec(data.PrecioDesc);
            data.PrecioLista = this.formatter.cadenaDec(data.PrecioLista);
            data.PrecioMin = this.formatter.cadenaDec(data.PrecioMin);
            data.Zmeng = this.formatter.cadenaDec(data.Zmeng);
            data.Matnr = this.formatter.cadena(data.Matnr);
            data.Maktx = this.formatter.cadena(data.Maktx);
            data.Desc = this.formatter.cadenaDec(data.Desc);
            data.Flete = this.formatter.cadenaDec(data.Flete);
  
            return data;
          },
  
          actionEnterCantidad: function (oEvent, sIndex) {
            const oService = this.manager.getService("PEDIDOS");
            const uri =
              "/CreapediSet?/$expand=creapedi_materiales_nav,creapedi_messages2_nav";
            const sPath = `/PosPedidos/Tabla/${sIndex}`;
            const data = {
              Accion: "ENTER_CANTIDAD",
              // IsKunnr: oLocal.getProperty("/Solicitante"), //-@ES20250321
              IsKunnr: oLocal.getProperty("/DestMerc"),       //+@ES20250321
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsLgort: oLocal.getProperty(`${sPath}/Lgort`),
              IsSpart: oLocal.getProperty("/Sector"),
              IsPltyp: oLocal.getProperty("/ListaPrecios"),
              IsMoneda: oLocal.getProperty("/Moneda"),
              EsItemMaterial: this.getPosicionPed(sIndex),
              creapedi_materiales_nav: this.getPosicionesPed(),
              creapedi_messages2_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("ENTER CANTIDAD", oData);
                if (oData) {
                  this.inputBGColor(oEvent, "custBGColor2", false); //+@
                  this.clearCalcularPlazo();
                  this.setFooter(oData.EsFooter);
                  this.setPosicionesPed(oData.creapedi_materiales_nav.results);
                  this.showMensajeStrip(oData.creapedi_messages2_nav.results);
                }
              }.bind(this),
              error: function (oError) {
                console.error("oError (error)", oError);
              },
            });
          },
  
          actionEnterCantidad2: function (sIndex) {
            const oService = this.manager.getService("PEDIDOS");
            const uri =
              "/CreapediSet?/$expand=creapedi_materiales_nav,creapedi_messages2_nav";
            const sPath = `/PosPedidos/Tabla/${sIndex}`;
            const data = {
              Accion: "ENTER_CANTIDAD",
              // IsKunnr: oLocal.getProperty("/Solicitante"), //-@ES20250321
              IsKunnr: oLocal.getProperty("/DestMerc"),       //+@ES20250321
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsLgort: oLocal.getProperty(`${sPath}/Lgort`),
              IsSpart: oLocal.getProperty("/Sector"),
              IsPltyp: oLocal.getProperty("/ListaPrecios"),
              IsMoneda: oLocal.getProperty("/Moneda"),
              EsItemMaterial: this.getPosicionPed(sIndex),
              creapedi_materiales_nav: this.getPosicionesPed(),
              creapedi_messages2_nav: [],
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
                // console.log("ENTER CANTIDAD", oData);
                if (oData) {
                  this.manager.setBusy(false);
                  // oEvent.getSource().removeStyleClass("custBGColor2"); //+@
                  this.clearCalcularPlazo();
                  this.setFooter(oData.EsFooter);
                  this.setPosicionesPed(oData.creapedi_materiales_nav.results);
                  this.showMensajeStrip(oData.creapedi_messages2_nav.results);
                }
              }.bind(this),
              error: function (oError) {
                console.error("oError (error)", oError);
              },
            });
          },
  
          // SELECCIONAR SOLICITANTE
          selSolicitante: function (item) {
            const oService = this.manager.getService("PEDIDOS");
            const oModel = new JSONModel();
            const uri = "/CreapediSet?/$expand=creapedi_messages2_nav";
            const data = {
              Accion: "SELSOLICITANTE",
              IsKunnr: item.kunnr,
              IsVkorg: item.vkorg,
              IsVtweg: item.vtweg,
              IsSpart: item.spart,
              IsNpag: "1",
              IsRegxpag: "1000",
              EsDestinatario: {},
              creapedi_messages2_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("SELSOLICITANTE (success)", oData);
                oModel.setData(oData);
  
                const mensajes = oData.creapedi_messages2_nav.results;
                if (this.showMensajeStrip(mensajes)) {
                  this.setValoresSel("SELSOLICITANTE", oData);
                  this.matchcodeDestMercancia();
                }
              }.bind(this),
              error: function (oError) {
                console.error("Data sel solicitante CP (error)", oError);
              },
            });
            this.getView().setModel(oModel, "oDataSoli");
          },
  
          selDestinatario: function () {
            const oService = this.manager.getService("PEDIDOS");
            const oModel = new JSONModel();
            const uri = "/CreapediSet?/$expand=creapedi_messages_nav";
            const data = {
              Accion: "SELDESTINATARIO",
              IsKunnr: oLocal.getProperty("/DestMerc"),
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsSpart: oLocal.getProperty("/Sector"),
              IsNpag: "1",
              IsRegxpag: "1000",
              EsDestinatario: {},
              creapedi_messages_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("SELDESTINATARIO (success)", oData);
                oModel.setData(oData);
                this.setValoresSel("SELDESTINATARIO", oData);
              }.bind(this),
              error: function (oError) {
                console.error("Data sel destinatario CP (error)", oError);
              },
            });
            this.getView().setModel(oModel, "oDataDest");
          },
  
          selMaterial: function (sMaterial) {
            const oService = this.manager.getService("PEDIDOS");
            const oModel = new JSONModel();
            const uri =
              "/CreapediSet?/$expand=creapedi_materialessel_nav,creapedi_messages2_nav";
            const data = {
              Accion: "SELMATERIAL",
              IsKunnr: oLocal.getProperty("/Solicitante"),
              IsMatnr: sMaterial,
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsSpart: oLocal.getProperty("/Sector"),
              IsPltyp: oLocal.getProperty("/ListaPrecios"),
              IsMoneda: oLocal.getProperty("/Moneda"),
              EsDestinatario: {},
              EsItemMaterial: {},
              creapedi_messages2_nav: [],
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("SELMATERIAL (success)", oData);
                oModel.setData(oData);
                const mensajes = oData.creapedi_messages2_nav.results;
                if (this.showMensajeStrip(mensajes)) {
                  this.setValoresSel("SELMATERIAL", oData);
                }
              }.bind(this),
              error: function (oError) {
                console.error("SELMATERIAL (error)", oError);
              },
            });
            this.getView().setModel(oModel, "oDataSoli");
          },
  
          setMoneda: function (rbMonedas) {
            // oLocal.setProperty("/Moneda", rbMonedas);
            const mobweb = this.getView().byId("rbtnMonedaCPMob");
  
            switch (rbMonedas) {
              case "1":
                mobweb.setSelectedIndex(0);
                oLocal.setProperty("/MonedaDesc", i18n.getText("Soles"));
                break;
              case "2":
                mobweb.setSelectedIndex(1);
                oLocal.setProperty("/MonedaDesc", i18n.getText("Dolares"));
                break;
              default:
                break;
            }
          },
  
          setClaseDoc: function (rbClaseDoc) {
  
            const mobwebClasesDoc = this.getView().byId("rbtnClaseDocCPMob");
  
            switch (rbClaseDoc) {
              case "1":
                mobwebClasesDoc.setSelectedIndex(0);
                break;
              case "2":
                mobwebClasesDoc.setSelectedIndex(1);
                break;
              default:
                break;
            }
          },
  
          setValoresSel: function (control, oData) {
            let sDesti;
            switch (control) {
              case "SELSOLICITANTE":
                sDesti = oData.EsDestinatario;
                oLocal.setProperty("/CanalDist", oData.IsVtweg);
                // oLocal.setProperty("/Sector", oData.IsSpart);
                oLocal.setProperty("/ListaPrecios", sDesti.Pltyp);
                oLocal.setProperty(
                  "/ListaPreciosInfo",
                  `${sDesti.Pltyp} (${sDesti.Pltyptxt})`
                );
                // oLocal.setProperty("/ListaPreciosInfo", sDesti.Pltyptxt);
                oLocal.setProperty("/CondPago", sDesti.Zterm);
                oLocal.setProperty("/CondPagoInfo", sDesti.Condicion);
  
                this.setMoneda(sDesti.RbMonedas);
                this.setClaseDoc(sDesti.RbClaseDoc); //+@JR08112024
  
                // oLocal.setProperty("/CentroSum", sDesti.Vwerk); //-@ES20241112
                oLocal.setProperty("/Stcd1", sDesti.Stcd1);
                // oLocal.setProperty("/ListaPrecios", sDesti.Pltyp);
                oLocal.setProperty("/Moneda", sDesti.RbMonedas);
  
                const mobwebChkFlete = this.getView().byId("chkFleteCPMob");
  
  
                if (sDesti.ChkFlete == "X") {
                  mobwebChkFlete.setSelected(true);
                } else {
                  mobwebChkFlete.setSelected(false);
                }
  
                oLocal.setProperty("/editable/DestMerc", true);
                oLocal.setProperty("/editable/NroPedCliente", true);
                oLocal.setProperty("/editable/ObsGuia", true);
                oLocal.setProperty("/editable/ObsFactura", true);
                oLocal.setProperty("/editable/Transp", true);
  
                // this.getView().byId("txtDestMercCP").setEditable(true);
                // this.getView().byId("txtNroPedClienteCP").setEditable(true);
                // this.getView().byId("txtObsGuiaCP").setEditable(true);
                // this.getView().byId("txtObsFacturaCP").setEditable(true);
                // this.getView().byId("txtTranspCP").setEditable(true);
  
                if (sDesti.Kunn2.length > 0) {
                  oLocal.setProperty("/Solicitante", sDesti.Kunnr);
                  oLocal.setProperty("/SolicInfo", sDesti.Solicitante);
                  oLocal.setProperty("/DestMerc", sDesti.Kunn2);
                  oLocal.setProperty("/DestMercInfo", sDesti.Destinatario);
                  // this.onPress(null, "DestMerc");
                  this.selDestinatario();
                }
  
                break;
  
              case "SELDESTINATARIO":
                sDesti = oData.EsDestinatario;
                oLocal.setProperty("/Comercial", sDesti.Comercial);
                oLocal.setProperty("/GrupoVend", sDesti.Vkgrp);
                oLocal.setProperty(
                  "/GrupoVendInfo",
                  `${sDesti.Vkgrp} (${sDesti.Gpovend})`
                );
                // oLocal.setProperty("/GrupoVendInfo", sDesti.Gpovend);
                oLocal.setProperty("/OfiVentas", sDesti.Vkbur);
                oLocal.setProperty(
                  "/OfiVentasInfo",
                  `${sDesti.Vkbur} (${sDesti.Oficina})`
                );
                // oLocal.setProperty("/OfiVentasInfo", sDesti.Oficina);
                oLocal.setProperty("/CentroSum", sDesti.Vwerk); //+@ES20241112
                break;
  
              case "SELMATERIAL":
                const index = Number(oLocal.getProperty("/PosPedidos/Index"));
  
                this.setPosicionPed(index, oData.EsItemMaterial);
                this.actionEnterMaterial(index);
  
                break;
              default:
                break;
            }
          },
  
          onOkPress: function (oEvent, oDialog) {
            switch (oDialog) {
              case "dialogCalcPlazoCP":
                this.actionCalcPlazoOk();
                break;
            }
          },
  
          onCancelPress: function (oEvent, oDialog) {
            switch (oDialog) {
              case "dialogSolicitanteCP":
                this.byId(oDialog).close();
                this.byId(oDialog).destroy();
                break;
              case "dialogMaterialCP":
                this.byId(oDialog).close();
                this.byId(oDialog).destroy();
                break;
              case "dialogCalcPlazoCP":
                this.byId(oDialog).close();
                this.byId(oDialog).destroy();
                break;
            }
          },
  
          onAfterClose: function (oEvent, oDialog) {
            switch (oDialog) {
              case "dialogSolicitanteCP":
                this.byId(oDialog).destroy();
                break;
              case "dialogMaterialCP":
                this.byId(oDialog).destroy();
                break;
              default:
                break;
            }
          },
  
          onRowSelectionChange: function (oEvent) { },
  
          onPressBorrarProducto: function (oEvent) {
            // let index = this.getView().byId("tblCrearPedidos").getSelectedIndex();
            let index = this.getView()
              .byId("tblCrearPedidosMob")
              .getSelectedIndex();
            this.actionBorrarProducto(index);
          },
  
          setFooter: function (oData) {
            oLocal.setProperty(
              `/Footer/SubTotal`,
              this.formatter.importe(oData.EsSubtotalPed)
            );
            oLocal.setProperty(
              `/Footer/IGV`,
              this.formatter.importe(oData.EsIvaPed)
            );
            oLocal.setProperty(
              `/Footer/Total`,
              this.formatter.importe(oData.EsTotalPed)
            );
          },
  
          actionBorrarProducto: function (index) {
            const oService = this.manager.getService("PEDIDOS");
            const uri =
              "/CreapediSet?/$expand=creapedi_materiales_nav,creapedi_messages2_nav";
            const sPath = `/PosPedidos/Tabla/${index}`;
            const data = {
              Accion: "DELETE_MATERIAL",
              IsKunnr: oLocal.getProperty("/Solicitante"),
              IsVkorg: oLocal.getProperty("/OrgVentas"),
              IsVtweg: oLocal.getProperty("/CanalDist"),
              IsLgort: oLocal.getProperty(`${sPath}/Lgort`),
              IsSpart: oLocal.getProperty("/Sector"),
              IsPltyp: oLocal.getProperty("/ListaPrecios"),
              IsMoneda: oLocal.getProperty("/Moneda"),
              creapedi_materiales_nav: this.getPosicionesPed(),
              creapedi_messages2_nav: [],
              EsItemMaterial: this.getPosicionPed(index),
            };
  
            oService.setHeaders({ 
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });
            
            oService.create(uri, data, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("ENTER CANTIDAD", oData);
                // this.getView().byId("tblCrearPedidos").clearSelection(); //+@
                this.getView()
                  .byId("tblCrearPedidosMob")
                  .clearSelection();
                this.setFooter(oData.EsFooter);
                this.setPosicionesPed(oData.creapedi_materiales_nav.results);
                this.showMensajeStrip(oData.creapedi_messages2_nav.results);
              }.bind(this),
              error: function (oError) {
                console.error("oError (error)", oError);
              },
            });
          },
  
          clearPanelMsg: function () {
            const panelMsg = this.byId("panelMsgStripCPMob");
            if (panelMsg) {
              this.byId("panelMsgStripCPMob").destroyContent();
              oLocal.setProperty("/visible/Panel", false);
            }
            oLocal.setProperty("/chkMessages", false);
          },
  
          onLimpiarCampos: function () {
            this.initialLocal();
            this.clearPanelMsg();
          },
  
          onBuscarProducto: function () {
            this.matchcodeMaterial();
          },
  
          onLimpiarProducto: function () {
            this.initialMCMaterial();
            this.matchcodeMaterial();
          },
  
          onBuscarSolicitante: function () {
            this.matchcodeSolicitante();
          },
  
          onLimpiarSolicitante: function () {
            this.initialMCSolicitante();
            this.matchcodeSolicitante();
          },
  
          showMensajeStrip: function (aMensajes) {
            this.clearPanelMsg();
  
            let i = 0;
            let ok = true;
            for (const msg of aMensajes) {
              i++;
              const mensaje = `${msg.Message} ${msg.Message1}`;
              const id = `msgStripCP${i}`;
  
              this.setMensajeStrip(id, msg.Success, mensaje);
              if (msg.Success == "E" || msg.Success == "") {
                ok = false;
              }
            }
  
            const chkMessages = oLocal.getProperty("/chkMessages");
            if (chkMessages) {
              oLocal.setProperty("/visible/Panel", true);
              this.getView().getParent().scrollTo(0, 0, 600);
            } else {
              oLocal.setProperty("/visible/Panel", false);
            }
  
            return ok;
          },
  
          setMensajeStrip: function (sId, sType, sText) {
            let msgType;
  
            switch (sType) {
              case "E":
                msgType = "Error";
                break;
              case "S":
                msgType = "Success";
                break;
              case "W":
                msgType = "Warning";
                break;
              case "I":
                msgType = "Information";
                break;
              default:
                return;
            }
  
            const oMsgStrip = new MessageStrip(sId, {
              text: sText,
              showCloseButton: false,
              showIcon: true,
              type: msgType,
            });
  
            oLocal.setProperty("/chkMessages", true);
            this.byId("panelMsgStripCPMob").addContent(oMsgStrip);
          },
  
          onLiveChange: function (oEvent, sInput) {
            const oInput = oEvent.getSource();
            // let valor = oInput.getValue(); //-@ES20250214
            let index = null;
  
            switch (sInput) {
              case "PRECFIN":
                index = oEvent
                  .getSource()
                  .getBindingContext("local")
                  .getPath()
                  .replace("/PosPedidos/Tabla/", "");
  
                oLocal.setProperty(`/PosPedidos/Tabla/${index}/posChanged`, true);
                this.inputBGColor(oEvent, "custBGColor2", true); //+@
                break;
              case "ZMENG":
                index = oEvent
                  .getSource()
                  .getBindingContext("local")
                  .getPath()
                  .replace("/PosPedidos/Tabla/", "");
  
                oLocal.setProperty(`/PosPedidos/Tabla/${index}/posChanged`, true);
                this.inputBGColor(oEvent, "custBGColor2", true); //+@
  
                // valor = valor.replace(/[^\d]/g, ""); //-@ES20250214
                // oInput.setValue(valor); //-@ES20250214
                break;
              case "NROLETRAS":
                // valor = valor.replace(/[^\d]/g, ""); //-@ES20250214
                // oInput.setValue(valor); //-@ES20250214
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
              case "CONDPAGO":
                this.matchcodeCondPago(false);
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
  
              // case "ORGVENTAS":
              //   let oCells = oEvent.getParameter("selectedRow").getCells();
              //   oLocal.setProperty("/OrgVentas", oCells[0].getText());
              //   oLocal.setProperty("/Sector", oCells[2].getText());
              //   this.onPress(null, "OrgVentas");
              //   break;
  
              case "SOLICITANTE":
                oLocal.setProperty("/Solicitante", oSel.getKey());
                oLocal.setProperty("/SolicInfo", oSel.getAdditionalText());
                this.onPress(null, "Solicitante");
                break;
              case "DESTMERCANCIA":
                oLocal.setProperty("/DestMerc", oSel.getKey());
                oLocal.setProperty("/DestMercInfo", oSel.getAdditionalText());
                this.onPress(null, "DestMerc");
                break;
  
              case "TRANSPORTISTA":
                oLocal.setProperty("/Transportista", oSel.getKey());
                oLocal.setProperty("/TranspInfo", oSel.getAdditionalText());
                this.onPress(null, "Transportista");
                break;
  
              default:
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
        }
      );
    }
  );
  