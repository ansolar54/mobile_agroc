sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/library",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/FormattedText",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/ui/model/type/String",
    "sap/ui/core/Fragment",
    "sap/m/BusyDialog",
    "sap/m/PDFViewer",
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
    mobileLibrary,
    Dialog,
    Button,
    Text,
    FormattedText,
    Filter,
    FilterOperator,
    Spreadsheet,
    exportLibrary,
    TypeString,
    Fragment,
    BusyDialog,
    PDFViewer,
    Formatter,
    Manager
  ) {
    "use strict";

    var path =
      "com.axelera.pe.gestioncomercial.view.m2-reportes.promociones";
    var oLocal = new JSONModel();
    var i18n = null;
    var ButtonType = mobileLibrary.ButtonType;
    var DialogType = mobileLibrary.DialogType;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m2-reportes.Promociones",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("R03", "Clear", this.onInitPromociones, this);
        },

        onInitPromociones: function (channel, event, oData) {
          this.initialization(oData.active);
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            this.showInfoText();
            this.matchcodeOrgVentas(false);
            this.matchcodeOfiVentas(false);
            this.manager.setBusy(false);
          }
        },

        showInfoText: function () {
          i18n = this.manager.getI18nModel(this);
          if (!this.confirmDialog) {
            let iCount = 5; // Tiempo de cuenta regresiva
            this.confirmDialog = new Dialog({
              type: DialogType.Message,
              title: "CONDICIONES",
              // title: new FormattedText({htmlText: `<p style="font-size: 2rem; margin: 0rem">CONDICIONES</p>`}),
              contentWidth: "60vw",
              contentHeight: "auto",
              content: new FormattedText({ 
                htmlText: `<p style="font-size: 1rem; margin: 0rem">
                ${i18n.getText("InfoCondicPR1")}
                ${i18n.getText("InfoCondicPR2")}
                ${i18n.getText("InfoCondicPR3")}
                ${i18n.getText("InfoCondicPR4")}
                ${i18n.getText("InfoCondicPR5")}
                ${i18n.getText("InfoCondicPR6")}
                ${i18n.getText("InfoCondicPR7")}
                ${i18n.getText("InfoCondicPR8")}
              </p>`}),
              // content: [
              //   new HorizontalLayout({
              //     content: [
              //       new VerticalLayout({
              //         content: [
              //           // new Text({ text: i18n.getText("InfoCondicPR1") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicPR1") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicPR2") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicPR3") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicPR4") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicPR5") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicPR6") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicPR7") }),
              //           new FormattedText({ htmlText: i18n.getText("InfoCondicPR8") }),
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
                // setTimeout(function () {
                //   var oScrollContainer = this.confirmDialog.getDomRef().querySelector(".sapMDialogScrollCont");
                //   if (oScrollContainer) {
                //     oScrollContainer.addEventListener("scroll", function () {
                //       if (oScrollContainer.scrollHeight - oScrollContainer.scrollTop === oScrollContainer.clientHeight) {
                //         this.confirmDialog.getBeginButton().setEnabled(true);
                //       }
                //     }.bind(this));
                //   }
                // }.bind(this), 100);

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

        sleep: function (ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            OrgVentas: "",
            OrgVentasInfo: "",
            Sector: "", //+@
            SectorInfo: "", //+@
            OfiVentas: "",
            OfiVentasInfo: "",
            CanalDist: "13", //"22",
            CanalDistInfo: "DISTRIBUIDOR", //+@
            ValidoEl: new Date(),
            Campo: "", //+@
            Orden: "", //+@
            Tabla: {
              items: [],
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
            IsFilter: false,
            filters: {
              Vkorg: "",
              Matnr: "",
              Maktx: "",
              Knumh: "",
              Knrmm: "",
              Knrmat: "",
              Knrnm: "",
              Knrme: "",
              Knrzm: "",
              Knrez: "",
              Nrmaktxt: "",
              Datab: "",
              Datbi: "",
            },
            loadingTbl: false, //+@
            IsMobile: this.manager.isMobile(), //+@dev-jrosales
            Descarga: true, //false, //+@ES20250310
          });

          // const puesto = sessionStorage.getItem("puesto");
          // if (puesto == 'GV' || puesto == 'GC' || puesto == 'SA') {
          //   oLocal.setProperty("/Descarga", true);
          // }
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
              // console.log("Data matchcodes org. ventas (success)", oData);
              this.manager.setBusy(false);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOrgVentas");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes org. ventas (error)");
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
              // console.log("Data matchcodes ofi. ventas (success)", oData);
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOfiVentas");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes ofi. ventas (error)");
            },
          });

          this.getView().setModel(oModel, "oDataMCOfiVentas");
        },

        matchcodeSearch: function (oEvent, oDialog) {
          const sValue = oEvent.getParameter("value");

          let aFilters;
          switch (oDialog) {
            case "dialogOrgVentasPR":
              aFilters = [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogOfiVentasPR":
              aFilters = [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
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

        onConfirmPress: function (oEvent, oDialog) {
          let oSelected, oCells;

          switch (oDialog) {
            case "dialogOrgVentasPR":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/OrgVentas", oCells[0].getTitle());
              oLocal.setProperty("/OrgVentasInfo", oCells[1].getText());
              oLocal.setProperty("/Sector", oCells[2].getText());
              oLocal.setProperty("/SectorInfo", oCells[3].getText());
              this.onCancelPress(null, oDialog);
              break;
            case "dialogOfiVentasPR":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/OfiVentas", oCells[0].getTitle());
              oLocal.setProperty("/OfiVentasInfo", oCells[1].getText());
              this.onCancelPress(null, oDialog);
              break;
            default:
              break;
          }
        },

        onCancelPress: function (oEvent, oDialog) {
          switch (oDialog) {
            case "dialogOrgVentasPR":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
            case "dialogOfiVentasPR":
              this.byId(oDialog).close();
              this.byId(oDialog).destroy();
              break;
          }
        },

        clearFilterSortTable: function () {
          const oTable = this.manager.isMobile() ? this.byId("tblPromocionesMob") : this.byId("tblPromociones");
          const aColumns = oTable.getColumns();
          aColumns.forEach(function (oColumn) {
            oColumn.setFiltered(false);
            oColumn.setSorted(false);
          });
        },

        onLimpiarCampos: function () {
          this.initialLocal();
          this.getView().setModel(new JSONModel(), "oDataPromociones");
          this.clearFilterSortTable();
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

        onBuscar: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = 1;
          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", 0);

          const searchData = this.prepareCallReport(page, cantFilas);
          // this.manager.auditoria(6); //-@20260820
          this.callReport(searchData, true);
        },

        callReport: function (data, busy) {
          const oService = this.manager.getService("REPORTES");
          // const tableP = this.byId("tblPromociones");
          const oModel = new JSONModel();
          const uri =
            "/ReporteSet?/$expand=reporte_promociones_nav," +
            "reporte_erdat_nav," +
            "reporte_vkbur_nav," +
            "reporte_pltyp_nav," +
            "reporte_vtweg_nav," +
            "reporte_vkorg_nav," +
            "reporte_filterpr_nav";

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
              console.log("Data promociones (success)", oData);
              this.removeSorters(oModel);
              this.removeFilters(oModel); //+@ES
              oModel.setData(oData);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.updatePagination(oData.EsRegtot);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data promociones (error)", oError);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.manager.isMobile() && SpinnerDialog.hide();
            },
          });

          this.getView().setModel(oModel, "oDataPromociones");
        },

        prepareCallReport: function (nPag, nRegxpag) {
          const data = {
            Accion: "PROMOCIONES",
            IsNpag: `${nPag}`,
            IsRegxpag: `${nRegxpag}`,
            IsCampo: oLocal.getProperty("/Campo"),
            IsOrden: oLocal.getProperty("/Orden"),
            IsSpart: oLocal.getProperty("/Sector"), //+@
            reporte_erdat_nav: [],
            reporte_vkbur_nav: [],
            reporte_pltyp_nav: [],
            reporte_vtweg_nav: [],
            reporte_vkorg_nav: [],
            reporte_promociones_nav: [],
            reporte_filterpr_nav: [],
          };

          const ofiVentas = oLocal.getProperty("/OfiVentas");
          if (ofiVentas.length == 0) {
            MessageToast.show(`Debe seleccionar una "Oficina de Ventas".`);
            return;
          }

          const isFilter = oLocal.getProperty("/IsFilter");

          // VALIDANDO SI FILTRO EXISTE
          if (isFilter) {
            data.Accion = "PROMOCIONES_FLTR";
            data.reporte_filterpr_nav.push(oLocal.getProperty("/filters"));
          }

          // ARMAR ESTRCUTURA RANGOS
          // let orgVentas, canalDist, validoEl, filaRango; // Se esta reutilizando la variable "ofiVentas" declarado al inicio de la funcion
          // orgVentas = oLocal.getProperty("/OrgVentas");
          // ofiVentas = oLocal.getProperty("/OfiVentas");
          // canalDist = oLocal.getProperty("/CanalDist");
          // validoEl = oLocal.getProperty("/ValidoEl");
          let filaRango = null;

          filaRango = this.setDataRango(oLocal.getProperty("/OrgVentas"), "");
          if (filaRango) {
            data.reporte_vkorg_nav.push(filaRango);
          }
          filaRango = this.setDataRango(oLocal.getProperty("/OfiVentas"), "");
          if (filaRango) {
            data.reporte_vkbur_nav.push(filaRango);
          }
          filaRango = this.setDataRango(oLocal.getProperty("/CanalDist"), "");
          if (filaRango) {
            data.reporte_vtweg_nav.push(filaRango);
          }
          filaRango = this.setDataRango(
            this.formatter.formateaFecha(oLocal.getProperty("/ValidoEl")),
            ""
          );
          if (filaRango) {
            data.reporte_erdat_nav.push(filaRango);
          }

          return data;
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

        onMatchcodeOrgVentas: function () {
          this.matchcodeOrgVentas(true);
        },

        onMatchcodeOfiVentas: function () {
          this.matchcodeOfiVentas(true);
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
            // case "CENTRO":
            //   oLocal.setProperty("/Centro", oSel.getKey());
            //   oLocal.setProperty("/CentroInfo", oSel.getAdditionalText());
            //   this.onPress(null, "Centro");
            //   break;
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

          // if (total > 0) {
          //   oLocal.setProperty("/Excel/BtnEnabled", true);
          // }
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
          }
        },

        validarFiltros: function () {
          const campos = [
            "Vkorg",
            "Matnr",
            "Maktx",
            "Knrmm",
            "Knrnm",
            "Knrme",
            "Knrzm",
            "Knrez",
            "Knrmat",
            "Nrmaktxt",
            "Datab",
            "Datbi",
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

        onDescargarPDF: function (oEvent) {

          const ofiVentas1 = oLocal.getProperty("/OfiVentas");
          if (ofiVentas1.length == 0) {
            MessageToast.show(`Debe seleccionar una "Oficina de Ventas".`);
            return;
          }

          const {  
            Sector:sector, 
            OrgVentas:orgVentas,
            OfiVentas:ofiVentas,
            CanalDist:canalDist
          } = oLocal.getProperty("/");

          //1000 corresponde a la sociedad de Farmex
          let filtros = `1000-${orgVentas}-${sector}-${canalDist}-${ofiVentas}`;

          const oService = this.manager.getService("REPORTES", false);
          const uri = `/FileReaderSet(Modulo='PROMOCIONES',Filtros='${filtros}')/$value`;

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
              
              this.manager.isMobile()
              ? cordova.InAppBrowser.open(oResponse.requestUri, "_system", "location=no")
              : oPdfViewer.open();

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
