sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
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
    MessageToast,
    MessageBox,
    BusyDialog,
    Formatter,
    Manager
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var path =
      "com.axelera.pe.gestioncomercial.view.m3-cambio-precio.generar-solicitud";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m3-cambio-precio.GenerarSolicitud",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("CP01", "Clear", this.onInitGenerarSol, this);
        },

        onInitGenerarSol: function (channel, event, oData) {
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
            loading: false,
            OrgVentas: "",
            OrgVentasInfo: "",
            Sector: "",
            SectorInfo: "",
            Cliente: "",
            ClienteInfo: "",
            Materiales: {
              items: [],
            },
            Material: {
              MaterialInfo: "",
              Material: "",
              MaterialTxt: "",
              Centro: "", //+@
              OrgVentas: "", //+@
              Sector: "", //+@
              Margen: "",
              PrecioAct: "",
              PrecioSug: "",
              Moneda: "",
              LimiteInf: "",
              FechaIni: null,
              FechaFin: null,
              Nota: "", //+@
              CantidadSug: "", //+@
            },
            mcCliente: {
              Cliente: "",
              NombreCliente: "",
              RUC: "",
            },
            mcMaterial: {
              CodProducto: "",
              NombreProd: "",
            },
            Sociedad: this.manager.getBukrs(), //+@ES
            IsMobile: this.manager.isMobile(), //+@DEV-AS
          });
        },

        initialMaterial: function () {
          oLocal.setProperty("/Material", {
            Material: {
              MaterialInfo: "",
              Material: "",
              MaterialTxt: "",
              PrecioAct: "",
              PrecioSug: "",
              Moneda: "",
              LimiteInf: "",
              FechaIni: null,
              FechaFin: null,
              Nota: "",
              CantidadSug: "", //+@
            },
          });
        },

        initialMCCliente: function () {
          oLocal.setProperty("/mcCliente", {
            Cliente: "",
            NombreCliente: "",
            RUC: "",
          });
        },

        initialMCMaterial: function () {
          oLocal.setProperty("/mcMaterial", {
            CodProducto: "",
            NombreProd: "",
          });
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

          this.manager.isMobile() && SpinnerDialog.show();

          oService.read(uri, {
            method: "GET",
            success: function (oData, oResponse) {
              // // console.log("Data matchcodeOrgVentas (success)", oData);
              this.manager.setBusy(false);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOrgVentas");
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodeOrgVentas (error)", oError);
              this.manager.setBusy(false);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });

          this.getView().setModel(oModel, `oDataMCOrgVentas`);
        },

        matchcodeCliente: function () {
          const data = {
            Accion: "CLIENTES",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsKunnr: oLocal.getProperty("/mcCliente/Cliente"),
            IsName1: oLocal.getProperty("/mcCliente/NombreCliente"),
            IsStcd1: oLocal.getProperty("/mcCliente/RUC"),
            IsVkorg: oLocal.getProperty("/OrgVentas"),
            IsSpart: oLocal.getProperty("/Sector"), //+@
            matcode_clientes_nav: [],
          };

          const oService = this.manager.getService("CAMBIOP");
          const oModel = new JSONModel();
          const uri = "/MatcodeSet?/$expand=matcode_clientes_nav";

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
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodeCliente (error)", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });
          this.getView().setModel(oModel, `oDataMCCliente`);
        },

        matchcodeMaterial: function () {
          const data = {
            Accion: "MATERIALES",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsMatnr: oLocal.getProperty("/mcMaterial/CodProducto"), //+@
            IsNameMatnr: oLocal.getProperty("/mcMaterial/NombreProd"), //+@
            IsVkorg: oLocal.getProperty("/OrgVentas"),
            IsSpart: oLocal.getProperty("/Sector"),
            matcode_materiales2_nav: [],
          };

          const oService = this.manager.getService("CAMBIOP");
          const oModel = new JSONModel();
          const uri = "/MatcodeSet?/$expand=matcode_materiales2_nav";

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
              // console.log("Data matchcodeMaterial (success)", oData);
              oModel.setData(oData);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodeMaterial (error)", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });
          this.getView().setModel(oModel, `oDataMCMaterial`);
        },

        // onValidarCampo: function (sId, sMensaje, sType, sToast) {
        //   // const oInput = oEvent.getSource();
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

        setAddData: function (data) {
          oLocal.setProperty(
            "/Material/MaterialTxt",
            data.Maktx ? data.Maktx : ""
          );
          oLocal.setProperty(
            "/Material/PrecioAct",
            data.Kbetr ? Number(data.Kbetr) : 0
          );
          oLocal.setProperty(
            "/Material/LimiteInf",
            data.Mxwrt ? Number(data.Mxwrt) : 0
          );
          oLocal.setProperty("/Material/Moneda", data.Konwa ? data.Konwa : "");
          oLocal.setProperty(
            "/Material/FechaIni",
            this.convertToDate(data.Datab)
          );
          oLocal.setProperty(
            "/Material/FechaFin",
            this.convertToDate(data.Datbi)
          );
          oLocal.setProperty("/Material/Nota", data.Nota ? data.Nota : "");
          oLocal.setProperty(
            "/Material/CantidadSug",
            data.Cantidadsug ? data.Cantidadsug : ""
          );
        },

        getDataDetalleMaterial: function (sMaterial) {
          const data = {
            Accion: "MATERIAL_DET",
            IsKunnr: oLocal.getProperty("/Cliente"),
            IsVtweg: oLocal.getProperty("/Canalventas"),
            IsVkorg: oLocal.getProperty("/OrgVentas"),
            IsSpart: oLocal.getProperty("/Sector"), //+@ES20241202
            cp_matnr_nav: [],
            cp_materiales_nav: [],
          };

          if (sMaterial.length > 0) {
            data.cp_matnr_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: sMaterial,
              High: "",
            });
          }
          return data;
        },

        convertToDate: function (dateStr) {
          if (!dateStr) return null;
          const year = parseInt(dateStr.substring(0, 4), 10);
          const month = parseInt(dateStr.substring(4, 6), 10) - 1;
          const day = parseInt(dateStr.substring(6, 8), 10);
          return new Date(year, month, day);
        },

        onMatchcodeCliente: function () {
          this.initialMCCliente();
          this.displayPopup("MatchcodeCliente");
        },

        onMatchcodeMaterial: function () {
          this.initialMCMaterial();
          this.displayPopup("MatchcodeMaterial");
        },

        onMatchcodeOrgVentas: function () {
          this.matchcodeOrgVentas(true);
        },

        // onScreenEditarMaterial: function (oEvent) {
        //   const oSelectedItem = oEvent
        //     .getSource()
        //     .getParent()
        //     .getBindingContext("local")
        //     .getObject();

        //   // oLocal.setProperty({ Material: oSelectedItem }); //TEMPORAL
        //   const materialInfo = `${oSelectedItem.MaterialTxt} (${oSelectedItem.Material})`; //+@
        //   oLocal.setProperty("/Material", {
        //     MaterialInfo: materialInfo, //+@
        //     Material: oSelectedItem.Material,
        //     MaterialTxt: oSelectedItem.MaterialTxt,
        //     PrecioAct: oSelectedItem.PrecioAct,
        //     PrecioSug: oSelectedItem.PrecioSug,
        //     Moneda: oSelectedItem.Moneda,
        //     LimiteInf: oSelectedItem.LimiteInf,
        //     FechaIni: oSelectedItem.FechaIni,
        //     FechaFin: oSelectedItem.FechaFin,
        //     Nota: oSelectedItem.Nota,
        //     CantidadSug: oSelectedItem.CantidadSug, //+@
        //   });

        //   this.displayPopup("EditMaterial");
        // },

        onScreenEditarMaterial: function (oEvent) {
          const oSelectedItem = oEvent
            .getSource()
            .getParent()
            .getBindingContext("local")
            .getObject();

          const materialInfo = `${oSelectedItem.MaterialTxt} (${oSelectedItem.Material})`; //+@
          oLocal.setProperty("/Material", {
            MaterialInfo: materialInfo, //+@
            Material: oSelectedItem.Material,
            MaterialTxt: oSelectedItem.MaterialTxt,
            PrecioAct: oSelectedItem.PrecioAct,
            PrecioSug: oSelectedItem.PrecioSug,
            Moneda: oSelectedItem.Moneda,
            LimiteInf: oSelectedItem.LimiteInf,
            FechaIni: oSelectedItem.FechaIni,
            FechaFin: oSelectedItem.FechaFin,
            Nota: oSelectedItem.Nota,
            CantidadSug: oSelectedItem.CantidadSug,
            Centro: oSelectedItem.Centro, //+@
            OrgVentas: oSelectedItem.OrgVentas, //+@
            Sector: oSelectedItem.Sector, //+@
          });

          this.displayPopup("EditMaterial");
        },

        //#endregion OPEN FRAGMENT

        onValidarAddMaterial: function () {
          const sOrgVentas = oLocal.getProperty("/OrgVentas");
          const sCliente = oLocal.getProperty("/Cliente");
          const sMateriales = oLocal.getProperty("/Materiales/items");

          if (sMateriales.length == 1 && sMateriales[0].Material !== "") {
            MessageToast.show(i18n.getText("MsgGSValidaAddMat1"));
          } else if (!sOrgVentas && !sCliente) {
            MessageToast.show(i18n.getText("MsgGSValidaAddMat2"));
          } else if (!sOrgVentas) {
            MessageToast.show(i18n.getText("MsgGSValidaAddMat3"));
          } else if (!sCliente) {
            MessageToast.show(i18n.getText("MsgGSValidaAddMat4"));
          } else {
            // LIMPIANDO MODELO DE MATERIAL
            oLocal.setProperty("/Material", {
              MaterialInfo: "",
              Material: "",
              MaterialTxt: "",
              PrecioAct: "",
              PrecioSug: "",
              Moneda: "",
              LimiteInf: "",
              FechaIni: null,
              FechaFin: null,
              Nota: "",
              CantidadSug: "",
            });
            this.displayPopup("AddMaterial");
          }
        },

        onLimpiarCampos: function () {
          this.initialLocal();
          this.initialMaterial();
          this.initialMCCliente(); //+@JR
          this.initialMCMaterial(); //+@JR
        },

        eliminarMaterial: function (material) {
          const tabla = oLocal.getProperty("/Materiales/items");
          const index = tabla.findIndex((item) => item.Material === material);

          if (index > -1) {
            tabla.splice(index, 1);
          }

          oLocal.setProperty("/Materiales/items", tabla);
        },

        onEliminarMaterial: function (oEvent) {
          const oSelectedItem = oEvent
            .getSource()
            .getParent()
            .getBindingContext("local")
            .getObject();
          const material = oSelectedItem.Material;

          MessageBox.warning(i18n.getText("MsgGSConfEliminarItem"), {
            title: i18n.getText("EliminarItem"),
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: function (sAction) {
              if (sAction === MessageBox.Action.OK) {
                this.eliminarMaterial(material);
              }
            }.bind(this),
            dependentOn: this.getView(),
          });
          // LIMPIANDO MODELO DE MATERIAL
          oLocal.setProperty("/Material", {
            MaterialInfo: "",
            Material: "",
            MaterialTxt: "",
            PrecioAct: "",
            PrecioSug: "",
            Moneda: "",
            LimiteInf: "",
            FechaIni: null,
            FechaFin: null,
            Nota: "",
            CantidadSug: "", //+@
          });
        },

        onConfirmPress: function (oEvent, oDialog) {
          let oSelected, oCells;
          switch (oDialog) {
            case "dialogOrgVentasGS":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/OrgVentas", oCells[0].getTitle());
              oLocal.setProperty("/OrgVentasInfo", oCells[1].getText());
              oLocal.setProperty("/Sector", oCells[2].getText());
              oLocal.setProperty("/SectorInfo", oCells[3].getText());
              break;
            case "dialogClienteGS":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/Cliente", oCells[0].getTitle());
              oLocal.setProperty("/ClienteInfo", oCells[1].getText());
              oLocal.setProperty("/Canalventas", oCells[4].getText());
              oLocal.setProperty("/Ofiventas", oCells[5].getText());

              this.onCancelPress(null, oDialog);
              break;
            case "dialogMaterialGS":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              let material = oCells[0].getTitle();
              const materialInfo = `${oCells[1].getText()} (${material})`;
              oLocal.setProperty("/Material/MaterialInfo", materialInfo);
              oLocal.setProperty("/Material/Material", material);
              oLocal.setProperty("/Material/Centro", oCells[2].getText());
              oLocal.setProperty("/Material/OrgVentas", oCells[3].getText()); //+@
              oLocal.setProperty("/Material/Sector", oCells[4].getText()); //+@

              this.onValidarCampo("txtMaterial");
              this.callDetalleMateriales(material);
              this.onCancelPress(null, oDialog);

              //   oInput.setValue(sCodigo);
              // this.onChangeInput({ getSource: () => oInput });
              // this.getView().setModel(oModel, `oDataDetalleMateriales1`);
              // this.functionMinDate();
              break;
            default:
              break;
          }
        },

        callDetalleMateriales: function (material) {
          const data = this.getDataDetalleMaterial(material);

          const oService = this.manager.getService("CAMBIOP");
          const uri =
            "/CambioPrecioSet?/$expand=cp_matnr_nav,cp_materiales_nav";

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              const results = oData.cp_materiales_nav.results;
              if (results.length > 0) {
                this.setAddData(results[0]);
              }
            }.bind(this),
            error: function (oError) {
              console.error("Data DetalleMateriales (error)", oError);
            }.bind(this),
          });
        },

        matchcodeSearch: function (oEvent, oDialog) {
          const sValue = oEvent.getParameter("value");

          let aFilters;
          switch (oDialog) {
            case "dialogOrgVentasGS":
              aFilters = [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogClienteGS":
              aFilters = [
                new Filter("Kunnr", FilterOperator.Contains, sValue),
                new Filter("Name1", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogMaterialGS":
              aFilters = [
                new Filter("Matnr", FilterOperator.Contains, sValue),
                new Filter("Maktx", FilterOperator.Contains, sValue),
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

        onCloseDialog: function (oEvent, sId) {
          let oDialog = this.byId(sId);
          if (oDialog) {
            oDialog.close();
            oDialog.destroy();
          }
          this.initialMaterial();
          this.initialMCMaterial();
        },

        prepareValidarPos: function (dialog) {
          const data = {
            Accion: "VALIDA_POS",
            cp_aprobmargen_nav: [],
            cp_solicitudesdet_nav: [],
            cp_mensajes_nav: [],
          };

          const precioSuge = oLocal.getProperty("/Material/PrecioSug");
          const precioActual = oLocal.getProperty("/Material/PrecioAct");
          const limiteInf = oLocal.getProperty("/Material/LimiteInf");

          data.cp_aprobmargen_nav.push({
            Matnr: oLocal.getProperty("/Material/Material"),
            Werks: oLocal.getProperty("/Material/Centro"),
            PreSuge: `${precioSuge}`,
            Margen: "0",
          });

          data.cp_solicitudesdet_nav.push({
            Idsolicitud: 0,
            Material: oLocal.getProperty("/Material/Material"),
            Materialtxt: "",
            Moneda: oLocal.getProperty("/Material/Moneda"),
            Precioactual: `${precioActual}`,
            Preciosugerido: `${precioSuge}`,
            Fechaini: oLocal.getProperty("/Material/FechaIni"),
            Fechafin: oLocal.getProperty("/Material/FechaFin"),
            Limiteinf: `${limiteInf}`,
            Limitesup: "0",
            Margen: "0", //  "1",
            Centro: oLocal.getProperty("/Material/Centro"),
            Orgventas: oLocal.getProperty("/Material/OrgVentas"), // "",
            Sector: oLocal.getProperty("/Material/Sector"), // "",
            Unidadmedida: "",
            Importebase: "0.0",
            Nota: oLocal.getProperty("/Material/Nota"),
            Cantidadsug: oLocal.getProperty("/Material/CantidadSug"),
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
            }.bind(this),
          });
        },

        onOkPress: function (oEvent, sDialog) {
          const sociedad = this.manager.getBukrs();
          switch (sDialog) {
            case "dialogAddMaterialGS": 
              if (!this.onValidarCampo("txtMaterial")) return;
              // if (!this.onValidarCampo("txtPrecioSug")) return;
              if (sociedad === '1000') {
                if (!this.onValidarPrecio("txtPrecioSug1000")) return;
              } else if (sociedad === '1200') {
                if (!this.onValidarPrecio("txtPrecioSug1200")) return;
              }
              if (!this.onValidarCampo("txtCantidadSug")) return; //+@

              this.prepareValidarPos(sDialog);
              break;
            case "dialogEditMaterialGS":
              // if (!this.onValidarCampo("txtPrecioSugEdit")) return;
              if (sociedad === '1000') {
                if (!this.onValidarPrecio("txtPrecioSugEdit1000")) return;
              } else if (sociedad === '1200') {
                if (!this.onValidarPrecio("txtPrecioSugEdit1200")) return;
              }
              if (!this.onValidarCampo("txtCantidadSugEdit")) return; //+@

              this.prepareValidarPos(sDialog);
              break;
            default:
              break;
          }
        },

        setPosicionMat: function (dataDetalle, sDialog) {
          const tabla = [];
          let data = {};

          data = {
            Material: dataDetalle.Material,
            MaterialTxt: dataDetalle.Materialtxt,
            PrecioAct: dataDetalle.Precioactual,
            PrecioSug: dataDetalle.Preciosugerido,
            LimiteInf: dataDetalle.Limiteinf,
            Moneda: dataDetalle.Moneda,
            FechaIni: this.formatter.fechaEstandardRet(dataDetalle.Fechaini), //+@
            FechaFin: this.formatter.fechaEstandardRet(dataDetalle.Fechafin), //+@
            // FechaIni: dataDetalle.Fechaini,
            // FechaFin: dataDetalle.Fechafin,
            Nota: dataDetalle.Nota,
            Margen: dataDetalle.Margen,
            Centro: dataDetalle.Centro,
            OrgVentas: dataDetalle.Orgventas, //+@
            Sector: dataDetalle.Sector, //+@
            CantidadSug: dataDetalle.Cantidadsug,
          };

          switch (sDialog) {
            case "dialogAddMaterialGS":
              tabla.push(data);
              oLocal.setProperty("/Materiales/items", [...tabla]);

              this.initialMaterial();
              this.initialMCMaterial();
              this.onCancelPress(null, "dialogAddMaterialGS");

              break;

            case "dialogEditMaterialGS":
              tabla.push(data);
              oLocal.setProperty("/Materiales/items", [...tabla]);

              this.initialMaterial();
              this.onCloseDialog(null, "dialogEditMaterialGS");

              break;
            default:
              break;
          }
        },

        callEnviarSolicitud: function (data) {
          const oService = this.manager.getService("CAMBIOP");
          const uri = "/CambioPrecioSet?/$expand=cp_solicitudesdet_nav";

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
              // // console.log("Data matchcodeOrgVentas (success)", oData);
              //   oModel.setData(oData.consulta_orgventas_nav.results);
              if (this.manager.msgResult2(oResponse)) {
                this.onLimpiarCampos();
              }
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data CREARSOL (error)", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });
        },

        onEnviarSolicitud: function () {
          let ok = true;
          let id = this.manager.getIdUser();

          const data = {
            Accion: "CREARSOL",
            IsIdusuario: id,
            IsSolicitudCab: {
              Id: 0,
              Orgventas: oLocal.getProperty("/OrgVentas"),
              Sector: oLocal.getProperty("/Sector"), //+@
              Cliente: oLocal.getProperty("/Cliente"),
              Clientetxt: oLocal.getProperty("/ClienteInfo"),
              Iduser: id,
              Estado: "",
              Fechacrea: null,
              Ofiventas: oLocal.getProperty("/Ofiventas"),
              Ofiventastxt: "",
              Idmanager: 0,
              Fechaaprob: null,
              Canalventas: oLocal.getProperty("/Canalventas"),
              Canalventastxt: "",
            },
            cp_solicitudesdet_nav: [],
          };

          for (const item of oLocal.getProperty("/Materiales/items")) {
            let precioSuge = parseFloat(item.PrecioSug);
            precioSuge = `${parseFloat(precioSuge).toFixed(2)}`;

            data.cp_solicitudesdet_nav.push({
              Idsolicitud: 0,
              Material: item.Material,
              Materialtxt: item.MaterialTxt,
              Moneda: item.Moneda,
              Precioactual: `${item.PrecioAct}`,
              // Preciosugerido: `${item.PrecioSug}`,
              Preciosugerido: precioSuge,
              Fechaini: item.FechaIni,
              Fechafin: item.FechaFin,
              Limiteinf: `${item.LimiteInf}`,
              Limitesup: "0",
              Margen: item.Margen, //  "1",
              Centro: item.Centro,
              Orgventas: item.OrgVentas, // "",
              Sector: item.Sector, // "",
              Unidadmedida: "",
              Importebase: "0.0",
              Nota: item.Nota,
              // Cantidadsug: item.CantidadSug, //+@
              Cantidadsug: `${item.CantidadSug}`, //+@
            });
          }

          if (data.cp_solicitudesdet_nav.length == 0) {
            MessageToast.show("Ingrese posiciones.");
            return;
          }

          if (ok) {
            MessageBox.confirm(i18n.getText("MsgGSConfEnvioSol"), {
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
                    // this.manager.auditoria(9); //-@20260820
                    this.callEnviarSolicitud(data);
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
          }
        },

        onCancelPress: function (oEvent, oDialog) {
          switch (oDialog) {
            case "dialogClienteGS":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              this.getView().setModel(new JSONModel(), `oDataMCCliente`); //+@JR
              break;
            case "dialogMaterialGS":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              this.getView().setModel(new JSONModel(), `oDataMCMaterial`); //+@JR
              break;
            case "dialogAddMaterialGS":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();

              this.initialMaterial();
              this.initialMCMaterial();
              break;
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

        onBuscarProducto: function () {
          const producto = oLocal.getProperty("/mcMaterial/CodProducto");
          const nombProducto = oLocal.getProperty("/mcMaterial/NombreProd");

          if (producto === "" && nombProducto === "") {
            MessageBox.warning("Ingrese filtro para buscar.");
          } else {
            this.matchcodeMaterial();
          }
        },

        onLimpiarProducto: function () {
          this.initialMCMaterial();
          this.getView().setModel(new JSONModel(), "oDataMCMaterial");
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
                this.initialLocal();

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
      }
    );
  }
);
