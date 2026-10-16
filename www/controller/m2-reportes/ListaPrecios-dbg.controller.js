sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/type/String",
    "sap/ui/core/Fragment",
    "sap/m/SearchField",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/FormattedText",
    "sap/m/Label",
    "sap/m/BusyDialog",
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
    HorizontalLayout, 
    VerticalLayout,
    MessageToast,
    MessageBox,
    Dialog,
    Button,
    Filter,
    FilterOperator,
    TypeString,
    Fragment,
    SearchField,
    UIColumn,
    MColumn,
    Text,
    FormattedText,
    Label,
    BusyDialog,
    library,
    Formatter,
    Manager
  ) {
    "use strict";

    var path =
      "com.axelera.pe.gestioncomercial.view.m2-reportes.lista-precios";
    var oLocal = new JSONModel();
    var i18n = null;
    var ButtonType = library.ButtonType;
    var DialogType = library.DialogType;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m2-reportes.ListaPrecios",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("R07", "Clear", this.onInitListaPrecios, this);
        },

        onInitListaPrecios: function (channel, event, oData) {
          this.initialization(oData.active);
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            // this.showInfoText();
            this.matchcodeOrgVentas(false);
            this.matchcodeOfiVentas(false);
            this.matchcodeListaPrecio(false);
            this.manager.setBusy(false);
          }
        },

        showInfoText: function (sociedad) {
          let tipo = "";

          if ( sociedad == '1000') {
            tipo = "FMX";
          } else if (sociedad == '1200') {
            tipo = "AGX";
          } else {
            return;
          }

          i18n = this.manager.getI18nModel(this);
          // contentWidth: "50vw",
          // contentHeight: "26vh",
          if (!this.oConfirmDialog) {
            let iCount = 5; // Tiempo de cuenta regresiva
            this.confirmDialog = new Dialog({
              type: DialogType.Message,
              title: "CONDICIONES",
              contentWidth: "60vw",
              contentHeight: "auto",
              content: new FormattedText({ 
                htmlText: `<p style="font-size: 1rem; margin: 0rem">
                ${i18n.getText(`InfoCondicLP1_${ tipo }`)}
                ${i18n.getText(`InfoCondicLP2_${ tipo }`)}
                ${i18n.getText(`InfoCondicLP3_${ tipo }`)}
                ${i18n.getText(`InfoCondicLP4_${ tipo }`)}
                ${i18n.getText(`InfoCondicLP5_${ tipo }`)}
                ${i18n.getText(`InfoCondicLP6_${ tipo }`)}
                ${i18n.getText(`InfoCondicLP7_${ tipo }`)}
              </p>`}),
              // content: [
              //   new HorizontalLayout({
              //     content: [
              //       new VerticalLayout({
              //         // width: "100%",
              //         content: [
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicLP1") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicLP2") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicLP3") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicLP4") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicLP5") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicLP6") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicLP7") }),
              //         ]
              //       }),
                    
              //     ]
              //   }),
              // ],
              beginButton: new Button({
                type: ButtonType.Emphasized,
                text: "Aceptar",
                enabled: false, // Deshabilitado por defecto
                press: function () {
                  this.confirmDialog.close();
                }.bind(this)
              }),
              escapeHandler: function (oPromise) {
                oPromise.reject();
              },
              afterOpen: async function () {
                // const id = this.confirmDialog.getScrollDelegate().getContainerDomRef().id
                //   // $("#__dialog1-cont").scroll(function () {
                //   $(`#${id}`).scroll(function () {
                //     var ele = document.getElementById(`${id}`);
                //     if (ele.scrollHeight - ele.scrollTop === ele.clientHeight)
                //     {
                //       this.confirmDialog.getBeginButton().setEnabled(true);
                //     }
                // }.bind(this));
                let oCloseButton = this.confirmDialog.getBeginButton();

                let interval = setInterval(function () {
                  if (iCount === 0) {
                    clearInterval(interval);
                    oCloseButton.setText("Aceptar");
                    oCloseButton.setEnabled(true);
                    return;
                  }
                  // oCloseButton.setText("Aceptar (" + iCount + "s)");
                  iCount--;
                }, 1000);

              }.bind(this),
              afterClose: function () {
                  this.confirmDialog.destroy();
                  this.confirmDialog = null;
              }.bind(this)
            });
          }
          this.confirmDialog.open();
        },

        onValidarCampos: function () {
          const material1 = oLocal.getProperty("/Material1");
          // const material2 = oLocal.getProperty("/Material2");
          const txtMaterial2 = this.getView().byId("txtMaterialLP2");
          if (material1.length > 0) {
            txtMaterial2.setEnabled(true);
          } else {
            txtMaterial2.setEnabled(false);
            txtMaterial2.setValue("");
          }
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          const lv_sociedad = this.manager.getBukrs();

          oLocal.setData({
            OrgVentas: "",
            OrgVentasInfo: "",
            Sector: "",
            SectorInfo: "",
            OfiVentas: "",
            OfiVentasInfo: "",
            ListaPrecios: "",
            ListaPreciosInfo: "",
            Material1: "",
            Material2: "",
            MaterialInfo: "",
            Cliente: "",
            ClienteInfo: "",
            FechaConsulta: new Date(),
            Campo: "",
            Orden: "",
            Tabla: {
              items: [],
            },
            mcMaterial: {
              CodProducto: "",
              NombreProducto: "",
            },
            mcCliente: {
              CodCliente: "",
              NombreCliente: "",
              RUC: "",
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
            IsFilter: false,
            filters: {
              Vkorg: "",
              Matnr: "",
              Maktx: "",
              Kbetr: "0.0",
              Konwa: "",
              Mxwrt: "0.0",
              Konwa2: "",
              Datab: "",
              Datbi: "",
              Name1: "",
              Namepltyp: "",
            },
            loadingTbl: false, //+@
            Sociedad: lv_sociedad, //+@ES
            IsMobile: this.manager.isMobile(), //+@dev-asolar
            isCopy: false,
            Descarga: false, //+@ES20250310
          });

          this.showInfoText(lv_sociedad);

          const puesto = sessionStorage.getItem("puesto");
          if (puesto == 'GV' || puesto == 'GC' || puesto == 'SA') {
            oLocal.setProperty("/Descarga", true);
          }
        },

        initialMCMaterial: function () {
          oLocal.setProperty("/mcMaterial", {
            CodProducto: "",
            NombreProducto: "",
          });
          this.getView().setModel(new JSONModel(), `oDataMCMaterial`);
        },

        initialMCCliente: function () {
          oLocal.setProperty("/mcCliente", {
            CodCliente: "",
            NombreCliente: "",
            RUC: "",
          });
          this.getView().setModel(new JSONModel(), `oDataMCCliente`);
        },

        matchcodeOrgVentas: function (popup) {
          const oService = this.manager.getService("CAMBIOP");
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
              // console.log("Data matchcodeOrgVentas (success)", oData);
              this.manager.setBusy(false);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOrgVentas");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodeOrgVentas (error)", oError);
              this.manager.setBusy(false);
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataMCOrgVentas");
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
              // console.log("Data matchcodeOfiVentas (success)", oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOfiVentas");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodeOfiVentas (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataMCOfiVentas");
        },

        matchcodeListaPrecio: function (popup) {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri = "/EtLPreciosSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "accion": "LISTAPRECIOS",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          this.manager.isMobile() && SpinnerDialog.show();

          oService.read(uri, {
            method: "GET",
            success: function (oData, oResponse) {
              // console.log("Data matchcodeListaPrecios (success)", oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeListaPrecio");
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodeListaPrecios (error)", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });

          this.getView().setModel(oModel, "oDataMCListaPrecio");
        },

        matchcodeCliente: function () {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri =
            "/MatcodeSet?/$expand=matcode_clienteslp_nav,matcode_messages_nav";
          const data = {
            Accion: "CLIENTES_LP",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsKunnr: oLocal.getProperty("/mcCliente/CodCliente"), //+@
            IsName1: oLocal.getProperty("/mcCliente/NombreCliente"), //+@
            IsStcd1: oLocal.getProperty("/mcCliente/RUC"), //+@
            IsVkorg: oLocal.getProperty("/OrgVentas"),
            IsVkbur: oLocal.getProperty("/OfiVentas"),
            EsRegtot: "",
            matcode_messages_nav: [],
            matcode_clienteslp_nav: [],
          };

          this.manager.isMobile() && SpinnerDialog.hide();
          
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
            },
          });

          this.getView().setModel(oModel, "oDataMCCliente");
        },

        seleccionarCliente: function (codCliente, nomCliente) {
          const oService = this.manager.getService("REPORTES");
          const uri = "/MatcodeSet?/$expand=matcode_messages_nav";
          const data = {
            Accion: "CLIENTES_LP_SEL",
            IsVkorg: oLocal.getProperty("/OrgVentas"),
            IsVkbur: oLocal.getProperty("/OfiVentas"),
            IsPltyp: oLocal.getProperty("/ListaPrecios"),
            IsKunnr: codCliente,
            matcode_messages_nav: [],
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
              // console.log("Data matchcodeSelCliente (success)", oData);
              oLocal.setProperty("/Cliente", codCliente);
              oLocal.setProperty("/ClienteInfo", nomCliente);
              // if (oData.matcode_messages_nav.results.length > 0) {
              //   oLocal.setProperty("/Cliente", codCliente);
              //   oLocal.setProperty("/ClienteInfo", nomCliente);
              // } else {
              //   MessageBox.warning("Seleccione otro cliente");
              //   // this.onMatchcodeMultiMaterial();
              // }
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodeSelCliente (error)", oError);
            },
          });
        },

        matchcodeMaterial: function () {
          const oService = this.manager.getService("CAMBIOP");
          const oModel = new JSONModel();
          const uri = "/MatcodeSet?/$expand=matcode_materiales2_nav";
          const data = {
            Accion: "MATERIALES",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsMatnr: oLocal.getProperty("/mcMaterial/CodProducto"), //+@
            IsNameMatnr: oLocal.getProperty("/mcMaterial/NombreProducto"), //+@
            IsVkorg: oLocal.getProperty("/OrgVentas"),
            matcode_materiales2_nav: [],
          };

          data.IsVkorg = data.IsVkorg ? data.IsVkorg : "";

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
            },
          });
          this.getView().setModel(oModel, `oDataMCMaterial`);
        },
        //#endregion MATCHCODES

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

        onLimpiarMaterial: function () {
          this.initialMCMaterial();
          this.getView().setModel(new JSONModel(), "oDataMCMaterial");
        },

        onBuscarMaterial: function () {
          const producto = oLocal.getProperty("/mcMaterial/CodProducto");
          const nombProducto = oLocal.getProperty("/mcMaterial/NombreProducto");

          if (producto === "" && nombProducto === "") {
            MessageBox.warning("Ingrese filtro para buscar.");
          } else {
            this.matchcodeMaterial();
          }
        },

        onMatchcodeOrgVentas: function () {
          this.matchcodeOrgVentas(true);
        },

        onMatchcodeOfiVentas: function () {
          this.matchcodeOfiVentas(true);
        },

        onMatchcodeListaPrecio: function () {
          this.matchcodeListaPrecio(true);
        },

        onMatchcodeMaterial: function (nControl) {
          const orgVentas = oLocal.getProperty("/OrgVentas");
          if (orgVentas === "") {
            MessageBox.warning("Debe seleccionar una Org. Ventas.");
            return;
          }

          oLocal.setProperty("/nControl", nControl);
          this.displayPopup("MatchcodeMaterial");
        },

        validarCliente: function () {
          const orgVentas = oLocal.getProperty("/OrgVentas");
          const ofiVentas = oLocal.getProperty("/OfiVentas");
          const listaPrecios = oLocal.getProperty("/ListaPrecios");
          let result = true;

          if (orgVentas === "" && ofiVentas === "" && listaPrecios === "") {
            MessageBox.warning(
              "Debe seleccionar una Org. Ventas, Oficina de Ventas y Lista de Precios."
            );
            result = false;
          } else if (orgVentas === "" && ofiVentas === "") {
            MessageBox.warning(
              "Debe seleccionar una Org. Ventas y Oficina de Ventas."
            );
            result = false;
          } else if (orgVentas === "" && listaPrecios === "") {
            MessageBox.warning(
              "Debe seleccionar una Org. Ventas y Lista de Precios."
            );
            result = false;
          } else if (ofiVentas === "" && listaPrecios === "") {
            MessageBox.warning(
              "Debe seleccionar una Oficina de Ventas y Lista de Precios."
            );
            result = false;
          } else if (orgVentas === "") {
            MessageBox.warning("Debe seleccionar una Org. Ventas.");
            result = false;
          } else if (ofiVentas === "") {
            MessageBox.warning("Debe seleccionar una Oficina de Ventas.");
            result = false;
          } else if (listaPrecios === "") {
            MessageBox.warning("Debe seleccionar una Lista de Precios.");
            result = false;
          }

          return result;
        },

        onMatchcodeCliente: function () {
          if (!this.validarCliente()) {
            return;
          }

          // oLocal.setProperty("/nControl", nControl);
          this.displayPopup("MatchcodeCliente");
        },

        // #region MATERIALES
        onMatchcodeMultiMaterial: function () {
          const orgVentas = oLocal.getProperty("/OrgVentas");
          if (orgVentas === "") {
            MessageBox.warning("Debe seleccionar una Org. Ventas.");
            return;
          }

          const fragmentName = `${path}.MatchcodeMultiMaterial`;
          oLocal.setProperty("/nControl", "");

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

              const mtxtMaterial = this.byId("mtxtMaterial_LP");
              oDialog.setTokens(mtxtMaterial.getTokens());
              oDialog.open();
            }.bind(this)
          );
        },

        onOkPress: function (oEvent, oDialog) {
          const aTokens = oEvent.getParameter("tokens");
          const mtxtMaterial = this.byId("mtxtMaterial_LP");

          aTokens.forEach(
            function (oToken) {
              oToken.setText(this.whitespace2Char(oToken.getText()));
            }.bind(this)
          );

          switch (oDialog) {
            case "dialogMaterialMultiLP":
              mtxtMaterial.setTokens(aTokens);
              break;
            default:
              break;
          }

          if (oDialog.length > 0) {
            this.byId(oDialog).close();
          }
        },

        onAfterClose: function (oEvent, oDialog) {
          if (oDialog.length > 0) {
            this.byId(oDialog).destroy();
          }
        },

        whitespace2Char: function (sOriginalText) {
          var sWhitespace = " ",
            sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

          if (typeof sOriginalText !== "string") {
            return sOriginalText;
          }

          return sOriginalText.replaceAll(
            sWhitespace + sWhitespace,
            sWhitespace + sUnicodeWhitespaceCharacter
          ); // replace spaces
        },

        onCloseDialog: function (oEvent, dialog) {
          this.byId(dialog).close();
        },

        clearFilterSortTable: function () {
          const oTable = this.manager.isMobile() ? this.byId("tblListaPreciosMob") : this.byId("tblListaPrecios");
          
          const aColumns = oTable.getColumns();
          aColumns.forEach(function (oColumn) {
            oColumn.setFiltered(false);
            oColumn.setSorted(false);
          });
        },

        onLimpiarCampos: function () {
          const gIdMultiInputs = [{ id: "mtxtMaterial_LP" }];

          this.initialLocal();

          // LIMPIAR MULTI-INPUTS
          for (const item of gIdMultiInputs) {
            const mtxt = this.byId(item.id);
            mtxt.removeAllTokens();
            mtxt.setValue("");
          }

          this.initialLocal();
          this.onValidarCampos();

          this.getView().setModel(new JSONModel(), "oDataListaPrecios"); // LIMPIANDO TABLA
          this.clearFilterSortTable();
        },

        matchcodeSearch: function (oEvent, oDialog) {
          const sValue = oEvent.getParameter("value");
          let aFilters;

          switch (oDialog) {
            case "dialogOrgVentasLP":
              aFilters = [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogOfiVentasLP":
              aFilters = [
                new Filter("Vkbur", FilterOperator.Contains, sValue),
                new Filter("Bezei", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogListaPrecioLP":
              aFilters = [
                new Filter("Pltyp", FilterOperator.Contains, sValue),
                new Filter("Ptext", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogMaterialLP":
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

        onConfirmPress: function (oEvent, oDialog) {
          const nControl = oLocal.getProperty("/nControl");
          let oSelected, oCells;
          switch (oDialog) {
            case "dialogOrgVentasLP":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/OrgVentas", oCells[0].getTitle());
              oLocal.setProperty("/OrgVentasInfo", oCells[1].getText());
              oLocal.setProperty("/Sector", oCells[2].getText());
              oLocal.setProperty("/SectorInfo", oCells[3].getText());
              // this.matchcodeMaterial();
              this.onCancelPress(null, oDialog);
              break;
            case "dialogMaterialLP":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              oLocal.setProperty(`/Material${nControl}`, oCells[0].getTitle());
              this.onValidarCampos();
              this.onCancelPress(null, oDialog);
              break;
            case "dialogOfiVentasLP":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/OfiVentas", oCells[0].getTitle());
              oLocal.setProperty("/OfiVentasInfo", oCells[1].getText());
              this.onCancelPress(null, oDialog);
              break;
            case "dialogListaPrecioLP":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/ListaPrecios", oCells[0].getTitle());
              oLocal.setProperty("/ListaPreciosInfo", oCells[1].getText());
              this.onCancelPress(null, oDialog);
              break;
            case "dialogClienteLP":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              this.seleccionarCliente(
                oCells[0].getTitle(),
                oCells[1].getText()
              );

              this.onCancelPress(null, oDialog);
              break;
            default:
              break;
          }
        },

        onCancelPress: function (oEvent, oDialog) {
          switch (oDialog) {
            case "dialogClienteLP":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              this.initialMCCliente();
              break;
            case "dialogMaterialLP":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              this.initialMCMaterial();
              break;
            case "dialogMaterialMultiLP":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
          }
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

        getListaPreciosData: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas").toString();
          const data = {
            Accion: "LISTAPRECIOS",
            IsNpag: "1",
            IsRegxpag: cantFilas,
            IsVkorg: "",
            IsVkbur: "",
            IsPltyp: "",
            IsKunnr: "",
            IsFecha: null,
            IsCampo: oLocal.getProperty("/Campo"),
            IsOrden: oLocal.getProperty("/Orden"),
            reporte_matnr_nav: [],
            reporte_messages_nav: [],
            reporte_lpreciosdet_nav: [],
          };

          data.IsVkorg = oLocal.getProperty("/OrgVentas");
          data.IsVkbur = oLocal.getProperty("/OfiVentas");
          data.IsPltyp = oLocal.getProperty("/ListaPrecios");
          data.IsKunnr = oLocal.getProperty("/Cliente");
          data.IsFecha = oLocal.getProperty("/FechaConsulta");
          // console.log("DATA", data);
          this.callReport(data, true);
        },

        prepareCallReport: function (nPag, nRegxpag) {
          const data = {
            Accion: "LISTAPRECIOS",
            IsNpag: `${nPag}`,
            IsRegxpag: `${nRegxpag}`,
            IsVkorg: "",
            IsVkbur: "",
            IsPltyp: "",
            IsKunnr: "",
            IsFecha: "",
            IsSpart: oLocal.getProperty("/Sector"), //+@
            IsCampo: oLocal.getProperty("/Campo"),
            IsOrden: oLocal.getProperty("/Orden"),
            reporte_matnr_nav: [],
            reporte_messages_nav: [],
            reporte_lpreciosdet_nav: [],
            reporte_filterlp_nav: [],
          };

          const isFilter = oLocal.getProperty("/IsFilter");

          // VALIDANDO SI FILTRO EXISTE
          if (isFilter) {
            // data.Accion = "LISTAPRECIOS";
            data.reporte_filterlp_nav.push(oLocal.getProperty("/filters"));
          }

          data.IsVkorg = oLocal.getProperty("/OrgVentas");
          data.IsVkbur = oLocal.getProperty("/OfiVentas");
          data.IsPltyp = oLocal.getProperty("/ListaPrecios");
          data.IsKunnr = oLocal.getProperty("/Cliente");
          data.IsFecha = oLocal.getProperty("/FechaConsulta");

          // ARMAR ESTRCUTURA MATERIALES - RANGOS
          let material1, material2, filaRango;
          material1 = oLocal.getProperty("/Material1");
          material2 = oLocal.getProperty("/Material2");
          filaRango = this.setDataRango(material1, material2);
          if (filaRango) {
            data.reporte_matnr_nav.push(filaRango);
          }
          // MULTI-INPUTS
          const mtxtMaterial = this.byId("mtxtMaterial_LP");

          // Textos
          if (mtxtMaterial.getValue().length > 0) {
            data.reporte_matnr_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: mtxtMaterial.getValue(),
              High: "",
            });
          }

          // Tokens
          mtxtMaterial.getTokens().forEach(
            function (oToken) {
              data.reporte_matnr_nav.push(this.formatter.rangeSAP(oToken));
            }.bind(this)
          );
          return data;
        },

        onBuscar: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = 1;

          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", 0);

          this.validarCliente();

          const searchData = this.prepareCallReport(page, cantFilas);
          // console.log("DATA", searchData);
          // this.manager.auditoria(8); //-@20260820
          this.callReport(searchData, true);
        },

        callReport: function (data, busy) {
          const oService = this.manager.getService("REPORTES");
          // const tableLP = this.byId("tblListaPrecios");
          const oModel = new JSONModel();
          const uri =
            "/ReporteSet?/$expand=reporte_messages_nav,reporte_lpreciosdet_nav,reporte_filterlp_nav";

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
              // console.log("Data lista precios (success)", oData);
              this.removeSorters(oModel);
              this.removeFilters(oModel); //+@ES
              oModel.setData(oData);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.updatepag(oData.EsRegtot);
              this.manager.isMobile() && SpinnerDialog.hide();
              oLocal.setProperty("/isCopy", true);
            }.bind(this),
            error: function (oError) {
              console.error("Data lista precios (error)", oError);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });

          this.getView().setModel(oModel, "oDataListaPrecios");
        },

        // CANTIDAD FILAS
        onScreenCantidadFilas: function () {
          this.displayPopup("CantidadFilas");
        },

        onSelectedItemCantFilas: function (oEvent) {
          const cantFilas = oEvent.getParameter("selectedItem").getText();
          oLocal.setProperty("/page/CantFilas", Number(cantFilas));
        },

        onCloseDialog: function (oEvent, sId) {
          let oDialog = this.byId(sId);
          if (oDialog) {
            oDialog.close();
            oDialog.destroy();
          }
        },

        onSearchListaPrecioCantFilas: function () {
          // this.getListaPreciosData();
          this.onBuscar();
          this.onCloseDialog(null, "dialogCantFilasLP");
        },

        removeSorters: function (oModel) {
          const bindings = oModel.aBindings;
          // console.log(bindings);
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

        onPress: function (oEvent, oInput) {
          let data = [];
          let results = [];
          let result = null;

          switch (oInput) {
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

            case "OfiVentas":
              data = this.getView().getModel("oDataMCOfiVentas")?.getData();
              if (data) {
                let ofiVentas = oLocal.getProperty("/OfiVentas");
                results = data.results;

                if (ofiVentas.length > 0) {
                  result = results.find((item) => item.Vkbur == ofiVentas);
                }

                // let oInput = this.getView().byId("txtOrgVentasCP");

                if (result) {
                  oLocal.setProperty("/OfiVentas", result.Vkbur);
                  oLocal.setProperty("/OfiVentasInfo", result.Bezei);
                  // oInput.setValueState("None");
                } else {
                  oLocal.setProperty("/OfiVentas", ofiVentas);
                  oLocal.setProperty("/OfiVentasInfo", "");
                  // oInput.setValueState("Error");
                }
              }
              break;

            case "ListaPrecios":
              data = this.getView().getModel("oDataMCListaPrecio")?.getData();
              if (data) {
                let listaPrecios = oLocal.getProperty("/ListaPrecios");
                results = data.results;

                if (listaPrecios.length > 0) {
                  result = results.find((item) => item.Pltyp == listaPrecios);
                }

                // let oInput = this.getView().byId("txtOrgVentasCP");

                if (result) {
                  oLocal.setProperty("/ListaPrecios", result.Pltyp);
                  oLocal.setProperty("/ListaPreciosInfo", result.Ptext);
                  // oInput.setValueState("None");
                } else {
                  oLocal.setProperty("/ListaPrecios", listaPrecios);
                  oLocal.setProperty("/ListaPreciosInfo", "");
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
            case "LISTAPRECIOS":
              this.matchcodeListaPrecio(false);
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
            case "OFIVENTAS":
              oLocal.setProperty("/OfiVentas", oSel.getKey());
              oLocal.setProperty("/OfiVentasInfo", oSel.getAdditionalText());
              this.onPress(null, "OfiVentas");
              break;
            case "LISTAPRECIOS":
              oLocal.setProperty("/ListaPrecios", oSel.getKey());
              oLocal.setProperty("/ListaPreciosInfo", oSel.getAdditionalText());
              this.onPress(null, "ListaPrecios");
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

        //#region PAGINATION
        updatepag: function (total) {
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
        //#endregion PAGINATION

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
            case "OfiVentas":
              // const ofiVentas = oLocal.getProperty("/OfiVentas");
              const ofiVentas = oEvent.getParameter("value");
              if (ofiVentas.length == 0) {
                oLocal.setProperty("/OfiVentasInfo", "");
              }
              break;
            case "ListaPrecios":
              // const listaPrecios = oLocal.getProperty("/ListaPrecios");
              const listaPrecios = oEvent.getParameter("value");
              if (listaPrecios.length == 0) {
                oLocal.setProperty("/ListaPreciosInfo", "");
              }
              break;
            case "Cliente":
              // const cliente = oLocal.getProperty("/Cliente");
              const cliente = oEvent.getParameter("value");
              if (cliente.length == 0) {
                oLocal.setProperty("/ClienteInfo", "");
              }
              break;
          }
        },

        validarFiltros: function () {
          const campos = [
            "Vkorg",
            "Matnr",
            "Maktx",
            "Kbetr",
            "Konwa",
            "Mxwrt",
            "Konwa2",
            "Datab",
            "Datbi",
            "Namepltyp",
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

        getCopyItems: function () {
          let oTable = this.byId("tblListaPrecios");
          let aSelectedIndices = oTable.getSelectedIndices();
          let sText = "";
      
          if (aSelectedIndices.length > 0) {
              let new_data = [];
      
              aSelectedIndices.forEach(index => {
                  let oContext = oTable.getContextByIndex(index);
                  let row = oContext.getObject();
      
                  let obj = {
                      Vkorg: row.Vkorg,
                      Matnr: row.Matnr,
                      Maktx: row.Maktx,
                      Kbetr: this.formatter.formatNumber(row.Kbetr),
                      Konwa: row.Konwa,
                      Mxwrt: this.formatter.formatNumber(row.Mxwrt),
                      Konwa2: row.Konwa2,
                      Datab: this.formatter.fecha2(row.Datab),
                      Datbi: this.formatter.fecha2(row.Datbi),
                      Namepltyp: row.Namepltyp
                  };
                  new_data.push(obj);
              });
      
              new_data.forEach(row => {
                  sText += Object.values(row).join("\t") + "\n";
              });
      
              let tempTextArea = document.createElement("textarea");
              tempTextArea.value = sText;
              document.body.appendChild(tempTextArea);
              tempTextArea.select();
              document.execCommand("copy");
              document.body.removeChild(tempTextArea);
      
              MessageToast.show("Registros seleccionados copiados");
          } else {
              MessageToast.show("No hay registros seleccionados");
          }
      },    
      
      onDescargarExcel: function (oEvent) {

        const { 
          Sector:sector, 
          OrgVentas:orgVentas,
          OfiVentas:ofiVentas,
          ListaPrecios:listaPrecios
        } = oLocal.getProperty("/");

        if (orgVentas.length == 0 || sector.length == 0 || ofiVentas.length == 0 || listaPrecios.length == 0) {
          MessageToast.show(`Debe seleccionar los campos obligatorios.`);
          return;
        }

        //1000 corresponde a la sociedad de Farmex
        // let filtros = `1000-${orgVentas}-${sector}-${ofiVentas}-${listaPrecios}`; //-@20260320
        let sociedad = this.manager.getBukrs()
        let filtros = `${sociedad}-${orgVentas}-${sector}-${ofiVentas}-${listaPrecios}`; //+@20260320

        const oService = this.manager.getService("REPORTES", false);
        // const uri = `/PdfReaderSet('${nombGuia}')/$value`;
        const uri = `/FileReaderSet(Modulo='PRECIOS',Filtros='${filtros}')/$value`;

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

            this.manager.setBusy(false);   
            library.URLHelper.redirect(oResponse.requestUri, true);
            
          }.bind(this),
          error: function (oError) {
            console.error(oError);
            this.manager.setBusy(false);
          }.bind(this),
        });
      },

      }
    );
  }
);
