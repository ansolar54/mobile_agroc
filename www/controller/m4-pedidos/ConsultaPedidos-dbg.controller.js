sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/ui/model/type/String",
    "sap/m/BusyDialog",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/Label",
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
    Spreadsheet,
    exportLibrary,
    TypeString,
    BusyDialog,
    UIColumn,
    MColumn,
    Text,
    Label,
    Formatter,
    Manager
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var path =
      "com.axelera.pe.gestioncomercial.view.m4-pedidos.consulta-pedidos";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m4-pedidos.ConsultaPedidos",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("GP02", "Clear", this.onInitConsultaPed, this);
        },

        onInitConsultaPed: function (channel, event, oData) {
          this.initialization(oData.active);
          // if (this.manager.isMobile()) {
          //   this.byId("btnDescargarCO").setVisible(false);
          // }
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            this.matchcodeOrgVentas(false);
            this.matchcodeOfiVentas(false);
            this.manager.setBusy(false);
          }
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            CreadoEl1: new Date(), //null,
            CreadoEl2: new Date(),
            // CreadoEl1: new Date(2024, 8, 1), // 8 porque enero es 0
            // CreadoEl2: new Date(2024, 9, 31), // 9 porque enero es 0
            NPedido1: "",
            NPedido2: "",
            Material1: "",
            Material2: "",
            OrgVentas1: "",
            OrgVentas2: "",
            OfiVentas1: "",
            OfiVentas2: "",
            Comercial1: "",
            Comercial2: "",
            Cliente1: "",
            Cliente2: "",
            ClasePedido1: "",
            ClasePedido2: "",
            Campo: "",
            Orden: "",
            mcMaterial: {
              OrgVentasMat: "",
              OrgVentasMatInfo: "",
              CodProducto: "",
              NombreProducto: "",
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
            numControl: null,
            page: {
              CantFilas: 10,
              Indice: 0,
              TotalItems: 0,
              Page: 1,
              TotalPages: 0,
              PrevPageBtn: false,
              NextPageBtn: false,
            },
            IsFilter: false,
            filters: {
              Vbeln: "",
              Auart: "",
              Vkorg: "",
              Erdat: null,
              Kunnr: "",
              Name1: "",
              Netwr: "",
              Waerk: "",
              Bstdk: null,
              Zterm: "",
              Text1: "",
              Status: "",
              Motivo: "",
              Vkbur: "",
              Vkgrp: "",
              Comercial: "",
              Bstnk: "",
            },
            loadingTbl: false, //+@
            IsMobile: this.manager.isMobile(), //+@dev-jrosales
          });
          this.getView().setModel(new JSONModel(), "oDataListaPedidos");
        },

        initialMCMaterial: function () {
          oLocal.setProperty("/mcMaterial", {
            OrgVentasMat: "",
            OrgVentasMatInfo: "",
            CodProducto: "",
            NombreProducto: "",
          });
        },

        initialMCCliente: function () {
          oLocal.setProperty("/mcCliente", {
            CodCliente: "",
            NombreCliente: "",
            RUC: "",
          });
        },

        initialMCComercial: function () {
          oLocal.setProperty("/mcComercial", {
            CodComercial: "",
            NombreComercial: "",
          });
        },

        onMatchcodeOrgVentasMat: function () {
          this.displayPopup("MatchcodeOrgVentasMat");
          // this.matchcodeOrgVentasMat(true);
        },

        onMatchcodeOrgVentas: function (oEvent, iControl) {
          oLocal.setProperty("/numControl", iControl);
          this.displayPopup("MatchcodeOrgVentas");
          // this.matchcodeOrgVentas(true);
        },

        onMatchcodeOfiVentas: function (oEvent, iControl) {
          oLocal.setProperty("/numControl", iControl);
          this.displayPopup("MatchcodeOfiVentas");
          // this.matchcodeOfiVentas(true);
        },

        onMatchcodeClasePedido: function (oEvent, iControl) {
          oLocal.setProperty("/numControl", iControl);
          this.matchcodeClasesPedido(true);
        },

        onMatchcodeMaterial: function (oEvent, iControl) {
          oLocal.setProperty("/numControl", iControl);
          this.displayPopup("MatchcodeMaterial");
        },

        onMatchcodeCliente: function (oEvent, iControl) {
          const txtOrgVentas = this.getView().byId("txtOrgVentasCO1");
          if (txtOrgVentas.getValue() === "") {
            MessageBox.warning(i18n.getText("MsgCPValidaOrgVentas"));
            return;
          }
          oLocal.setProperty("/numControl", iControl);
          this.displayPopup("MatchcodeCliente");
        },

        onMatchcodeComercial: function (oEvent, iControl) {
          oLocal.setProperty("/numControl", iControl);
          this.displayPopup("MatchcodeComercial");
        },

        onMatchcodeMultiOrgVentas: function (oEvent) {
          const fragmentName = `${path}.MatchcodeMultiOrgVentas`;
          oLocal.setProperty("/numControl", "");

          this.loadFragment({
            name: fragmentName,
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

              const mtxtOrgVentas = this.byId("mtxtOrgVentas");
              oDialog.setTokens(mtxtOrgVentas.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiCreadoEl: function () {
          const fragmentName = `${path}.MatchcodeMultiCreadoEl`;
          oLocal.setProperty("/numControl", "");

          this.loadFragment({
            name: fragmentName,
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
              const mtxtCreadoEl = this.byId("mtxtCreadoEl");
              oDialog.setTokens(mtxtCreadoEl.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiNroPedido: function () {
          const fragmentName = `${path}.MatchcodeMultiNroPedido`;
          oLocal.setProperty("/numControl", "");

          this.loadFragment({
            name: fragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: i18n.getText("NumeroPed"),
                  key: "NPedido",
                  type: "string",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 10,
                    }
                  ),
                },
              ]);

              const mtxtNroPedidos = this.byId("mtxtNroPedidos");
              oDialog.setTokens(mtxtNroPedidos.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiOfiVentas: function () {
          const fragmentName = `${path}.MatchcodeMultiOfiVentas`;
          oLocal.setProperty("/numControl", "");

          this.loadFragment({
            name: fragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Vkbur",
                  key: "Vkbur",
                  type: "string",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 4,
                    }
                  ),
                },
              ]);
              const mtxtOfiVentas = this.byId("mtxtOfiVentas");
              oDialog.setTokens(mtxtOfiVentas.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiMaterial: function () {
          const fragmentName = `${path}.MatchcodeMultiMaterial`;
          oLocal.setProperty("/numControl", "");

          this.loadFragment({
            name: fragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Matnr",
                  key: "Matnr",
                  type: "string",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 10,
                    }
                  ),
                },
              ]);

              const mtxtMaterial = this.byId("mtxtMaterial");
              oDialog.setTokens(mtxtMaterial.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiCliente: function () {
          const fragmentName = `${path}.MatchcodeMultiCliente`;
          oLocal.setProperty("/numControl", "");

          this.loadFragment({
            name: fragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Kunnr",
                  key: "Kunnr",
                  type: "string",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 10,
                    }
                  ),
                },
              ]);

              const mtxtCliente = this.byId("mtxtCliente");
              oDialog.setTokens(mtxtCliente.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiComercial: function () {
          const fragmentName = `${path}.MatchcodeMultiComercial`;
          oLocal.setProperty("/numControl", "");

          this.loadFragment({
            name: fragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Clave",
                  key: "Clave",
                  type: "string",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 10,
                    }
                  ),
                },
              ]);

              const mtxtComercial = this.byId("mtxtComercial");
              oDialog.setTokens(mtxtComercial.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onMatchcodeMultiClasePedido: function () {
          const fragmentName = `${path}.MatchcodeMultiClasePedido`;
          oLocal.setProperty("/numControl", "");

          this.loadFragment({
            name: fragmentName,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.setRangeKeyFields([
                {
                  label: "Auart",
                  key: "Auart",
                  type: "string",
                  typeInstance: new TypeString(
                    {},
                    {
                      maxLength: 4,
                    }
                  ),
                },
              ]);

              const mtxtClasePedidos = this.byId("mtxtClasePedidos");
              oDialog.setTokens(mtxtClasePedidos.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        ajustarData: function (data) {
          for (const item of data) {
            if (
              item.Tiponota == "NC" ||
              item.Tiponota == "ND" ||
              item.Tiponota == "TG"
            ) {
              item.btnEliminar = false;
              item.btnEditar = false;
            } else if (
              item.Status == "FACTURADO" ||
              item.Status == "TERMINADO"
            ) {
              item.btnEliminar = false;
              item.btnEditar = false;
            } else {
              item.btnEliminar = true;
              item.btnEditar = true;
            }
          }

          // return data;
        },

        onSuggest: function (oEvent, sInput) {
          switch (sInput) {
            case "ORGVENTAS":
              this.matchcodeOrgVentas(false);
              break;
            case "OFIVENTAS":
              this.matchcodeOfiVentas(false);
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
              // oLocal.setProperty("/OrgVentas1", keys[0]); //-@ES20250319
              // oLocal.setProperty("/Sector", keys[1]);     //-@ES20250319
              oLocal.setProperty("/OrgVentas1", `${keys[0]}-${keys[1]}`); //+@ES20250319
              // this.onPress(null, "OrgVentas");
              this.onValidarCampos(); //+@
              break;
            case "OFIVENTAS":
              oLocal.setProperty("/OfiVentas1", oSel.getKey());
              // this.onPress(null, "OfiVentas");
              this.onValidarCampos(); //+@
              break;
            // case "PUESTOEXP":
            //   oLocal.setProperty("/PuestoExp1", oSel.getKey());
            //   // this.onPress(null, "PuestoExp");
            //   this.onValidarCampos(); //+@
            //   break;
          }
        },

        // ORG.VENTAS
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
              this.manager.setBusy(false);
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataMCOrgVentas");
        },

        // matchcodeOrgVentasMat: function (popup) {
        //   const data = {
        //     Accion: "ORGVENTAS",
        //     consulta_orgventas_nav: [],
        //   };
        //   this.callOrgVentasMat(data, popup);
        // },

        // OFI.VENTAS
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

        quitarSectorOrgVentas: function (valor) {
          if (valor !== "") {
            return valor.split("-")[0];
          }
        },

        // CLIENTES
        matchcodeCliente: function () {
          const data = {
            Accion: "CLIENTES",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsKunnr: oLocal.getProperty("/mcCliente/CodCliente"), //+@
            IsName1: oLocal.getProperty("/mcCliente/NombreCliente"), //+@
            IsStcd1: oLocal.getProperty("/mcCliente/RUC"), //+@
            consulta_vkorg_r_nav: [],
            consulta_clientes_nav: [],
          };

          const dataFiltros = oLocal.getData();
          let filaRango,
            valor1 = "",
            valor2 = "";
          let aItems1 = [], aItems2 = [];

          // Org. ventas
          // valor1 = this.quitarSectorOrgVentas(dataFiltros.OrgVentas1.trim()); // 1001-SE --- 1001
          // valor2 = this.quitarSectorOrgVentas(dataFiltros.OrgVentas2.trim());
          // filaRango = this.setDataRango(valor1, valor2);
          // if (filaRango) {
          //   data.consulta_vkorg_r_nav.push(filaRango);
          // }

          //{+@ES20250319
          // Org. ventas - Sector

          valor1 = dataFiltros.OrgVentas1.trim();
          if (valor1.length > 0) {
            aItems1 = valor1.split("-");
          }

          valor2 = dataFiltros.OrgVentas2.trim();
          if (valor2.length > 0) {
            aItems2 = valor2.split("-");
          }
          
          valor1 = (aItems1[0]) ? aItems1[0]: ""; // orgventas
          valor2 = (aItems2[0]) ? aItems2[0]: ""; // orgventas
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_vkorg_r_nav.push(filaRango);
          }

          valor1 = (aItems1[1]) ? aItems1[1]: ""; // sector
          valor2 = (aItems2[1]) ? aItems2[1]: ""; // sector
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            // data.consulta_spart_r_nav.push(filaRango);
          }
          //}+@ES20250319

          const oService = this.manager.getService("PEDIDOS");
          const oModel = new JSONModel();
          const uri =
            "/ConsultaSet?/$expand=consulta_vkorg_r_nav,consulta_clientes_nav";

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              // console.log("Data matchcodes Clientes (success)", oData);
              oModel.setData(oData);
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes Clientes (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataMCCliente");
        },

        // MATERIALES
        matchcodeMaterial: function () {
          const oService = this.manager.getService("REPORTES");
          const OrgVentasMat = oLocal.getProperty("/mcMaterial/OrgVentasMat");
          const CodProducto = oLocal.getProperty("/mcMaterial/CodProducto");
          const NombreProducto = oLocal.getProperty(
            "/mcMaterial/NombreProducto"
          );
          const uri = "/MatcodeSet?/$expand=matcode_materiales_nav";
          const oModel = new JSONModel();
          // const uri = "/ConsultaSet?/$expand=consulta_materiales2_nav,consulta_matnr_nav,consulta_maktx_nav";
          const data = {
            Accion: "MATERIALES",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsVkorg: OrgVentasMat,
            IsProduct: CodProducto,
            IsNameProduct: NombreProducto,
            matcode_materiales_nav: [],
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
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes Materiales (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataMCMaterial");
        },

        // COMERCIALES
        matchcodeComercial: function () {
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
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes Comerciales (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataMCComercial");
        },

        // CLASES DE PEDIDO
        matchcodeClasesPedido: function (popup) {
          const oService = this.manager.getService("PEDIDOS");
          const oModel = new JSONModel();
          const uri = "/ConsultaSet?/$expand=consulta_clasespedido_nav";
          const data = {
            Accion: "CLASESPEDIDO",
            consulta_clasespedido_nav: [],
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
              // console.log("Data matchcodes ClasesPedido (success)", oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeClasePedido");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes ClasesPedido (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataMCClasePedido");
        },

        onConfirmPress: function (oEvent, oDialog) {
          const n = oLocal.getProperty("/numControl");
          let oSelected;
          let oCells = [];

          switch (oDialog) {
            case "dialogOrgVentasCO":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              // oLocal.setProperty(`/OrgVentas${n}`, oCells[0].getTitle()); //-@ES20250319
              oLocal.setProperty(`/OrgVentas${n}`, `${oCells[0].getTitle()}-${oCells[2].getText()}`); //+@ES20250319
              break;
            case "dialogOrgVentasMatCO":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(
                "/mcMaterial/OrgVentasMat",
                oCells[0].getTitle()
              );
              oLocal.setProperty(
                "/mcMaterial/OrgVentasMatInfo",
                oCells[1].getText()
              );
              // this.matchcodeMaterial();
              break;

            case "dialogOfiVentasCO":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/OfiVentas${n}`, oCells[0].getTitle());
              break;

            case "dialogClasePedidoCO":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/ClasePedido${n}`, oCells[0].getTitle());
              break;

            case "dialogClienteCO":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();

              oLocal.setProperty(`/Cliente${n}`, oCells[0].getTitle());
              this.onValidarCampos();
              this.onCancelPress(null, oDialog);
              break;

            case "dialogComercialCO":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/Comercial${n}`, oCells[0].getTitle());
              this.onValidarCampos();
              this.onCancelPress(null, oDialog);
              break;

            case "dialogMaterialCO":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/Material${n}`, oCells[0].getTitle());
              this.onValidarCampos();
              this.onCancelPress(null, oDialog);
              break;

            default:
              break;
          }

          this.onValidarCampos();
        },

        onValidarCampos: function () {
          const oInputs = [
            { id1: "txtClasePedido1", id2: "txtClasePedido2" },
            { id1: "txtMaterial1", id2: "txtMaterial2" },
            { id1: "txtCliente1", id2: "txtCliente2" },
            { id1: "txtComercialCO1", id2: "txtComercialCO2" },
            { id1: "txtCreadoEl1", id2: "txtCreadoEl2" },
            { id1: "txtNPedido1", id2: "txtNPedido2" },
            { id1: "txtOfiVentasCO1", id2: "txtOfiVentasCO2" },
            { id1: "txtOrgVentasCO1", id2: "txtOrgVentasCO2" },
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

        onOkPress: function (oEvent, oDialog) {
          let aTokens = oEvent.getParameter("tokens");
          const mtxtCreadoEl = this.byId("mtxtCreadoEl");
          const mtxtNroPedidos = this.byId("mtxtNroPedidos");
          const mtxtOfiVentas = this.byId("mtxtOfiVentas");
          const mtxtMaterial = this.byId("mtxtMaterial");
          const mtxtOrgVentas = this.byId("mtxtOrgVentas");
          const mtxtCliente = this.byId("mtxtCliente");
          const mtxtComercial = this.byId("mtxtComercial");
          const mtxtClasePedidos = this.byId("mtxtClasePedidos");

          aTokens.forEach(
            function (oToken) {
              oToken.setText(this.whitespace2Char(oToken.getText()));
            }.bind(this)
          );

          switch (oDialog) {
            case "dialogMultiCreadoElCO":
              mtxtCreadoEl.setTokens(aTokens);
              break;
            case "dialogMultiNroPedidoCO":
              mtxtNroPedidos.setTokens(aTokens);
              break;
            case "dialogMultiOfiVentasCO":
              mtxtOfiVentas.setTokens(aTokens);
              break;
            case "dialogMultiMaterialCO":
              mtxtMaterial.setTokens(aTokens);
              break;
            case "dialogMultiOrgVentasCO":
              mtxtOrgVentas.setTokens(aTokens);
              break;
            case "dialogMultiClienteCO":
              mtxtCliente.setTokens(aTokens);
              break;
            case "dialogMultiComercialCO":
              mtxtComercial.setTokens(aTokens);
              break;
            case "dialogMultiClasePedidoCO":
              mtxtClasePedidos.setTokens(aTokens);
              break;
            default:
              break;
          }

          if (oDialog.length > 0) {
            this.byId(oDialog).close();
          }
        },

        onCancelPress: function (oEvent, oDialog) {
          switch (oDialog) {
            case "dialogClienteCO":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              this.initialMCCliente();
              this.getView().setModel(new JSONModel(), "oDataMCCliente");
              break;
            case "dialogComercialCO":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              this.initialMCComercial();
              this.getView().setModel(new JSONModel(), "oDataMCComercial");
              break;
            case "dialogMaterialCO":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              this.initialMCMaterial();
              this.getView().setModel(new JSONModel(), "oDataMCMaterial");
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

        onBuscarMaterial: function () {
          const producto = oLocal.getProperty("/mcMaterial/CodProducto");
          const nombProducto = oLocal.getProperty("/mcMaterial/NombreProducto");
          const orgVentasMat = oLocal.getProperty("/mcMaterial/OrgVentasMat");

          if (producto === "" && nombProducto === "" && orgVentasMat === "") {
            MessageBox.warning("Ingrese filtro para buscar.");
          } else {
            this.matchcodeMaterial();
          }
        },

        onLimpiarMaterial: function () {
          this.initialMCMaterial();
          this.getView().setModel(new JSONModel(), "oDataMCMaterial");
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

        whitespace2Char: function (sOriginalText) {
          let sWhitespace = " ",
            sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

          if (typeof sOriginalText !== "string") {
            return sOriginalText;
          }

          return sOriginalText.replaceAll(
            sWhitespace + sWhitespace,
            sWhitespace + sUnicodeWhitespaceCharacter
          ); // replace spaces
        },

        onCloseDialog: function (oEvent, sId) {
          let oDialog = this.byId(sId);
          if (oDialog) {
            oDialog.close();
            oDialog.destroy();
          }
        },

        callReport: function (data, busy) {
          const oService = this.manager.getService("PEDIDOS");
          // const tableCP = this.byId("tblConsultaPedido");
          const oModel = new JSONModel();
          const uri =
            "/ConsultaSet?/$expand=consulta_vbeln_r_nav," +
            "consulta_auart_r_nav," +
            "consulta_vkorg_r_nav," +
            "consulta_spart_r_nav," + //+@ES20250319
            "consulta_vkbur_r_nav," +
            "consulta_kunnr_r_nav," +
            "consulta_erdat_r_nav," +
            // "consulta_ernam_r_nav," +
            "consulta_kunnr2_r_nav," +
            "consulta_matnr_r_nav," +
            "consulta_consultapedidos_nav," +
            "consulta_filtercp_nav";

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
              // console.log("Listar Consulta Pedidos (success)", oData); //+@ES
              this.removeSorters(oModel);
              this.removeFilters(oModel);
              this.ajustarData(oData.consulta_consultapedidos_nav.results); //+@ES20241107
              oModel.setData(oData);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.updatePagination(oData.EsRegtot);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Listar Consulta Pedidos (error)", oError); //+@ES
              busy && oLocal.setProperty("/loadingTbl", false);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataListaPedidos");
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
          const isFilter = oLocal.getProperty("/IsFilter");
          const data = {
            Accion: "LISTAPEDIDOS",
            IsNpag: `${nPag}`,
            IsRegxpag: `${nRegxpag}`,
            IsCampo: oLocal.getProperty("/Campo"),
            IsOrden: oLocal.getProperty("/Orden"),
            consulta_vbeln_r_nav: [],
            consulta_auart_r_nav: [],
            consulta_vkbur_r_nav: [],
            consulta_kunnr_r_nav: [],
            consulta_erdat_r_nav: [],
            // consulta_ernam_r_nav: [],
            consulta_kunnr2_r_nav: [],
            consulta_matnr_r_nav: [],
            consulta_vkorg_r_nav: [],
            consulta_spart_r_nav: [], //+@ES20250319
            consulta_consultapedidos_nav: [],
            consulta_filtercp_nav: [],
          };

          // VALIDANDO SI FILTRO EXISTE
          if (isFilter) {
            data.Accion = "LISTAPEDIDOS_FLTR";
            data.consulta_filtercp_nav.push(oLocal.getProperty("/filters"));
          }

          const dataFiltros = oLocal.getData();
          let filaRango,
            valor1 = "",
            valor2 = "";
          let aItems1 = [], aItems2 = [];

          // Clase Pedido
          valor1 = dataFiltros.ClasePedido1.trim();
          valor2 = dataFiltros.ClasePedido2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_auart_r_nav.push(filaRango);
          }

          // Cliente
          valor1 = dataFiltros.Cliente1.trim();
          valor2 = dataFiltros.Cliente2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_kunnr_r_nav.push(filaRango);
          }

          // Comercial
          valor1 = dataFiltros.Comercial1.trim();
          valor2 = dataFiltros.Comercial2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_kunnr2_r_nav.push(filaRango);
            // data.consulta_ernam_r_nav.push(filaRango);
          }

          // CreadoEl
          valor1 = this.formatter.getDateWithFormat(dataFiltros.CreadoEl1);
          valor2 = this.formatter.getDateWithFormat(dataFiltros.CreadoEl2);
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_erdat_r_nav.push(filaRango);
          }

          // NPedido
          valor1 = dataFiltros.NPedido1.trim();
          valor2 = dataFiltros.NPedido2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_vbeln_r_nav.push(filaRango);
          }

          // OfiVentas
          valor1 = dataFiltros.OfiVentas1.trim();
          valor2 = dataFiltros.OfiVentas2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_vkbur_r_nav.push(filaRango);
          }

          // // OrgVentas
          // valor1 = dataFiltros.OrgVentas1.trim();
          // valor2 = dataFiltros.OrgVentas2.trim();
          // filaRango = this.setDataRango(valor1, valor2);
          // if (filaRango) {
          //   data.consulta_vkorg_r_nav.push(filaRango);
          // }

          //{+@ES20250319
          // Org. ventas - Sector

          valor1 = dataFiltros.OrgVentas1.trim();
          if (valor1.length > 0) {
            aItems1 = valor1.split("-");
          }

          valor2 = dataFiltros.OrgVentas2.trim();
          if (valor2.length > 0) {
            aItems2 = valor2.split("-");
          }
          
          valor1 = (aItems1[0]) ? aItems1[0]: ""; // orgventas
          valor2 = (aItems2[0]) ? aItems2[0]: ""; // orgventas
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_vkorg_r_nav.push(filaRango);
          }

          valor1 = (aItems1[1]) ? aItems1[1]: ""; // sector
          valor2 = (aItems2[1]) ? aItems2[1]: ""; // sector
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_spart_r_nav.push(filaRango);
          }
          //}+@ES20250319

          // Material
          valor1 = dataFiltros.Material1.trim();
          valor2 = dataFiltros.Material2.trim();
          filaRango = this.setDataRango(valor1, valor2);
          if (filaRango) {
            data.consulta_matnr_r_nav.push(filaRango);
          }

          // MULTI-INPUTS

          const mtxtCreadoEl = this.byId("mtxtCreadoEl");
          const mtxtNroPedidos = this.byId("mtxtNroPedidos");
          const mtxtOfiVentas = this.byId("mtxtOfiVentas");
          const mtxtMaterial = this.byId("mtxtMaterial");
          const mtxtOrgVentas = this.byId("mtxtOrgVentas");
          const mtxtCliente = this.byId("mtxtCliente");
          const mtxtComercial = this.byId("mtxtComercial");
          const mtxtClasePedidos = this.byId("mtxtClasePedidos");

          // Textos

          if (mtxtCreadoEl.getValue().length > 0) {
            data.consulta_erdat_r_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtCreadoEl.getValue(),
              High: "",
            });
          }

          if (mtxtNroPedidos.getValue().length > 0) {
            data.consulta_vbeln_r_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtNroPedidos.getValue(),
              High: "",
            });
          }

          if (mtxtOfiVentas.getValue().length > 0) {
            data.consulta_vkbur_r_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtOfiVentas.getValue(),
              High: "",
            });
          }

          if (mtxtMaterial.getValue().length > 0) {
            data.consulta_matnr_r_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtMaterial.getValue(),
              High: "",
            });
          }

          if (mtxtOrgVentas.getValue().length > 0) {
            data.consulta_vkorg_r_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtOrgVentas.getValue(),
              High: "",
            });
          }

          if (mtxtCliente.getValue().length > 0) {
            data.consulta_kunnr_r_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtCliente.getValue(),
              High: "",
            });
          }

          if (mtxtComercial.getValue().length > 0) {
            // data.consulta_ernam_r_nav.push({
            data.consulta_kunnr2_r_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtComercial.getValue(),
              High: "",
            });
          }

          if (mtxtClasePedidos.getValue().length > 0) {
            data.consulta_auart_r_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtClasePedidos.getValue(),
              High: "",
            });
          }

          // Tokens

          mtxtCreadoEl.getTokens().forEach(
            function (oToken) {
              data.consulta_erdat_r_nav.push(
                this.formatter.rangeSAPFecha(oToken)
              );
            }.bind(this)
          );

          mtxtNroPedidos.getTokens().forEach(
            function (oToken) {
              data.consulta_vbeln_r_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );

          mtxtOfiVentas.getTokens().forEach(
            function (oToken) {
              data.consulta_vkbur_r_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );

          mtxtMaterial.getTokens().forEach(
            function (oToken) {
              data.consulta_matnr_r_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );

          mtxtOrgVentas.getTokens().forEach(
            function (oToken) {
              data.consulta_vkorg_r_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );

          mtxtCliente.getTokens().forEach(
            function (oToken) {
              data.consulta_kunnr_r_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );

          mtxtComercial.getTokens().forEach(
            function (oToken) {
              // data.consulta_ernam_r_nav.push(this.formatter.rangeSAP(oToken));
              data.consulta_kunnr2_r_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );

          mtxtClasePedidos.getTokens().forEach(
            function (oToken) {
              data.consulta_auart_r_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );

          return data;
        },

        onBuscar: function (oEvent, sBusy) {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = 1;
          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", 0);

          const fecha1 = oLocal.getProperty("/CreadoEl1");
          if (!fecha1) {
            MessageBox.error(i18n.getText("MsgCPValidaCreadoEl"));
            return;
          }

          const searchData = this.prepareCallReport(page, cantFilas);
          // this.manager.auditoria(1); //-@20260820
          this.callReport(searchData, sBusy);
        },

        getDetallePedido: function (sNroPedido) {
          const data = {
            Accion: "VER_PEDIDO",
            IsVbeln: sNroPedido,
            IsCabPedidos: {},
            consulta_materiales_nav: [],
            consulta_deudacliente_nav: [],
            consulta_correos_nav: [],
          };

          const oService = this.manager.getService("PEDIDOS");
          const oModel = new JSONModel();
          const uri =
            "/ConsultaSet?/$expand=consulta_materiales_nav," +
            "consulta_deudacliente_nav," +
            "consulta_correos_nav";

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              // console.log("Data ver pedido (success)", oData);
              oModel.setData(oData);
            }.bind(this),
            error: function (oError) {
              console.error("Data ver pedido (error)");
            },
          });

          this.getView().setModel(oModel, "oDataDetallePedido");
        },
        // 38100103
        onScreenVerPedido: function (oEvent) {
          const oBindingContext = oEvent
            .getSource()
            .getBindingContext("oDataListaPedidos");
          const nroPedido = oBindingContext.getProperty("Vbeln");
          const tipoNota =
            oBindingContext.getProperty("Tiponota") === ""
              ? "EMPTY"
              : oBindingContext.getProperty("Tiponota").trim();
          const motivo =
            oBindingContext.getProperty("Motivo") === ""
              ? "EMPTY"
              : oBindingContext.getProperty("Motivo");
          const claseDoc = oBindingContext.getProperty("Auart").substring(0,4); //+@ES20250328
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo(
            "RouteVerPedido",
            { nroPedido, claseDoc, tipoNota, motivo },
            true
          );
        },

        onLimpiarCampos: function () {
          oLocal.setProperty("/page/Page", 1);
          oLocal.setProperty("/page/Indice", 0);

          const IdMultiInputs = [
            { id: "mtxtCreadoEl" },
            { id: "mtxtNroPedidos" },
            { id: "mtxtOfiVentas" },
            { id: "mtxtMaterial" },
            { id: "mtxtOrgVentas" },
            { id: "mtxtCliente" },
            { id: "mtxtComercial" },
            { id: "mtxtClasePedidos" },
          ];

          for (const item of IdMultiInputs) {
            const mtxt = this.byId(item.id);
            mtxt.removeAllTokens();
            mtxt.setValue("");
          }

          this.initialLocal();
          this.onValidarCampos();

          // this.getListaConsultaPedidos();

          this.getView().setModel(new JSONModel(), "oDataListaPedidos");
          this.clearFilterSortTable();
        },

        clearFilterSortTable: function () {
          const oTable = this.byId(
            this.manager.isMobile() ? "tblConsultaPedidoMob" : "tblConsultaPedido"
          );
          const aColumns = oTable.getColumns();
          aColumns.forEach(function (oColumn) {
            oColumn.setFiltered(false);
            oColumn.setSorted(false);
          });
        },

        openCustomDialog: function (sFragmentName, sModel, sPath) {
          const fragmentName = `${path}.${sFragmentName}`;
          const oView = this.getView();

          if (!this.byId(sFragmentName)) {
            // load asynchronous XML fragment
            Fragment.load({
              id: oView.getId(),
              name: `${fragmentName}`,
              controller: this,
            }).then(function (oDialog) {
              // connect dialog to the root view
              //of this component (models, lifecycle)
              oView.addDependent(oDialog);
              if (sFragmentName === "DescargaExcel")
                oView.byId("txtNombreArchivoCO").setValue("Reporte");
              if (sFragmentName === "CantidadFilas") {
                let oComboBox = oView.byId("comboBoxId");
                oComboBox.setSelectedKey("DefaultKey");
              }

              sPath &&
                oDialog.bindElement({
                  path: sPath,
                  model: sModel,
                });
              oDialog.open();
            });
          }
        },

        onScreenDownloadExcel: function () {
          this.openCustomDialog("DescargaExcel", null, null);
        },

        onDescargar: function () {
          const tableCP = this.byId("tblConsultaPedido");
          const oInputNombre = this.getView().byId("txtNombreArchivoCO");
          let sfileName = oInputNombre.getValue();

          if (!sfileName) {
            oInputNombre.setValueState("Error");
            return;
          } else {
            oInputNombre.setValueState("None");
          }

          oInputNombre.setValue("");

          const aCols = [
            {
              label: i18n.getText("NPedido"),
              property: "Vbeln",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Clase de Pedido",
              property: "Auart",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "OrgVt",
              property: "Vkorg",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Creado el",
              property: "Erdat",
              type: exportLibrary.EdmType.Date,
            },
            {
              label: "Cliente",
              property: "Kunnr",
              type: exportLibrary.EdmType.String,
            },
            {
              label: i18n.getText("Razon-Social"),
              property: "Name1",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Valor Neto",
              property: "Netwr",
              type: exportLibrary.EdmType.Number,
            },
            {
              label: "Moneda",
              property: "Waerk",
              type: exportLibrary.EdmType.String,
            },
            {
              label: i18n.getText("CondPago"),
              property: "Text1",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Est. Operac.",
              property: "Status",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Motivo",
              property: "Motivo",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Oficina de Ventas",
              property: "Vkbur",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Desc. Oficina de Ventas",
              property: "Txtvkbur",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Gpo. de Vendedores",
              property: "Vkgrp",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Desc. Gpo. de Vendedores",
              property: "Txtvkgrp",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Vendedor Comercial",
              property: "Comercial",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "Desc. Vendedor Comercial",
              property: "Txtcomercial",
              type: exportLibrary.EdmType.String,
            },
            // {
            //   label: "N° Ped. Cliente",
            //   property: "N° Ped. Cliente",
            //   type: exportLibrary.EdmType.String,
            // },
          ];

          const oRowBinding = tableCP.getBinding("rows");
          const aSelectedIndices = tableCP.getSelectedIndices();

          let aData = [];

          if (
            aSelectedIndices.length === oRowBinding.getLength() ||
            aSelectedIndices.length === 0
          ) {
            // Si el número de filas seleccionadas es igual al número total de filas, se han seleccionado "todos"
            const searchData = this.prepareCallReport(0, 0);
            this.ondataExcelAll(searchData, true).then((oData) => {
              const exportData = oData.consulta_consultapedidos_nav.results; // Obtener los datos específicos
              // console.log("Datos a exportar All:", exportData); // Mostrar datos a exportar
              this.exportToExcel(exportData, sfileName, aCols); // Exportar los datos
            });
          } else {
            aData = aSelectedIndices.map((index) =>
              oRowBinding.getContexts()[index].getObject()
            );
            // console.log("Datos a exportar Choose:", aData);
            this.exportToExcel(aData, sfileName, aCols);
          }
          this.onCloseDialog(null, "dialogExcelCO");
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

        ondataExcelAll: function (oPostData, busy) {
          // const tableCP = this.byId("tblConsultaPedido");
          const oService = this.manager.getService("PEDIDOS");
          const oModel = new JSONModel();
          const uri =
            "/ConsultaSet?/$expand=consulta_vbeln_r_nav," +
            "consulta_auart_r_nav," +
            "consulta_vkorg_r_nav," +
            "consulta_vkbur_r_nav," +
            "consulta_kunnr_r_nav," +
            "consulta_erdat_r_nav," +
            // "consulta_ernam_r_nav," +
            "consulta_kunnr2_r_nav," +
            "consulta_matnr_r_nav," +
            "consulta_consultapedidos_nav";

          busy && oLocal.setProperty("/loadingTbl", true);

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "descarga": "X",
            "mobile": this.manager.getIndMobile(),
          });
          
          return new Promise((resolve, reject) => {
            oService.create(uri, oPostData, {
              method: "POST",
              success: function (oData, oResponse) {
                // console.log("Listar Consulta Pedidos all (success)", oData);
                oModel.setData(oData);
                busy && oLocal.setProperty("/loadingTbl", false);
                resolve(oData); // Resuelve la promesa con los datos
              }.bind(this),
              error: function (oError) {
                console.error("Listar Consulta Pedidos (error)", oError);
                busy && oLocal.setProperty("/loadingTbl", false);
                reject(oError); // Rechaza la promesa con el error
              },
            });
          });
        },

        onScreenCantidadFilas: function () {
          this.openCustomDialog("CantidadFilas", null, null);
        },

        onSelectedItemCantFilas: function (oEvent) {
          const cantFilas = oEvent.getParameter("selectedItem").getText();
          oLocal.setProperty("/page/CantFilas", Number(cantFilas));
        },

        onSearchPedidosCantFilas: function () {
          // this.getListaConsultaPedidos();
          this.onBuscar(null, true);
          this.onCloseDialog(null, "dialogCantFilasCO");
        },

        onScreenEditPedido: async function (oEvent) {
          const oBindingContext = oEvent
            .getSource()
            .getBindingContext("oDataListaPedidos");
          const nroPedido = oBindingContext.getProperty("Vbeln");
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteModifPed", { detailPath: nroPedido }, true);
        },

        onScreenDeletePedido: function (oEvent) {
          const oBindingContext = oEvent
            .getSource()
            .getBindingContext("oDataListaPedidos");
          const nroPedido = oBindingContext.getProperty("Vbeln");
          const status = oBindingContext.getProperty("Status");

          const oPostData = {
            Accion: "ELIMPEDIDO",
            IsVbeln: nroPedido,
            IsStatus: `${status}`.substring(0, 20),
            creapedi_messages2_nav: [],
          };

          MessageBox.confirm(i18n.getText("MsgCPConfEliminarPed"), {
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
                  this.eliminarPedidoYes(oPostData);
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

        eliminarPedidoYes: function (oPostData) {
          const oService = this.manager.getService("PEDIDOS");
          const uri = "/CreapediSet?/$expand=creapedi_messages2_nav";

          this.manager.setBusy(true);

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, oPostData, {
            method: "POST",
            success: function (oData, oResponse) {
              // console.log("Eliminar Pedido (success)", oData);
              this.manager.setBusy(false);
              if (oData?.creapedi_messages2_nav.results[0]?.Success) {
                switch (oData?.creapedi_messages2_nav.results[0]?.Success) {
                  case "S":
                    MessageBox.success(
                      oData?.creapedi_messages2_nav.results[0]?.Message
                    );
                    this.onBuscar();
                    break;
                  case "E":
                    MessageBox.error(
                      oData?.creapedi_messages2_nav.results[0]?.Message
                    );
                    break;
                  default:
                    break;
                }
              }
            }.bind(this),
            error: function (oError) {
              console.error("Eliminar Pedido (error)", oError);
              this.manager.setBusy(false);
            }.bind(this),
          });
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

        //#region PAGINATION

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

        //#endregion PAGINATION

        validarFiltros: function () {
          const campos = [
            "Vbeln",
            "Auart",
            "Vkorg",
            "Erdat",
            "Kunnr",
            "Name1",
            "Netwr",
            "Waerk",
            "Text1",
            "Status",
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
          // const oTable = this.byId("tblConsultaPedido");
          const oTable = oEvent.getSource();
          const aRows = oTable.getRows();
          if (aRows.length > 0) {
            aRows.forEach((oRow) => {
              const texto = oRow.getAggregation("cells")[10].getText();
              if (texto.substring(0, 9) == "BLOQUEADO") {
                oRow.addStyleClass("rowCPBloquedado");
              } else {
                oRow.removeStyleClass("rowCPBloquedado");
              }
            });
          }
        },
      }
    );
  }
);
