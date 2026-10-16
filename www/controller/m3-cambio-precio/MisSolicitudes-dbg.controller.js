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
      "com.axelera.pe.gestioncomercial.view.m3-cambio-precio.mis-solicitudes";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m3-cambio-precio.MisSolicitudes",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("CP02", "Clear", this.onInitMisSolicitudes, this);
        },

        onInitMisSolicitudes: function (channel, event, oData) {
          this.initialization(oData.active);
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
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
            EstadoItem: "",
            NroSol: "",
            OrgVentas: "",
            OrgVentasInfo: "",
            Sector: "",
            SectorInfo: "",
            Cliente: "",
            Solicitudes: {
              items: [],
            },
            Materiales: {
              items: [],
            },
            MaterialEdit: {},
            Material: {
              Id: 0,
              MaterialInfo: "",
              Material: "",
              MaterialTxt: "",
              PrecioAct: "",
              PrecioSug: "",
              Moneda: "",
              LimiteInf: "",
              Margen: "",
              FechaIni: null,
              FechaFin: null,
            },
            mcCliente: {
              Cliente: "",
              NombreCliente: "",
              RUC: "",
            },
            Sociedad: this.manager.getBukrs(), //+@ES
            IsIdsolicitud: 0,
            Nota: "",
            NotaResp: "",
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
            success: function (oData) {
              // console.log("Data matchcodes (success): Mis Solicitudes Org Ventas",oData );
              this.manager.setBusy(false);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOrgVentas");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
              this.manager.setBusy(false);
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataMCOrgVentas");
        },

        matchcodeCliente: function (popup) {
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

          const oService = this.manager.getService("CAMBIOP");
          const oModel = new JSONModel();
          const uri = "/MatcodeSet?/$expand=matcode_clientes_nav";

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData) {
              // console.log("Data matchcodes (success): Mis Solicitudes Clientes",oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeCliente");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
            },
          });

          this.getView().setModel(oModel, "oDataMCCliente");
        },

        prepareCallReport: function () {
          const data = {
            Accion: "LISTAR_SOLIC",
            IsIdusuario: this.manager.getIdUser(), // 37 - id de usuario en sesion con rol COMERCIAL
            IsIdsolicitud: Number(oLocal.getProperty("/NroSol")),
            IsEstado: Number(oLocal.getProperty("/Estado")),
            IsVkorg: oLocal.getProperty("/OrgVentas"),
            IsSpart: oLocal.getProperty("/Sector"), //+@
            IsKunnr: oLocal.getProperty("/Cliente"),
            IsFecha1: this.formatter.fechaEstandard( oLocal.getProperty("/FechaDesde") ), // @JR
            IsFecha2: this.formatter.fechaEstandard( oLocal.getProperty("/FechaHasta") ), // @JR
            IsSolicitudCab: {},
            cp_solicitudes_nav: [],
            Pagination: {
              Indice: 0,
              CantidadFilas: 0,
              Total: 0,
            },
          };

          data.IsFecha1 = this.formatter.cadenaFecha(data.IsFecha1);
          data.IsFecha2 = this.formatter.cadenaFecha(data.IsFecha2);

          return data;
        },

        callReport: async function (data, page, indice, busy) {
          const oService = this.manager.getService("CAMBIOP");
          const uri = "/CambioPrecioSet?/$expand=cp_solicitudes_nav";

          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", indice);
          busy && oLocal.setProperty("/loadingTbl", true);

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
              this.setSolicitudes(oData.cp_solicitudes_nav.results);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.updatePagination(oData.Pagination.Total);
            }.bind(this),
            error: function (oError) {
              busy && oLocal.setProperty("/loadingTbl", false);
              console.error("Data mis solicitudes (error):", oError);
            },
          });
        },

        onBuscar: function () {
          const fecha = oLocal.getProperty("/FechaDesde");

          if (typeof fecha == "object" && fecha !== null) {
            // this.onListarMisSolicitudes();
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

        onConfirmPress: function (oEvent, oDialog) {
          let oSelected, oCells;

          switch (oDialog) {
            case "dialogOrgVentasMS":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/OrgVentas", oCells[0].getTitle());
              oLocal.setProperty("/OrgVentasInfo", oCells[1].getText());
              oLocal.setProperty("/Sector", oCells[2].getText());
              oLocal.setProperty("/SectorInfo", oCells[3].getText());
              break;
            case "dialogClienteMS":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/Cliente", oCells[0].getTitle());
              oLocal.setProperty("/ClienteInfo", oCells[1].getText());
              break;
            default:
              break;
          }

          this.onCancelPress(null, oDialog);
        },

        onCancelPress: function (oEvent, oDialog) {
          switch (oDialog) {
            case "dialogClienteMS":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              this.initialMCCliente();
              break;
            case "dialogDetalleSolMS":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogOrgVentasMS":
              // gTableSelectDialogOrgVentas.close();
              break;
          }
        },

        matchcodeSearch: function (oEvent, oDialog) {
          const sValue = oEvent.getParameter("value");
          let aFilters;

          switch (oDialog) {
            case "dialogOrgVentasMS":
              aFilters = [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogClienteMS":
              aFilters = [
                new Filter("Kunnr", FilterOperator.Contains, sValue),
                new Filter("Name1", FilterOperator.Contains, sValue),
                new Filter("Zona", FilterOperator.Contains, sValue),
                new Filter("Stcd1", FilterOperator.Contains, sValue),
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

        onMatchcodeOrgVentas: function () {
          this.matchcodeOrgVentas(true);
        },

        onMatchcodeCliente: function () {
          this.displayPopup("MatchcodeCliente");
        },

        onLimpiarCliente: function () {
          this.initialMCCliente();
          this.getView().setModel(new JSONModel(), "oDataMCCliente");
        },

        onLimpiarCampos: function () {
          this.initialLocal();
        },

        onBuscarCliente: function () {
          const cliente = oLocal.getProperty("/mcCliente/Cliente");
          const nombCliente = oLocal.getProperty("/mcCliente/NombreCliente");
          const ruc = oLocal.getProperty("/mcCliente/RUC");
          
          if (cliente === "" && nombCliente === "" && ruc === "") {
            MessageBox.warning(i18n.getText("MsgMSIngresarFiltroBuscar"));
          } else {
            this.matchcodeCliente();
          }
        },

        setSolicitudes: function (data) {
          const tabla = [];

          if (data) {
            for (const item of data) {
              tabla.push({
                Id: item.Id,
                Fechacrea: item.Fechacrea,
                Orgventas: item.Orgventas,
                Sector: item.Sector,
                Clientetxt: item.Clientetxt,
                Estado: item.Estado,
              });
            }

            oLocal.setProperty("/Solicitudes/items", tabla);
          }
        },

        detalleSolicitud: function (id, popup) {
          const data = {
            Accion: "LISTARSOL_DET_SOLIC",
            IsIdsolicitud: Number(id),
            IsSolicitudCab: {},
            cp_solicitudesdet_nav: [],
          };

          const oService = this.manager.getService("CAMBIOP");
          const uri = "/CambioPrecioSet?/$expand=cp_solicitudesdet_nav";

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
              // oModel.setData(oData);
              if (oData.cp_solicitudesdet_nav.results.length > 0)
                this.setDataDetalleSol(oData);
              popup && this.displayPopup("DetalleSol");
            }.bind(this),
            error: function (oError) {
              console.error("Data mis solicitudes (error):", oError);
            },
          });
        },

        setDataDetalleSol: function (dataDet) {
          const tabla = [];
          oLocal.setProperty("/IsIdsolicitud", dataDet.IsIdsolicitud);
          const data = dataDet.cp_solicitudesdet_nav.results;
          const material = {
            Id: data[0].Id,
            Material: data[0].Material,
            MaterialTxt: data[0].Materialtxt,
            PrecioAct: data[0].Precioactual,                           //-@
            // PrecioAct: this.formatter.formatNumber(data[0].Precioactual), //+@
            PrecioSug: data[0].Preciosugerido,
            // PrecioSug: this.formatter.formatNumber(data[0].Preciosugerido),
            LimiteInf: data[0].Limiteinf,                           //-@
            // LimiteInf: this.formatter.formatNumber(data[0].Limiteinf), //+@
            Margen: data[0].Margen,
            Moneda: data[0].Moneda,
            FechaIni: this.formatter.fechaEstandardRet(data[0].Fechaini),
            FechaFin: this.formatter.fechaEstandardRet(data[0].Fechafin),
            Nota: data[0].Nota,
            NotaResp: data[0].Notaresp,
            CantidadSug: data[0].Cantidadsug,
          };
          oLocal.setProperty("/Material", material);
          tabla.push(material);
          oLocal.setProperty("/Materiales/items", [...tabla]);
        },

        anularSolicitud: function (sId) {
          const oService = this.manager.getService("CAMBIOP");
          const uri = "/CambioPrecioSet?/$expand=cp_mensajes_nav";
          const data = {
            Accion: "ANULAR",
            IsIdsolicitud: sId,
            IsEstado: 4,
            IsSolicitudCab: {},
            cp_mensajes_nav: [],
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
              // console.log("Data mis solicitudes (success)", oData);
              this.manager.msgResult3(oData.cp_mensajes_nav.results[0]);
              this.onBuscar();
              // this.getMisSolicitudes();
            }.bind(this),
            error: function (oError) {
              console.error("Data mis solicitudes (error):", oError);
            },
          });
        },

        eliminarSolicitud: function (sId) {
          const oService = this.manager.getService("CAMBIOP");
          const uri = "/CambioPrecioSet?/$expand=cp_mensajes_nav";
          const data = {
            Accion: "ELIMINAR",
            IsIdsolicitud: sId,
            IsEstado: 9,
            IsSolicitudCab: {},
            cp_mensajes_nav: [],
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
              // console.log("Eliminar mis solicitudes (success)", oData);
              this.manager.msgResult3(oData.cp_mensajes_nav.results[0]);
              this.onBuscar();
              // this.getMisSolicitudes();
            }.bind(this),
            error: function (oError) {
              console.error("Eliminar mis solicitudes (error):", oError);
            },
          });
        },

        onVerDetalle: function (oEvent) {
          const oSelectedItem = oEvent
            .getSource()
            .getParent()
            .getBindingContext("local")
            .getObject();

          const id = oSelectedItem.Id;
          oLocal.setProperty("/EstadoItem", oSelectedItem.Estado);
          // VER DETALLE
          this.detalleSolicitud(id, true);
        },

        onAnularSol: function (oEvent) {
          const oSelectedItem = oEvent
            .getSource()
            .getParent()
            .getBindingContext("local")
            .getObject();

          const id = Number(oSelectedItem.Id);

          MessageBox.warning(i18n.getText("MsgMSAnularSolTitle"), {
            title: i18n.getText("MsgMSAnularSolTitle"),
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: function (sAction) {
              if (sAction === MessageBox.Action.OK) {
                this.anularSolicitud(id);
              }
            }.bind(this),
            dependentOn: this.getView(),
          });
        },

        onEliminarSol: function (oEvent) {
          const oSelectedItem = oEvent
            .getSource()
            .getParent()
            .getBindingContext("local")
            .getObject();

          const id = Number(oSelectedItem.Id);

          MessageBox.warning(i18n.getText("MsgMSEliminarSolConf"), {
            title: i18n.getText("MsgMSEliminarSolTitle"),
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: function (sAction) {
              if (sAction === MessageBox.Action.OK) {
                this.eliminarSolicitud(id);
              }
            }.bind(this),
            dependentOn: this.getView(),
          });
        },

        onScreenEditarMaterial: function (oEvent) {
          const material = oLocal.getProperty("/Material");
          oLocal.setProperty("/MaterialEdit", { ...material });

          this.displayPopup("EditMaterial");
        },

        onCloseDialog: function (oEvent, sId) {
          let oDialog = this.byId(sId);
          if (oDialog) {
            oDialog.close();
            oDialog.destroy();
          }
        },

        prepareValidarPos: function (dialog) {
          const data = {
            Accion: "VALIDA_POS",
            cp_aprobmargen_nav: [],
            cp_solicitudesdet_nav: [],
            cp_mensajes_nav: [],
          };

          // const precioSuge = oLocal.getProperty("/MaterialEdit/PrecioSug");
          let precioSuge = oLocal.getProperty("/MaterialEdit/PrecioSug");
          precioSuge = `${parseFloat(precioSuge).toFixed(2)}`;

          const precioActual = oLocal.getProperty("/MaterialEdit/PrecioAct");
          const limiteInf = oLocal.getProperty("/MaterialEdit/LimiteInf");

          data.cp_aprobmargen_nav.push({
            Matnr: oLocal.getProperty("/Material/Material"),
            Werks: oLocal.getProperty("/Material/Centro"),
            PreSuge: `${precioSuge}`,
            Margen: "0",
          });

          data.cp_solicitudesdet_nav.push({
            Id: oLocal.getProperty("/Material/Id"),
            Material: oLocal.getProperty("/MaterialEdit/Material"),
            Moneda: oLocal.getProperty("/MaterialEdit/Moneda"),
            Precioactual: `${precioActual}`,
            Preciosugerido: `${precioSuge}`,
            Fechaini: oLocal.getProperty("/MaterialEdit/FechaIni"),
            Fechafin: oLocal.getProperty("/MaterialEdit/FechaFin"),
            Limiteinf: `${limiteInf}`,
            Limitesup: "0",
            Margen: "0", //  "1",
            Centro: oLocal.getProperty("/MaterialEdit/Centro"), // "",
            Unidadmedida: "",
            Importebase: "0.0",
            Nota: oLocal.getProperty("/MaterialEdit/Nota"),
            Notaresp: oLocal.getProperty("/MaterialEdit/NotaResp"),
            Cantidadsug: oLocal.getProperty("/MaterialEdit/CantidadSug"), //+@
          });

          this.callValidarPos(data, dialog);
        },

        callValidarPos: function (data, dialog) {
          const oService = this.manager.getService("CAMBIOP");
          const uri =
            "/CambioPrecioSet?/$expand=cp_aprobmargen_nav," +
            "cp_solicitudesdet_nav," +
            "cp_mensajes_nav";

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              // console.log("Data Valida Pos. (success)", oData);
              // const results = oData.cp_aprobmargen_nav.results;
              // if (results.length > 0) {
              //   oLocal.setProperty("/Material/Margen", results[0].Margen);
              // }
              const mensajes = oData.cp_mensajes_nav.results;
              const results = oData.cp_solicitudesdet_nav.results;

              if (mensajes.length > 0) {
                this.manager.msgResult4(mensajes);
              } else {
                this.setPosicionMat(results[0], dialog);
              }
            }.bind(this),
            error: function (oError) {
              console.error("Data Valida Pos. (error)", oError);
            },
          });
        },

        onOkPress: function (oEvent, sDialog) {
          const sociedad = this.manager.getBukrs();
          switch (sDialog) {
            case "dialogEditMaterialMS": 
              if (sociedad === '1000') {
                if (!this.onValidarPrecio("txtPrecioSugEditMS1000")) return;
              } else if (sociedad === '1200') {
                if (!this.onValidarPrecio("txtPrecioSugEditMS1200")) return;
              }
              if (!this.onValidarCampo("txtCantidadSugEditMS")) return;
              this.prepareValidarPos(sDialog);
              break;
            default:
              break;
          }
        },

        // onValidarCampo: function (sId, sType = "", sToast = "") {
        onValidarCampo: function (sId) {
          const oInput = this.getView().byId(sId);
          const sValue = oInput.getValue();
          let ok = true;

          // if (sToast == "X") {
          //   MessageToast.show(sMensaje);
          // }

          // if (sType == "E") {
          //   oInput.setValueState("Error");
          //   ok = false;
          // }

          if (sValue) {
            oInput.setValueState("None");
          } else {
            oInput.setValueState("Error");
            ok = false;
          }

          return ok;
        },

        onValidarPrecio: function (sId) {
          const oInput = this.getView().byId(sId);
          const sValue = oInput.getValue();
          let ok = true;

          let sValueUpd = sValue.replace(/[^0-9.,]/g, "");

          if (sValue !== sValueUpd) {
            oInput.setValue(sValueUpd);
          }
          
          if (sValueUpd) {
            oInput.setValueState("None");
          } else {
            oInput.setValueState("Error");
            ok = false;
          }

          return ok;
        },

        setPosicionMat: function (dataDetalle, sDialog) {
          // const data = {
          //   Id: dataDetalle.Id,
          //   Material: dataDetalle.Material,
          //   PrecioAct: dataDetalle.Precioactual,
          //   PrecioSug: dataDetalle.Preciosugerido,
          //   LimiteInf: dataDetalle.Limiteinf,
          //   Margen: "0",
          //   Moneda: dataDetalle.Moneda,
          //   FechaIni: dataDetalle.Fechaini,
          //   FechaFin: dataDetalle.Fechafin,
          //   Nota: dataDetalle.Nota,
          //   NotaResp: dataDetalle.Notaresp,
          //   Centro: dataDetalle.Centro, //+@
          //   CantidadSug: dataDetalle.Cantidadsug, //+@
          // };

          switch (sDialog) {
            case "dialogEditMaterialMS":
              this.editarDetalleSol();
              break;
            default:
              break;
          }
        },

        getMaterialEdit: function () {
          const item = oLocal.getProperty("/MaterialEdit");
          const data = [];

          data.push({
            Id: item.Id,
            // Idsolicitud: idSolic,
            Material: item.Material,
            Materialtxt: item.MaterialTxt,
            Moneda: item.Moneda,
            Precioactual: `${item.PrecioAct}`,
            Preciosugerido: `${item.PrecioSug}`,
            Fechaini: this.formatter.fechaEstandardRet(item.FechaIni), //+@
            Fechafin: this.formatter.fechaEstandardRet(item.FechaFin), //+@
            // Fechaini: item.FechaIni,
            // Fechafin: item.FechaFin,
            Limiteinf: `${item.LimiteInf}`,
            Limitesup: "0",
            Margen: item.Margen, //"1",
            Centro: "",
            Unidadmedida: "",
            Importebase: "0.0",
            Nota: item.Nota,
            Notaresp: item.NotaResp,
            Cantidadsug: item.CantidadSug, //+@
          });

          return data;
        },

        editarDetalleSol: function () {
          const oService = this.manager.getService("CAMBIOP");
          const uri = "/CambioPrecioSet?/$expand=cp_solicitudesdet_nav";
          const idSolic = oLocal.getProperty("/IsIdsolicitud");
          const data = {
            Accion: "EDITARDET_SOLIC",
            IsIdusuario: this.manager.getIdUser(),
            IsIdsolicitud: idSolic,
            IsSolicitudCab: {},
            cp_solicitudesdet_nav: this.getMaterialEdit(),
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
              // console.log("Data editar detalle (success)", oData);
              //   oModel.setData(oData.consulta_orgventas_nav.results);
              if (this.manager.msgResult2(oResponse)) {
                this.detalleSolicitud(idSolic, false);
                this.onBuscar();
                // this.onLimpiarCampos();
              }
              this.onCloseDialog(null, "dialogEditMaterialMS");
            }.bind(this),
            error: function (oError) {
              console.error("Data editar detalle (error)", oError);
            },
          });
        },

        // onValidarCampo: function (sId, sMensaje, sType, sToast) {
        //   const oInput = this.getView().byId(sId);
        //   const sValue = oInput.getValue();

        //   if (sToast == "X") {
        //     MessageToast.show(sMensaje);
        //   }

        //   if (sType == "E") {
        //     oInput.setValueState("Error");
        //     oInput.setValueStateText(sMensaje);
        //     return;
        //   }

        //   if (!sValue) {
        //     oInput.setValueState("Error");
        //     if (sMensaje) {
        //       oInput.setValueStateText(sMensaje);
        //     }
        //   } else {
        //     oInput.setValueState("None");
        //   }
        // },

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

        onScreenVerNota: function (oEvent) {
          const oSelectedItem = oEvent
            .getSource()
            .getParent()
            .getBindingContext("local")
            .getObject();
          oLocal.setProperty("/Nota", oSelectedItem.Nota);
          oLocal.setProperty("/NotaResp", oSelectedItem.NotaResp);
          this.displayPopup("VerNota");
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
