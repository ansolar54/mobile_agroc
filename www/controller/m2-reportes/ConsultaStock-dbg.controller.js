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
    Formatter,
    Manager
  ) {
    "use strict";

    var path = "com.axelera.pe.gestioncomercial.view.m2-reportes.consulta-stock";
    var oLocal = new JSONModel();
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m2-reportes.ConsultaStock",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("R02", "Clear", this.onInitConsultaStock, this);
        },

        onInitConsultaStock: function (channel, event, oData) {
          this.initialization(oData.active);
          // if (this.manager.isMobile()) {
          //   this.byId("btnDescargarCSMob").setVisible(false);
          // }
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            this.getConstantes();
            this.matchcodeCentro(false);
            this.matchcodeOrgVentas(false);
            this.matchcodeAlmacen(false);
            this.manager.setBusy(false);
          }
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            Centro: "",
            CentroInfo: "",
            OrgVentas: "",
            OrgVentasInfo: "",
            Material: "",
            MaterialInfo: "",
            Lote: "",
            LoteInfo: "",
            Almacen: "",
            AlmacenInfo: "",
            Sector: "", //+@
            SectorInfo: "", //+@
            Campo: "",
            Orden: "",
            page: {
              CantFilas: 10,
              Indice: 0,
              TotalItems: 0,
              Page: 1,
              TotalPages: 0,
              PrevPageBtn: false,
              NextPageBtn: false,
            },
            mcMaterial: {
              OrgVentasMat: "",
              OrgVentasMatInfo: "",
              CodProducto: "",
              NombreProducto: "",
            },
            Excel: {
              FileText: "Reporte",
              BtnEnabled: false,
            },
            IsFilter: false,
            filters: {
              Werks: "",
              Matnr: "",
              Maktx: "",
              Empaque: "0.0", //+@
              Labst: "0.0",
              Meins: "",
              Charg: "",
              Clabs: "0.0",
              Fvenc: null,
              Mtart: "",
            },
            loadingTbl: false, //+@
            Sociedad: this.manager.getBukrs(), //+@ES
            IsMobile: this.manager.isMobile(), //+@dev-jrosales
          });

          this.getView().setModel(new JSONModel(), "oDataCStock");
        },

        initialMaterial: function () {
          oLocal.setProperty("/mcMaterial", {
            OrgVentasMat: "",
            OrgVentasMatInfo: "",
            CodProducto: "",
            NombreProducto: "",
          });
        },

        // CONSTANTES
        getConstantes: function () {
          const oModel = new JSONModel();
          const oService = this.manager.getService("PEDIDOS");
          const uri = "/ConstantesSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "accion": "CONSTANTES",
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
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes OrgVentas (error)", oError);
              this.manager.setBusy(false);
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataConstantes");
        },

        onCancelPress: function (oEvent, dialog) {
          switch (dialog) {
            case "dialogMaterialCS":
              this.byId(dialog).close();
              this.byId(dialog).destroy();
              this.initialMaterial();
              this.getView().setModel(new JSONModel(), "oDataMCMaterial");
              break;
            case "dialogExcelCS":
              this.byId(dialog).close();
              this.byId(dialog).destroy();
              oLocal.setProperty("/Excel/FileText", "Reporte CStock");
              break;
            default:
              break;
          }
        },

        onDescargar: function () {
          const oTable = this.manager.isMobile() ? this.byId("tblConsultaStockMob") : this.byId("tblConsultaStock"); //+@dev-jrosales
          const sfileName = oLocal.getProperty("/Excel/FileText");
          const oInputNombre = this.getView().byId("txtNombreArchivoCS");

          if (!sfileName) {
            oInputNombre.setValueState("Error");
            return;
          } else {
            oInputNombre.setValueState("None");
          }

          oLocal.setProperty("/Excel/FileText", "Reporte CStock");

          const aCols = [
            {
              label: "CENTRO",
              property: "Werks",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "MATERIAL",
              property: "Matnr",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "TEXTO BREVE MATERIAL",
              property: "Maktx",
              type: exportLibrary.EdmType.String,
            },
            //{+@ES
            {
              label: "EMPAQUE",
              property: "Empaque",
              type: exportLibrary.EdmType.Number,
            },
            //}+@ES
            {
              label: "LIBRE UTILIZ.",
              property: "Labst",
              type: exportLibrary.EdmType.Number,
            },
            {
              label: "UMB",
              property: "Meins",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "LOTE",
              property: "Charg",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "STOCK/LOTE",
              property: "Clabs",
              type: exportLibrary.EdmType.Number,
            },
            {
              label: "FECHA VENCIMIENTO",
              property: "Fvenc",
              type: exportLibrary.EdmType.Date,
            },
            {
              label: "TP MT.",
              property: "Mtart",
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
              const exportData = oData.reporte_consultastock_nav.results;
              // console.log("Datos a exportar All:", exportData);
              this.exportToExcel(exportData, sfileName, aCols);
            });
          } else {
            aData = aSelectedIndices.map((index) =>
              oRowBinding.getContexts()[index].getObject()
            );
            // console.log("Datos a exportar Choose:", aData);
            this.exportToExcel(aData, sfileName, aCols);
          }
          this.onCancelPress(null, "dialogExcelCS");
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
          // const oTable = this.byId("tblConsultaStock");
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri =
            "/ReporteSet?/$expand=reporte_messages_nav,reporte_consultastock_nav";

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
                // console.log("Lista Consulta Stock all (success)", oData);
                oModel.setData(oData);
                busy && oLocal.setProperty("/loadingTbl", false);
                resolve(oData);
              }.bind(this),
              error: function (oError) {
                console.error("Lista Consulta Stock (error)", oError);
                busy && oLocal.setProperty("/loadingTbl", false);
                reject(oError);
              }.bind(this),
            });
          });
        },
        //#endregion DESCARGA EXCEL

        //#region SERVICIOS MATCHCODES

        matchcodeCentro: function (popup) {
          const oModel = new JSONModel();
          const oService = this.manager.getService("REPORTES");
          const uri = "/EtCentrosSet";
          
          oService.setHeaders({
            "X-Requested-With": "X",
            "accion": "CENTROS",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.read(uri, {
            method: "GET",
            success: function (oData) {
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeCentro");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
            }.bind(this),
          });
          this.getView().setModel(oModel, "oDataMCCentro");
        },

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
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeOrgVentas");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
            }.bind(this),
          });
          this.getView().setModel(oModel, "oDataMCOrgVentas");
        },

        matchcodeMaterial: function (oEvent, ind) {
          const oService = this.manager.getService("REPORTES");
          const OrgVentasMat = oLocal.getProperty("/mcMaterial/OrgVentasMat");
          const CodProducto = oLocal.getProperty("/mcMaterial/CodProducto");
          const NombreProducto = oLocal.getProperty(
            "/mcMaterial/NombreProducto"
          );
          const oModel = new JSONModel();
          const uri = "/MatcodeSet?/$expand=matcode_materiales_nav";
          const data = {
            Accion: "MATERIALES",
            IsNpag: "1",
            IsRegxpag: "1000",
            IsVkorg: OrgVentasMat,
            IsProduct:
              ind === 1 ? CodProducto : oLocal.getProperty("/Material"),
            IsNameProduct: NombreProducto,

            matcode_materiales_nav: [],
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
              if (ind === 1) oModel.setData(oData);
              else
                oLocal.setProperty(
                  "/MaterialInfo",
                  oData.matcode_materiales_nav.results[0].Maktx
                );
                this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });
          this.getView().setModel(oModel, "oDataMCMaterial");
        },

        matchcodeLote: function (popup) {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri = "/MatcodeSet?/$expand=matcode_lotes_nav";
          const data = {
            Accion: "LOTES",
            IsNpag: "1",
            IsRegxpag: "1000",
            matcode_lotes_nav: [],
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
            success: function (oData) {
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeLote");
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });
          this.getView().setModel(oModel, "oDataMCLote");
        },

        matchcodeAlmacen: function (popup) {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri = "/EtAlmacenesSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "accion": "ALMACENES",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          this.manager.isMobile() && SpinnerDialog.show();

          oService.read(uri, {
            method: "GET",
            success: function (oData) {
              oModel.setData(oData);
              popup && this.displayPopup("MatchcodeAlmacen");
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataMCAlmacen");
        },

        //#endregion SERVICIOS MATCHCODES

        prepareCallReport: function (nPag, nRegxpag) {
          const sOrgVentas = oLocal.getProperty("/OrgVentas");
          const sSector = oLocal.getProperty("/Sector"); //+@
          const sMaterial = oLocal.getProperty("/Material");
          const sCentro = oLocal.getProperty("/Centro");
          const sAlmacen = oLocal.getProperty("/Almacen");
          const sLote = oLocal.getProperty("/Lote");
          const data = {
            Accion: "CONSULTASTOCK",
            IsNpag: `${nPag}`,
            IsRegxpag: `${nRegxpag}`,
            IsExport: "",
            IsCampo: oLocal.getProperty("/Campo"),
            IsOrden: oLocal.getProperty("/Orden"),
            EsRegtot: "",
            reporte_vkorg_nav: [],
            reporte_spart_nav: [], //+@
            reporte_matnr_nav: [],
            reporte_werks_nav: [],
            reporte_lgort_nav: [],
            reporte_charg_nav: [],
            reporte_consultastock_nav: [],
            reporte_filtercs_nav: [], //+@
          };

          const isFilter = oLocal.getProperty("/IsFilter");

          // VALIDANDO SI FILTRO EXISTE
          if (isFilter) {
            data.Accion = "CONSULTASTOCK_FLTR";
            data.reporte_filtercs_nav.push(oLocal.getProperty("/filters"));
          }

          if (sOrgVentas.length > 0) {
            data.reporte_vkorg_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: sOrgVentas,
              High: "",
            });
          }

          if (sSector.length > 0) {
            data.reporte_spart_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: sSector,
              High: "",
            });
          }

          if (sMaterial.length > 0) {
            data.reporte_matnr_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: sMaterial,
              High: "",
            });
          }

          if (sCentro.length > 0) {
            data.reporte_werks_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: sCentro,
              High: "",
            });
          }

          if (sAlmacen.length > 0) {
            data.reporte_lgort_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: sAlmacen,
              High: "",
            });
          }

          if (sLote.length > 0) {
            data.reporte_charg_nav.push({
              Sign: "I",
              Option: "EQ",
              Low: sLote,
              High: "",
            });
          }

          return data;
        },

        callReport: function (data, busy) {
          const oService = this.manager.getService("REPORTES");
          const oModel = new JSONModel();
          const uri =
            "/ReporteSet?/$expand=reporte_messages_nav,reporte_consultastock_nav,reporte_filtercs_nav";
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
            success: function (oData) {
              this.removeSorters(oModel);
              this.removeFilters(oModel); //+@ES
              oModel.setData(oData);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.updatePagination(oData.EsRegtot);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataCStock");
        },

        onMatchcodeCentro: function () {
          this.displayPopup("MatchcodeCentro");
          // this.matchcodeCentro(true);
        },

        onMatchcodeOrgVentas: function () {
          this.displayPopup("MatchcodeOrgVentas");
          // this.matchcodeOrgVentas(true);
        },

        onMatchcodeMaterial: function () {
          this.displayPopup("MatchcodeMaterial");
        },

        onMatchcodeLote: function () {
          this.matchcodeLote(true);
        },

        // onMatchcodeAlmacen: function () {
        //   this.matchcodeAlmacen(true);
        // },

        onMatchcodeOrgVentasMat: function () {
          this.displayPopup("MatchcodeOrgVentasMat");
          // this.matchcodeOrgVentasMat(true);
        },

        onMatchcodeDescargar: function () {
          this.displayPopup("DescargaExcel");
        },

        setAlmacen: function (centro) {
          const almacenes = this.getView().getModel("oDataMCAlmacen").getData().results;
          const constantes = this.getView().getModel("oDataConstantes").getData().results;
          const aCentAlm = constantes.filter( (item) => item.Campo == "WERKS_LGORT" );
          const result = aCentAlm.find((item) => item.Valinf == centro);
          if (result) {
            oLocal.setProperty(`/Almacen`, result.Valsup);
            const almacen = almacenes.find(
              (item) => item.Lgort == result.Valsup
            );
            if (almacen) {
              oLocal.setProperty(`/AlmacenInfo`, almacen.Lgobe);
            }
          } else {
            oLocal.setProperty(`/Almacen`, "");
            oLocal.setProperty(`/AlmacenInfo`, "");
          }
        },

        onConfirmPress: function (oEvent, oDialog) {
          let oSelected, oCells;

          switch (oDialog) {
            case "dialogCentroCS":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              const centro = oCells[0].getTitle();
              oLocal.setProperty("/Centro", centro);
              oLocal.setProperty("/CentroInfo", oCells[1].getText());

              this.setAlmacen(centro);
              break;
            case "dialogOrgVentasCS":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/OrgVentas", oCells[0].getTitle());
              oLocal.setProperty("/OrgVentasInfo", oCells[1].getText());
              oLocal.setProperty("/Sector", oCells[2].getText());
              oLocal.setProperty("/SectorInfo", oCells[3].getText());
              break;
            case "dialogOrgVentasMatCS":
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
            case "dialogMaterialCS":
              oSelected = oEvent.getParameter("listItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/Material", oCells[0].getTitle());
              oLocal.setProperty("/MaterialInfo", oCells[1].getText());

              this.onCancelPress(null, "dialogMaterialCS");
              break;
            case "dialogLoteCS":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/Lote", oCells[2].getTitle());
              oLocal.setProperty("/LoteInfo", oCells[1].getText());
              break;
            case "dialogAlmacenCS":
              oSelected = oEvent.getParameter("selectedItem");
              oCells = oSelected.getCells();
              oLocal.setProperty("/Almacen", oCells[0].getTitle());
              oLocal.setProperty("/AlmacenInfo", oCells[1].getText());
              break;
            default:
              break;
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

            case "Centro":
              data = this.getView().getModel("oDataMCCentro")?.getData();
              if (data) {
                let centro = oLocal.getProperty("/Centro");
                results = data.results;

                if (centro.length > 0) {
                  result = results.find((item) => item.Werks == centro);
                }

                // let oInput = this.getView().byId("txtOrgVentasCP");

                if (result) {
                  oLocal.setProperty("/Centro", result.Werks);
                  oLocal.setProperty("/CentroInfo", result.Name1);
                  this.setAlmacen(result.Werks);
                  // oInput.setValueState("None");
                } else {
                  oLocal.setProperty("/Centro", centro);
                  oLocal.setProperty("/CentroInfo", "");
                  oLocal.setProperty("/Almacen", "");
                  oLocal.setProperty("/AlmacenInfo", "");
                  // oInput.setValueState("Error");
                }
              }
              break;

            case "MATERIAL":
              this.matchcodeMaterial(null, 2);
              this.onBuscar();
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
            case "CENTRO":
              this.matchcodeCentro(false);
              break;
            // case "ALMACEN":
            //   this.matchcodeAlmacen(false);
            //   break;
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
            case "CENTRO":
              oLocal.setProperty("/Centro", oSel.getKey());
              oLocal.setProperty("/CentroInfo", oSel.getAdditionalText());
              this.onPress(null, "Centro");
              break;
          }
        },

        onBuscar: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = 1;
          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", 0);

          const searchData = this.prepareCallReport(page, cantFilas);
          this.callReport(searchData, true);
        },

        onMatchcodeSearch: function (oEvent, oDialog) {
          const sValue = oEvent.getParameter("value");

          let aFilters;
          switch (oDialog) {
            case "dialogCentroCS":
              aFilters = [
                new Filter("Werks", FilterOperator.Contains, sValue),
                new Filter("Name1", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogOrgVentasCS":
              aFilters = [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogMaterialCS":
              aFilters = [
                new Filter("Matnr", FilterOperator.Contains, sValue),
                new Filter("Maktx", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogOrgVentasMatCS":
              aFilters = [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogLoteCS":
              aFilters = [
                new Filter("Charg", FilterOperator.Contains, sValue),
                new Filter("Werks", FilterOperator.Contains, sValue),
                new Filter("Matnr", FilterOperator.Contains, sValue),
              ];
              break;
            case "dialogAlmacenCS":
              aFilters = [
                new Filter("Lgort", FilterOperator.Contains, sValue),
                new Filter("Lgobe", FilterOperator.Contains, sValue),
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

        clearFilterSortTable: function () {
          const oTable = this.manager.isMobile() ? this.byId("tblConsultaStockMob") : this.byId("tblConsultaStock"); //+@dev-jrosales
          const aColumns = oTable.getColumns();
          aColumns.forEach(function (oColumn) {
            oColumn.setFiltered(false);
            oColumn.setSorted(false);
          });
        },

        onLimpiarCampos: function () {
          this.initialLocal();
          this.getView().setModel(new JSONModel(), "oDataCStock");
          this.clearFilterSortTable();
        },

        onBuscarMaterial: function () {
          const producto = oLocal.getProperty("/mcMaterial/CodProducto");
          const nombProducto = oLocal.getProperty("/mcMaterial/NombreProducto");
          const orgVentasMat = oLocal.getProperty("/mcMaterial/OrgVentasMat");

          if (producto === "" && nombProducto === "" && orgVentasMat === "") {
            MessageBox.warning("Ingrese filtro para buscar.");
          } else {
            this.matchcodeMaterial(null, 1);
          }
        },

        onLimpiarOrgVentasMat: function () {
          this.initialMaterial();
          // this.matchcodeMaterial();
          this.getView().setModel(new JSONModel(), "oDataMCMaterial"); // LIMPIANDO TABLA
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
            case "Centro":
              // const centro = oLocal.getProperty("/Centro");
              const centro = oEvent.getParameter("value");
              if (centro.length == 0) {
                oLocal.setProperty("/CentroInfo", "");
                oLocal.setProperty("/Almacen", "");
                oLocal.setProperty("/AlmacenInfo", "");
              }
              break;
            case "Lote":
              // const lote = oLocal.getProperty("/Lote");
              const lote = oEvent.getParameter("value");
              if (lote.length == 0) {
                oLocal.setProperty("/LoteInfo", "");
              }
              break;
            default:
              break;
          }
        },

        validarFiltros: function () {
          const campos = [
            "Werks",
            "Matnr",
            "Maktx",
            "Empaque", //+@
            "Labst",
            "Clabs",
            "Meins",
            "Charg",
            "Fvenc",
            "Mtart",
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
