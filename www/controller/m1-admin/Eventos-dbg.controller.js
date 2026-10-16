sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
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
    Formatter,
    Manager
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var path = "com.axelera.pe.gestioncomercial.view.m1-admin.eventos";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m1-admin.Eventos",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("AD03", "Clear", this.onInitEventos, this);
        },

        onInitEventos: function (channel, event, oData) {
          this.initialization(oData.active);
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            this.callCountEventos();
            this.matchcodeModulos(false); //+@
            this.manager.setBusy(false);
          }
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            IdEvento: "",
            Nombre: "",
            page: {
              CantFilas: 10,
              Indice: 0,
              TotalItems: 0,
              Page: 1,
              TotalPages: 0,
              PrevPageBtn: false,
              NextPageBtn: false,
            },
            Buscar: "",
            Filters: [],
            loadingTbl: false, //+@
            IsMobile: this.manager.isMobile(),
            IdModulo: "",
            IdAccion: "",
            Estado: false,
            TieneAcciones: false
          });
        },

        onRefreshTable: function () {
          this.callCountEventos();
        },

        callCountEventos: function ( indBusqueda = "" ) {
          const oService = this.manager.getService("ADMIN");
          const uri = "/EventosSet/$count";

          let cantFilas = oLocal.getProperty("/page/CantFilas");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          oLocal.setProperty("/loadingTbl", true);

          const aFilters = oLocal.getProperty("/Filters"); //+@ES20241119

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "buscar": indBusqueda,
            "mobile": this.manager.getIndMobile(),
          });

          oService.read(uri, {
            filters: aFilters,
            success: function (oData, oResponse) {
              // console.log("Count Eventos (success)", oData);
              this.manager.setBusy(false);
              if (oResponse.body) {
                oLocal.setProperty(
                  "/page/TotalItems",
                  parseInt(oResponse.body)
                );
                this.getEventos(cantFilas, indice, page);
              } else {
                oLocal.setProperty("/loadingTbl", false);
              }
            }.bind(this),
            error: function (oError) {
              console.error("Count Eventos (error)", oError);
              oLocal.setProperty("/loadingTbl", false);
              this.manager.setBusy(false);
            }.bind(this),
          });
        },

        getEvento: function (id, dialog) {
          const oService = this.manager.getService("ADMIN");
          const uri = `/EventosSet(Id=${id},Sociedad='${this.manager.getBukrs()}')`;

          oService.read(uri, {
            success: async function (oData) {
              console.log("Evento", oData);
              this.setEvento(oData);
              await this.matchcodeDefEventos(oData.IdModulo);
              this.displayPopup(dialog);
            }.bind(this),
            error: function (oError) {
              oLocal.setProperty("/loadingTbl", false);
              console.error("Eventos (error)", oError);
            },
          });
        },

        getEventos: async function (top, skip, page) {
          const totalItems = oLocal.getProperty("/page/TotalItems");
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          const totalPages = Math.ceil(totalItems / cantFilas);

          oLocal.setProperty("/page/TotalPages", totalPages);
          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", skip);

          const oModel = new JSONModel();
          const oService = this.manager.getService("ADMIN");
          const uri = "/EventosSet";
          const params = {
            $top: top,
            $skip: skip,
          };

          const indice = oLocal.getProperty("/page/Indice");
          const aFilters = oLocal.getProperty("/Filters");

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.read(uri, {
            urlParameters: params,
            filters: aFilters,
            success: function (oData, oResponse) {
              console.log("Listar Eventos (success)", oData);
              oModel.setData(oData.results);
              if (oData.results.length == 0 && page > 1) {
                oLocal.setProperty("/page/Indice", indice - cantFilas);
                oLocal.setProperty("/page/Page", page - 1);
                this.onRefreshTable();
              } else {
                oLocal.setProperty("/loadingTbl", false);
              }
              this.fnNavButtonsEnable();
            }.bind(this),
            error: function (oError) {
              oLocal.setProperty("/loadingTbl", false);
              console.error("Listar Eventos (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataEventos");
        },

        setFilters: function (sQuery) {
          const aFilters = [];
          sQuery = sQuery.toUpperCase();

          if (typeof sQuery == "string" && sQuery.length > 0) {
            aFilters.push(
              new Filter(
                // [new Filter("Nombre", FilterOperator.Contains, sQuery)],
                [
                  new Filter("NameModul", FilterOperator.Contains, sQuery),
                  new Filter("DescAccion", FilterOperator.Contains, sQuery)
                ],
                false
              )
            );
          }

          oLocal.setProperty("/Filters", aFilters);
        },

        onBuscar: function (oEvent) {
          const sValor = oEvent.getSource().getValue();
          this.setFilters(sValor);
          // this.onFirstPress();
          oLocal.setProperty("/page/Indice", 0);
          oLocal.setProperty("/page/Page", 1);
          this.callCountEventos("X");
        },

        onCloseDialog: function (oEvent, dialog) {
          if (dialog?.length > 0) {
            this.byId(dialog).destroy();
          }
        },

        setEvento: function (data) {
          if (data) {
            oLocal.setProperty("/IdEvento", data.Id);
            oLocal.setProperty("/IdModulo", data.IdModulo);
            oLocal.setProperty("/IdAccion", data.IdAccion);
            oLocal.setProperty("/Estado", data.Estado);
          } else {
            oLocal.setProperty("/IdEvento", "");
            oLocal.setProperty("/IdModulo", "");
            oLocal.setProperty("/IdAccion", "");
            oLocal.setProperty("/Estado", false);
          }
        },

        onCrearEvento: function () {
          this.setEvento(null);

          const oEventosModel = this.getView().getModel("oDataMCDefEventos");

          if (oEventosModel) {
            oEventosModel.setData([]);
          } else {
            this.getView().setModel(
              new JSONModel([]),
              "oDataMCDefEventos"
            );
          }

          // this.byId("selModulo")?.setSelectedKey("");
          // this.byId("selAccion")?.setSelectedKey("");

          this.displayPopup("CrearEvento");
        },

        onChangeModulo: async function (oEvent) {
          const sIdModulo = oEvent.getSource().getSelectedKey();

          oLocal.setProperty("/IdModulo", sIdModulo);
          oLocal.setProperty("/IdAccion", "");
          oLocal.setProperty("/TieneAcciones", false);

          const oEventosModel = this.getView().getModel("oDataMCDefEventos")

          if (oEventosModel) {
            oEventosModel.setData([]);
          }

          if (!sIdModulo) {
            return;
          }

          await this.matchcodeDefEventos(sIdModulo);
        },

        onChangeAccion: function (oEvent) {
          const idAccion = oEvent.getSource().getSelectedKey();
          // console.log("Cambio de módulo", idModulo);

          oLocal.setProperty("/IdAccion", idAccion);
        },

        onSaveCrearEvento: function () {

          const idModulo = oLocal.getProperty("/IdModulo");
          const idAccion = oLocal.getProperty("/IdAccion");

          const data = {
            Id: 0,
            Sociedad: this.manager.getBukrs(),
            IdModulo: idModulo,
            IdAccion: idAccion,
            Estado: true,
            Fechacreacion: null,
            Usucreador: null,
          };

          let error = false;

          if (idModulo == "") {
            error = true;
          }

          if (idAccion == "") {
            error = true;
          }

          // console.log("data", data);

          if (error) {
            MessageToast.show(i18n.getText("MsgErrorForm"));
          } else {
            this.crearEvento(data);
          }
        },

        crearEvento: function (data) {
          const oService = this.manager.getService("ADMIN");
          const uri = "/EventosSet";

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.create(uri, data, {
            success: function (oData, oResponse) {
              // console.log("Crear Evento (success)", oData);
              if (this.manager.msgResult(oResponse)) {
                this.onRefreshTable();
              }

              oLocal.setProperty("/IdModulo", "");
              oLocal.setProperty("/IdAccion", "");

              this.getView().getModel("oDataMCDefEventos").setData([]);

              this.onCloseDialog(null, "dialogCrearEvento");
            }.bind(this),
            error: function (oError) {
              console.error("Crear Evento (error)", oError);
            },
          });
        },

        onEditarEvento: function (oEvent) {
          const bindingContext = oEvent.getSource().getBindingContext("oDataEventos");
          const id = bindingContext.getProperty("Id");

          this.getEvento(id, "EditarEvento");
        },

        onSaveEditarEvento: function () {
          const id = oLocal.getProperty("/IdEvento");
          const idModulo = oLocal.getProperty("/IdModulo");
          const idAccion = oLocal.getProperty("/IdAccion");

          const data = {
            Id: id,
            IdModulo: idModulo,
            IdAccion: idAccion,
            Estado: oLocal.getProperty("/Estado"),
            Fechacreacion: null,
          };

          let error = false;

          if (idModulo == "") {
            error = true;
          }

          if (idAccion == "") {
            error = true;
          }

          if (error) {
            MessageToast.show(i18n.getText("MsgErrorForm"));
          } else {
            this.editarEvento(id, data);
          }
        },

        onSwitchEstado: function (oEvent) {
          const bindingContext = oEvent
            .getSource()
            .getBindingContext("oDataEventos");
          const id = bindingContext.getProperty("Id");
          let estado = false;

          if (oEvent.mParameters.state) {
            estado = true;
          }

          this.manager.cambiarEstado(this, "EVENTOS", id.toString(), estado);
        },

        editarEvento: function (id, data) {
          const oService = this.manager.getService("ADMIN");
          const uri = `/EventosSet(Id=${id},Sociedad='${this.manager.getBukrs()}')`;

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.update(uri, data, {
            method: "PUT",
            success: function (oData, oResponse) {
              // console.log("Editar Evento (success)", oData);
              this.onCloseDialog(null, "dialogEditarEvento");
              if (this.manager.msgResult(oResponse)) {
                this.onRefreshTable();
              }
            }.bind(this),
            error: function (oError) {
              console.error("Editar Evento (error)", oError);
            },
          });
        },

        onEliminarEvento: function (oEvent) {
          const oBindingContext = oEvent
            .getSource()
            .getBindingContext("oDataEventos");
          const id = oBindingContext.getProperty("Id");

          MessageBox.warning(i18n.getText("MsgEVConfEliminarEve"), {
            title: i18n.getText("EliminarEve"),
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: function (sAction) {
              if (sAction === MessageBox.Action.OK) {
                this.deleteEvento(id);
              }
            }.bind(this),
            dependentOn: this.getView(),
          });
        },

        deleteEvento: function (id) {
          const oService = this.manager.getService("ADMIN");
          const uri = `/EventosSet(Id=${id},Sociedad='${this.manager.getBukrs()}')`;

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.remove(uri, {
            method: "DELETE",
            success: function (oData, oResponse) {
              // console.log("Eliminar Evento (success):", oData);
              if (this.manager.msgResult(oResponse)) {
                this.onRefreshTable();
              }
            }.bind(this),
            error: function (oError) {
              console.error("Eliminar Evento (error):", oError);
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

        //#region SERVICIOS MATCHCODES

        matchcodeModulos: function (popup) {
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
            method: "GET",
            success: function (oData) {
              // console.log("Módulos", oData.results)

              const aModulos = oData.results || [];

              const aModulosSelect = [
                {
                  IdModulo: "",
                  NameModul: "-"
                },
                ...aModulos
              ]
              oModel.setData(aModulosSelect);

              oLocal.setProperty("/IdModulo", "");
              oLocal.setProperty("/IdAccion", "");
            }.bind(this),
            error: function (oError) {
              console.error("Data matchcodes (error):", oError);

              oModel.setData([
                {
                  IdModulo: "",
                  NameModul: "-"
                }
              ]);

              oLocal.setProperty("/IdModulo", "");
              oLocal.setProperty("/IdAccion", "");
            }.bind(this),
          });
          this.getView().setModel(oModel, "oDataMCModulos");
        },


        matchcodeDefEventos: function (idModulo) {
          return new Promise((resolve, reject) => {
            const oModel = new JSONModel();
            const oService = this.manager.getService("ADMIN");
            const uri = "/DefEventosSet";

            oService.setHeaders({
              "X-Requested-With": "X",
              "usuario": this.manager.getUser(),
              "sociedad": this.manager.getBukrs(),
              "mobile": this.manager.getIndMobile(),
            });

            oService.read(uri, {
              method: "GET",
              urlParameters: {
                "$filter": `IdModulo eq '${idModulo}'`
              },

              success: function (oData) {
                const aEventos = oData.results || [];

                console.log("Eventos por Módulo", aEventos);

                oModel.setData(aEventos);
                this.getView().setModel(oModel, "oDataMCDefEventos");

                if (aEventos.length > 0) {
                  oLocal.setProperty("/TieneAcciones", true);
                  const sIdAccion = String(aEventos[0].IdAccion);
                  oLocal.setProperty("/IdAccion", sIdAccion);
                  console.log("Accion seleccionada automáticamente", sIdAccion);
                } else {
                  oLocal.setProperty("/TieneAcciones", false);
                  oLocal.setProperty("/IdAccion", "");
                }

                resolve(aEventos);
              }.bind(this),

              error: function (oError) {
                console.error("Data matchcodes (error):", oError);

                oModel.setData([]);
                this.getView().setModel(oModel, "oDataMCDefEventos");

                oLocal.setProperty("/IdAccion", "");
                oLocal.setProperty("/TieneAcciones", false);

                reject(oError);
              }.bind(this)
            });
          });
        },
        // matchcodeDefEventos: function (idModulo) {
        //   const oModel = new JSONModel();
        //   const oService = this.manager.getService("ADMIN");
        //   const uri = "/DefEventosSet";

        //   oService.setHeaders({
        //     "X-Requested-With": "X",
        //     "usuario": this.manager.getUser(),
        //     "sociedad": this.manager.getBukrs(),
        //   });

        //   oService.read(uri, {
        //     method: "GET",
        //     urlParameters: {
        //       "$filter": `IdModulo eq '${idModulo}'`
        //     },
        //     success: function (oData) {
        //       // console.log("Eventos por Módulo", oData.results)
        //       oModel.setData(oData.results);

        //       // if (oData.results.length > 0) {
        //       //   oLocal.setProperty("/IdAccion", oData.results[0].IdAccion);
        //       // }

        //       // popup && this.displayPopup("MatchcodeDefEventos");
        //     }.bind(this),
        //     error: function (oError) {
        //       console.error("Data matchcodes (error):", oError);
        //       // oModel.setData([]);
        //     }.bind(this),
        //   });

        //   this.getView().setModel(oModel, "oDataMCDefEventos");
        // },

        //#endregion

        //#region PAGINATION

        onFirstPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = 1;
          let indice = 0;
          this.getEventos(cantFilas, indice, page);
        },

        onPreviousPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          if (indice >= cantFilas) {
            indice = indice - cantFilas;
            page -= 1;
            oLocal.setProperty("/page/Page", page);
            this.getEventos(cantFilas, indice, page);
          }
        },

        onNextPress: function () {
          const totalItems = oLocal.getProperty("/page/TotalItems");
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          if (indice + cantFilas <= totalItems) {
            indice = indice + cantFilas;
            page += 1;
            oLocal.setProperty("/page/Page", page);
            this.getEventos(cantFilas, indice, page);
          }
        },

        onLastPress: function () {
          const totalItems = oLocal.getProperty("/page/TotalItems");
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = 0;
          let indice = 0;

          let modulo = totalItems % cantFilas;
          page = Math.ceil(totalItems / cantFilas);

          if (modulo === 0) {
            indice = totalItems - cantFilas;
          } else {
            indice = totalItems - modulo;
          }

          this.getEventos(cantFilas, indice, page);
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
