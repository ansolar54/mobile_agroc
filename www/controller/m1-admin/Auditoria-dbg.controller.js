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
    Formatter,
    Manager
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var path = "com.axelera.pe.gestioncomercial.view.m1-admin.auditoria";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m1-admin.Auditoria",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("AD04", "Clear", this.onInitAuditoria, this);
        },

        onInitAuditoria: function (channel, event, oData) {
          this.initialization(oData.active);

          if (this.manager.isMobile()) {
            this.byId("btnDescExcel").setVisible(false);
          }
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            this.getRoles();
            this.getModulos();
            // this.getEventos();
            this.countListaAuditoria();
            this.manager.setBusy(false);
          }
        },

        initialLocal: function (inicio) {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          // let fechaInicio = inicio ? new Date() : null;

          oLocal.setData({
            Buscar: "",
            FechaDesde: new Date(), //null,
            FechaHasta: new Date(),
            page: {
              CantFilas: 10,
              Indice: 0,
              TotalItems: 0,
              Page: 1,
              TotalPages: 0,
              PrevPageBtn: false,
              NextPageBtn: false,
            },
            // visible: {
            //   fhasta: false,
            // },
            Filename: "Reporte",
            loadingTbl: false, //+@
            IsMobile: this.manager.isMobile(),
            Campo: "",
            Orden: "",
          });
        },

        countListaAuditoria: function () {
          // this.getListaAuditoria(10, 0, 1);
          this.onBuscar(null, true);
        },

        onCloseDialog: function (oEvent, dialog) {
          this.byId(dialog).destroy();
        },

        onChangeModulo: function (oEvent) {
          const oMultiComboBox = oEvent.getSource();
          const aSelectedKeys = oMultiComboBox.getSelectedKeys();
          console.log("Módulos seleccionados", aSelectedKeys);

          this.getEventos(aSelectedKeys);
          // if(selectedKeys.length > 0){
          //   this.getEventos(selectedKeys[0]);
          // }
        },

        getModulos: async function () {
          const oModel = new JSONModel();
          const oService = this.manager.getService("ADMIN");
          const uri = "/ModulosSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.read(uri, {
            success: function (oData, oResponse) {
              console.log("Listar Modulos (success)", oData)
              oModel.setData(oData);
            }.bind(this),
            error: function (oError) {
              console.error("Listar Modulos (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataModulos");

        },

        getEventos: function (aIdModulos) {
          const oModel = new JSONModel({
            results: []
          });

          this.getView().setModel(oModel, "oDataEventos");

          if (!aIdModulos || aIdModulos.length === 0) {
            return;
          }
          const oService = this.manager.getService("ADMIN");
          const uri = "/DefEventosSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "auditoria": "X",
            "mobile": this.manager.getIndMobile(),
          });

          const sFilter = aIdModulos
            .map((idModulo) => `IdModulo eq '${idModulo}'`)
            .join(" or ");

          console.log("Filtro:", sFilter);

          oService.read(uri, {
            method: "GET",
            urlParameters: {
              "$filter": sFilter,
            },
            success: function (oData) {
              console.log("Listar Eventos (success)", oData)
              oModel.setData(oData);
              // this.getView().setModel(oModel, "oDataEventos");
            }.bind(this),
            error: function (oError) {
              console.error("Listar Eventos (error)", oError);
            },
          });

        },

        getRoles: async function () {
          const oModel = new JSONModel();
          const oService = this.manager.getService("ADMIN");
          const uri = "/RolesSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
            "auditoria": "X",
          });

          oService.read(uri, {
            success: function (oData, oResponse) {
              // console.log("Listar Roles (success)", oData)
              oModel.setData(oData);
            }.bind(this),
            error: function (oError) {
              console.error("Listar Roles (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataRoles");
        },

        // getEventos: async function () {
        //   const oModel = new JSONModel();
        //   const oService = this.manager.getService("ADMIN");

        //   oService.setHeaders({
        //     "X-Requested-With": "X",
        //     "usuario": this.manager.getUser(),
        //     "sociedad": this.manager.getBukrs(),
        //   });

        //   oService.read("/EventosSet", {
        //     success: function (oData, oResponse) {
        //       // console.log("Listar Eventos (success)", oData)
        //       oModel.setData(oData);
        //     }.bind(this),
        //     error: function (oError) {
        //       console.error("Listar Eventos (error)", oError);
        //     },
        //   });

        //   this.getView().setModel(oModel, "oDataEventos");
        // },

        // getListaAuditoria: function (cantFilas, indice, page) {
        //   const data = {
        //     Accion: "L",
        //     Buscador: "",
        //     FechaIni: null,
        //     FechaFin: null,
        //     Pagination: {
        //       Indice: indice,
        //       CantidadFilas: cantFilas,
        //       Total: 0,
        //     },
        //     auditoria_idsroles_nav: [],
        //     auditoria_idseventos_nav: [],
        //     auditoria_listado_nav: [],
        //     auditoria_registro_nav: [],
        //   };

        //   this.callReport(data, page, indice, true);
        // },

        callReport: async function (data, page, indice, busy, indBuscar = "") {
          const oModel = new JSONModel();
          const oService = this.manager.getService("ADMIN");

          const uri =
            "/AuditoriaSet?/$expand=auditoria_idsroles_nav," +
            "auditoria_idsmodulos_nav," +
            "auditoria_idsacciones_nav," +
            "auditoria_listado_nav";

          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", indice);
          busy && oLocal.setProperty("/loadingTbl", true);

          this.manager.isMobile() && SpinnerDialog.show();

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "buscar": indBuscar,
            "mobile": this.manager.getIndMobile(),
          });

          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              console.log("Listar Auditoria (success)", oData); //+@ES
              this.manager.setBusy(false);
              oModel.setData(oData);
              busy && oLocal.setProperty("/loadingTbl", false);
              this.updatePagination(oData.Pagination.Total);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
            error: function (oError) {
              console.error("Listar Auditoria (error)", oError); //+@ES
              busy && oLocal.setProperty("/loadingTbl", false);
              this.manager.setBusy(false);
              this.manager.isMobile() && SpinnerDialog.hide();
            }.bind(this),
          });

          this.getView().setModel(oModel, "oDataAuditoria");
        },

        formateDateToMovil: function (isoDate) {
          if (!isoDate) return null;
          const date = new Date(isoDate);
          const timestamp = date.getTime();
          return `/Date(${timestamp})/`;
        },

        // onBuscar: function (oEvent, sBusy) {
        //   oLocal.setProperty("/page/Indice", 0);
        //   oLocal.setProperty("/page/Page", 1);

        //   const data = {
        //     Accion: "L",
        //     Buscador: oLocal.getProperty("/Buscar"),
        //     FechaIni: oLocal.getProperty("/FechaDesde"),
        //     FechaFin: oLocal.getProperty("/FechaHasta"),
        //     Pagination: {
        //       Indice: 0,
        //       CantidadFilas: oLocal.getProperty("/page/CantFilas"),
        //       Total: 0,
        //     },
        //     IsCampo: oLocal.getProperty("/Campo"),
        //     IsOrden: oLocal.getProperty("/Orden"),

        //     auditoria_idsroles_nav: [],
        //     auditoria_idsmodulos_nav: [],
        //     auditoria_idsacciones_nav: [],
        //     auditoria_listado_nav: [],
        //   };

        //   const aRoles = this.getView().byId("mcboRoles");
        //   if (aRoles) {
        //     aRoles.getSelectedKeys().map((id) => {
        //       data.auditoria_idsroles_nav.push({ Id: Number(id) });
        //     });
        //   }

        //   const aModulos = this.getView().byId("mcboModulos");
        //   if (aModulos) {
        //     aModulos.getSelectedKeys().map((id) => {
        //       console.log("ID de módulo seleccionado:", id); //+@AS

        //       data.auditoria_idsmodulos_nav.push({
        //         IdModulo: String(id)
        //       });
        //     });
        //   }

        //   const aAcciones = this.getView().byId("mcboEventos");
        //   if (aAcciones) {
        //     aAcciones.getSelectedKeys().map((id) => {
        //       data.auditoria_idsacciones_nav.push({
        //         IdAccion: String(id)
        //       });
        //     });
        //   }

        //   console.log("Datos de búsqueda:", data); //+@AS

        //   this.callReport(data, 1, 0, sBusy, "X");
        // },

        onBuscar: function (oEvent, sBusy) {
          oLocal.setProperty("/page/Indice", 0);
          oLocal.setProperty("/page/Page", 1);

          const data = {
            Accion: "L",
            Buscador: oLocal.getProperty("/Buscar"),
            FechaIni: oLocal.getProperty("/FechaDesde"),
            FechaFin: oLocal.getProperty("/FechaHasta"),
            Pagination: {
              Indice: 0,
              CantidadFilas: oLocal.getProperty("/page/CantFilas"),
              Total: 0,
            },
            IsCampo: oLocal.getProperty("/Campo"),
            IsOrden: oLocal.getProperty("/Orden"),

            auditoria_idsroles_nav: [],
            auditoria_idsmodulos_nav: [],
            auditoria_idsacciones_nav: [],
            auditoria_listado_nav: [],
          };

          // ID diferente dependiendo de si es móvil
          const sIdRoles = this.manager.isMobile()
            ? "mcboRolesmobile"
            : "mcboRoles";

          const aRoles = this.getView().byId(sIdRoles);

          if (aRoles) {
            aRoles.getSelectedKeys().forEach((id) => {
              data.auditoria_idsroles_nav.push({
                Id: Number(id)
              });
            });
          }

          const sIdModulos = this.manager.isMobile()
            ? "mcboModulosmobile"
            : "mcboModulos";

          const aModulos = this.getView().byId(sIdModulos);

          if (aModulos) {
            aModulos.getSelectedKeys().forEach((id) => {
              console.log("ID de módulo seleccionado:", id);

              data.auditoria_idsmodulos_nav.push({
                IdModulo: String(id)
              });
            });
          }

          const sIdEventos = this.manager.isMobile()
            ? "mcboEventosmobile"
            : "mcboEventos";

          const aAcciones = this.getView().byId(sIdEventos);

          if (aAcciones) {
            aAcciones.getSelectedKeys().forEach((id) => {
              data.auditoria_idsacciones_nav.push({
                IdAccion: String(id)
              });
            });
          }

          console.log("Datos de búsqueda:", data);

          this.callReport(data, 1, 0, sBusy, "X");
        },

        getSearchData: function () {
          const data = {
            Accion: "L",
            Buscador: oLocal.getProperty("/Buscar"),
            FechaIni: oLocal.getProperty("/FechaDesde"),
            FechaFin: oLocal.getProperty("/FechaHasta"),
            Pagination: {
              Indice: 0,
              CantidadFilas: 0,
              Total: 0,
            },
            auditoria_idsroles_nav: [],
            auditoria_idsmodulos_nav: [],
            auditoria_idsacciones_nav: [],
            auditoria_listado_nav: [],
            // auditoria_registro_nav: [],
          };

          // Asignar IDs de roles seleccionados
          const aRoles = this.getView().byId("mcboRoles");
          if (aRoles) {
            aRoles.getSelectedKeys().map((id) => {
              data.auditoria_idsroles_nav.push({ Id: Number(id) });
            });
          }

          const aModulos = this.getView().byId("mcboModulos");
          if (aModulos) {
            aModulos.getSelectedKeys().map((id) => {
              data.auditoria_idsmodulos_nav.push({ IdModulo: String(id) });
            });
          }

          // Asignar IDs de eventos seleccionados
          const aAcciones = this.getView().byId("mcboEventos");
          if (aAcciones) {
            aAcciones.getSelectedKeys().map((id) => {
              data.auditoria_idsacciones_nav.push({ IdAccion: String(id) });
            });
          }

          return data;
        },

        // onChange: function (oEvent, sInput) {
        //   switch (sInput) {
        //     case "FDESDE":
        //       // let fecha = oEvent.getSource().getDateValue();
        //       let valor = oEvent.getParameter("value");
        //       if (valor) {
        //         oLocal.setProperty("/visible/fhasta", true);
        //       } else {
        //         oLocal.setProperty("/visible/fhasta", false);
        //         oLocal.setProperty("/FechaHasta", null);
        //       }
        //       break;

        //     default:
        //       break;
        //   }
        // },

        onLimpiarCampos: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          oLocal.setProperty("/page/Page", 1);
          oLocal.setProperty("/page/Indice", 0);

          this.initialLocal();

          if (this.manager.isMobile()) {
            this.getView().byId("mcboRolesmobile").setSelectedItems([]);
            this.getView().byId("mcboModulosmobile").setSelectedItems([]);
            this.getView().byId("mcboEventosmobile").setSelectedItems([]);
          } else {
            this.getView().byId("mcboRoles").setSelectedItems([]);
            this.getView().byId("mcboModulos").setSelectedItems([]);
            this.getView().byId("mcboEventos").setSelectedItems([]);
          }

          this.getView().setModel(new JSONModel(), "oDataAuditoria");
          // this.getListaAuditoria(cantFilas, 0, 1);
        },

        onScreenDescargaExcel: function () {
          this.loadFragment({
            name: `${path}.DescargaExcel`,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.open();
            }.bind(this)
          );
        },

        onDescargar: function () {
          const oTable = this.byId("tblAuditoria");
          const oInputNombre = this.getView().byId("txtNombreArchivoAU");
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
              label: "NOMBRES",
              property: "Nombre",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "APELLIDOS",
              property: ["Apepat", "Apemat"],
              type: exportLibrary.EdmType.String,
              template: "{0} {1}",
            },
            {
              label: "USUARIO",
              property: "Usuario",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "CORREO",
              property: "Correo",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "ROL",
              property: "Rol",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "MODULO",
              property: "Modulo",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "EVENTO",
              property: "Evento",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "FECHA",
              property: "Fechacreacion",
              type: exportLibrary.EdmType.Date,
            },
            {
              label: "HORA",
              property: "Horacreacion",
              type: exportLibrary.EdmType.Time,
            },
            {
              label: "OFI. VENTAS",
              property: "Ofiventas",
              type: exportLibrary.EdmType.String,
            },
            {
              label: "ORI. INGRESO",
              property: "Indicador",
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
            // Si el número de filas seleccionadas es igual al número total de filas, se han seleccionado "todos"
            const searchData = this.getSearchData();
            searchData.Pagination = {
              CantidadFilas: 0,
              Indice: 0,
            };

            this.ondataExcelAll(searchData, true).then((oData) => {
              const exportData = oData.auditoria_listado_nav.results; // Obtener los datos específicos
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
          this.onCloseDialog(null, "dialogExcelAU");
        },

        exportToExcel: function (data, fileName, columns) {
          // return new Promise((resolve, reject) => {
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

          // oSheet.build()
          //   .then((blob) => {
          //     console.log("Contenido del Blob generado:", blob);

          //     if (this.manager.isMobile()) {
          //       // Entorno móvil: Usar cordova-plugin-file
          //       window.resolveLocalFileSystemURL(
          //         cordova.file.externalDataDirectory,
          //         (dir) => {
          //           dir.getFile(`${fileName}.xlsx`, { create: true }, (file) => {
          //             file.createWriter((fileWriter) => {
          //               fileWriter.onwriteend = function () {
          //                 alert(`Archivo guardado correctamente: ${file.nativeURL}`);
          //               };
          //               fileWriter.onerror = function (e) {
          //                 console.error("Error al escribir el archivo: ", e);
          //               };
          //               fileWriter.write(blob);
          //             });
          //           }, (err) => {
          //             console.error("Error al crear el archivo: ", err);
          //           });
          //         }, (err) => {
          //           console.error("Error al acceder al directorio: ", err);
          //         }
          //       );
          //     } else {
          //       // Entorno web: Descargar usando saveAs
          //       saveAs(blob, `${fileName}.xlsx`);
          //     }
          //   })
          //   .finally(() => {
          //     oSheet.destroy();
          //   });
        },

        ondataExcelAll: function (data, busy) {
          // const oTable = this.byId("tblAuditoria");
          const oModel = new JSONModel();
          const oService = this.manager.getService("ADMIN");
          const uri =
            "/AuditoriaSet?/$expand=auditoria_idsroles_nav," +
            "auditoria_idseventos_nav," +
            "auditoria_listado_nav";

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
              method: "GET",
              success: function (oData, oResponse) {
                // console.log("Listar Auditoria all (success)", oData);
                oModel.setData(oData);
                busy && oLocal.setProperty("/loadingTbl", false);
                resolve(oData); // Resuelve la promesa con los datos
              }.bind(this),
              error: function (oError) {
                console.error("Listar Auditoria (error)", oError);
                busy && oLocal.setProperty("/loadingTbl", false);
                reject(oError); // Rechaza la promesa con el error
              },
            });
          });
        },

        parseISODurationToMilliseconds: function (duration) {
          // console.log("HORA PARA FORMATEAR", duration);
          const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
          const matches = duration.match(regex);

          let hours = matches[1] ? parseInt(matches[1].replace("H", "")) : 0;
          let minutes = matches[2] ? parseInt(matches[2].replace("M", "")) : 0;
          let seconds = matches[3] ? parseInt(matches[3].replace("S", "")) : 0;

          const milliseconds =
            hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
          // console.log("HORA FORMATEADA", milliseconds)
          return milliseconds;
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

          this.onBuscar(null, true);
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

            const searchData = this.getSearchData();
            searchData.Pagination = {
              CantidadFilas: cantFilas,
              Indice: indice,
            };
            this.callReport(searchData, page, indice, true, null);
          }
        },

        onPreviousPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          if (indice > 0) {
            indice -= cantFilas;
            page -= 1;

            const searchData = this.getSearchData();
            searchData.Pagination = {
              CantidadFilas: cantFilas,
              Indice: indice,
            };
            this.callReport(searchData, page, indice, true, null);
          }
        },

        onFirstPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          const searchData = this.getSearchData();
          searchData.Pagination = {
            CantidadFilas: cantFilas,
            Indice: 0,
          };
          this.callReport(searchData, 1, 0, true, null);
        },

        onLastPress: function () {
          let totalItems = oLocal.getProperty("/page/TotalItems");
          let cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = Math.ceil(totalItems / cantFilas);
          let indice = (page - 1) * cantFilas;
          const searchData = this.getSearchData();
          searchData.Pagination = {
            CantidadFilas: cantFilas,
            Indice: indice,
          };
          this.callReport(searchData, page, indice, true, null);
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
