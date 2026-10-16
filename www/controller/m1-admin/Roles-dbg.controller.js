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
    var path = "com.axelera.pe.gestioncomercial.view.m1-admin.roles";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m1-admin.Roles",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("AD02", "Clear", this.onInitRoles, this);
        },

        onInitRoles: function (channel, event, oData) {
          this.initialization(oData.active);
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            this.callCountRoles();
            this.manager.setBusy(false);
          }
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            IdRol: "",
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
          });
        },

        onRefreshTable: function () {
          this.callCountRoles();
        },

        callCountRoles: function ( indBusqueda = "" ) {
          const oService = this.manager.getService("ADMIN");
          const uri = "/RolesSet/$count";

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
              // console.log("Count Roles (success)", oData);
              this.manager.setBusy(false);
              if (oResponse.body) {
                oLocal.setProperty(
                  "/page/TotalItems",
                  parseInt(oResponse.body)
                );
                this.getRoles(cantFilas, indice, page);
              } else {
                oLocal.setProperty("/loadingTbl", false);
              }
            }.bind(this),
            error: function (oError) {
              console.error("Count Roles (error)", oError);
              oLocal.setProperty("/loadingTbl", false);
              this.manager.setBusy(false);
            }.bind(this),
          });
        },

        getRol: async function (id, dialog) {
          const oService = this.manager.getService("ADMIN");
          const uri = `/RolesSet(Id=${id},Sociedad='${this.manager.getBukrs()}')`;

          oService.read(uri, {
            success: function (oData, oResponse) {
              this.setRol(oData);
              this.displayPopup(dialog);
            }.bind(this),
            error: function (oError) {
              oLocal.setProperty("/loadingTbl", false);
              console.error("Roles (error)", oError);
            },
          });
        },

        getRoles: async function (top, skip, page) {
          const totalItems = oLocal.getProperty("/page/TotalItems");
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          const totalPages = Math.ceil(totalItems / cantFilas);

          oLocal.setProperty("/page/TotalPages", totalPages);
          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", skip);

          const oModel = new JSONModel();
          const oService = this.manager.getService("ADMIN");
          const uri = "/RolesSet";
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
              // console.log("Roles (success)", oData);
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
              console.error("Roles (error)", oError);
            },
          });

          this.getView().setModel(oModel, "oDataRoles");
        },

        setFilters: function (sQuery) {
          const aFilters = [];
          sQuery = sQuery.toUpperCase();

          if (typeof sQuery == "string" && sQuery.length > 0) {
            aFilters.push(
              new Filter(
                [new Filter("Nombre", FilterOperator.Contains, sQuery)],
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
          this.callCountRoles("X");
        },

        onCloseDialog: function (oEvent, dialog) {
          if (dialog?.length > 0) {
            this.byId(dialog).destroy();
          }
        },

        setRol: function (data) {
          if (data) {
            oLocal.setProperty("/IdRol", data.Id);
            oLocal.setProperty("/Nombre", data.Nombre);
          } else {
            oLocal.setProperty("/IdRol", "");
            oLocal.setProperty("/Nombre", "");
          }
        },

        onCrearRol: function (oEvent) {
          this.setRol(null);
          this.displayPopup("CrearRol");
        },

        onChangeNombre: function (oEvent) {
          const oInput = oEvent.getSource();
          const sValue = oInput.getValue();
          if (!sValue) {
            oInput.setValueState("Error");
          } else {
            oInput.setValueState("None");
          }
        },

        onSaveCrearRol: function () {
          const data = {
            Id: 0,
            Nombre: oLocal.getProperty("/Nombre"),
            Estado: true,
            Fechacreacion: null,
          };

          let error = false;

          const oInput = this.getView().byId("txtNombreROC");
          const sValue = oInput.getValue();
          if (
            typeof sValue == "string" &&
            sValue.length == 0 &&
            oInput.getRequired()
          ) {
            oInput.setValueState("Error");
            error = true;
          } else {
            oInput.setValueState("None");
          }

          if (error) {
            MessageToast.show(i18n.getText("MsgErrorForm"));
          } else {
            this.crearRol(data);
          }
        },

        crearRol: async function (data) {
          const oService = this.manager.getService("ADMIN");
          const uri = "/RolesSet";
          
          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            success: function (oData, oResponse) {
              // console.log("Crear Rol (success)", oData);
              if (this.manager.msgResult(oResponse)) {
                this.onRefreshTable();
              }
              this.onCloseDialog(null, "dialogCrearRol");
            }.bind(this),
            error: function (oError) {
              console.error("Crear Rol (error)", oError);
            },
          });
        },

        onEditarRol: function (oEvent) {
          const bindingContext = oEvent
            .getSource()
            .getBindingContext("oDataRoles");
          const id = bindingContext.getProperty("Id");

          this.getRol(id, "EditarRol");
        },

        onSaveEditarRol: function () {
          const dialog = "dialogEditarRol";
          const id = oLocal.getProperty("/IdRol");
          const data = {
            Id: id,
            Nombre: oLocal.getProperty("/Nombre"),
            Estado: true,
            Fechacreacion: null,
          };

          let error = false;

          const oInput = this.getView().byId("txtNombreROE");
          const sValue = oInput.getValue();
          if (
            typeof sValue == "string" &&
            sValue.length == 0 &&
            oInput.getRequired()
          ) {
            oInput.setValueState("Error");
            error = true;
          } else {
            oInput.setValueState("None");
          }

          if (error) {
            MessageToast.show(i18n.getText("MsgErrorForm"));
          } else {
            this.editarRol(id, data, dialog);
          }
        },

        onSwitchEstado: function (oEvent) {
          const bindingContext = oEvent
            .getSource()
            .getBindingContext("oDataRoles");
          const id = bindingContext.getProperty("Id");
          let estado = false;

          if (oEvent.mParameters.state) {
            estado = true;
          }

          this.manager.cambiarEstado(this, "ROLES", id.toString(), estado);
        },

        editarRol: async function (id, data, dialog) {
          const oService = this.manager.getService("ADMIN");
          const uri = `/RolesSet(Id=${id},Sociedad='${this.manager.getBukrs()}')`;
          
          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.update(uri, data, {
            method: "PUT",
            success: function (oData, oResponse) {
              // console.log("Editar Rol (success)", oData);
              this.onCloseDialog(null, dialog);
              if (this.manager.msgResult(oResponse)) {
                this.onRefreshTable();
              }
            }.bind(this),
            error: function (oError) {
              console.error("Editar Rol (error)", oError);
            },
          });
        },

        onAsignarPerfil: async function (oEvent) {
          const dialog = "AsignarPerfil";
          const oBindingContext = oEvent
            .getSource()
            .getBindingContext("oDataRoles");
          const id = oBindingContext.getProperty("Id");
          oLocal.setProperty("/IdRol", id);

          const data = {
            IsOpcion: "L",
            IsRol: `${id}`,
            perfil_perfiles_nav: [],
            perfil_perfiles_e_nav: [],
            perfil_mensajes_nav: [],
          };

          const oModel = new JSONModel();
          const oService = this.manager.getService("ADMIN");
          const uri =
            "/PerfilSet?/$expand=perfil_perfiles_nav," +
            "perfil_mensajes_nav," +
            "perfil_perfiles_e_nav";

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              // console.log("Asignar Perfiles (success)", oData); //+@ES
              oModel.setData(oData);
              this.displayPopup(dialog);
            }.bind(this),
            error: function (oError) {
              console.error("Asignar Perfiles (error)", oError); //+@ES
            },
          });

          this.getView().setModel(oModel, "oDataPerfiles");
        },

        onSaveAsignarPerfiles: function (oEvent) {
          const dialog = "dialogAsignarPerfil";
          const id = oLocal.getProperty("/IdRol");
          let data = {
            IsOpcion: "M",
            IsRol: `${id}`,
            perfil_perfiles_nav: [],
            perfil_perfiles_e_nav: [],
            perfil_mensajes_nav: [],
          };

          const items = this.byId("listPerfiles").getItems();

          items.map((item) => {
            let sKey = item.getCustomData()[0]?.getProperty("key");
            // let sActive = item.mProperties.selected ? "X" : "";
            if (sKey) {
              data.perfil_perfiles_nav.push({
                IdModulo: sKey,
                Active: item.mProperties.selected, //sActive,
                Grupo: "",
              });
            }
          });

          if (data.perfil_perfiles_nav.length > 0) {
            this.actualizaPerfiles(data, dialog);
          }
        },

        actualizaPerfiles: async function (data, dialog) {
          const oService = this.manager.getService("ADMIN");
          const uri =
            "/PerfilSet?/$expand=perfil_perfiles_nav," +
            "perfil_mensajes_nav," +
            "perfil_perfiles_e_nav";

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              // console.log("Actualizar Perfiles (success)", oData);
              this.manager.msgResult(oResponse);
              this.onCloseDialog(null, dialog);
            }.bind(this),
            error: function (oError) {
              console.error("Actualizar Perfiles (error)"); //+@ES
            },
          });
        },

        onEliminarRol: function (oEvent) {
          const oBindingContext = oEvent
            .getSource()
            .getBindingContext("oDataRoles");
          const id = oBindingContext.getProperty("Id");

          MessageBox.warning(i18n.getText("MsgROConfEliminarRol"), {
            title: i18n.getText("EliminarRol"),
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: function (sAction) {
              if (sAction === MessageBox.Action.OK) {
                this.deleteRol(id);
              }
            }.bind(this),
            dependentOn: this.getView(),
          });
        },

        deleteRol: function (id) {
          const oService = this.manager.getService("ADMIN");
          const uri = `/RolesSet(Id=${id},Sociedad='${this.manager.getBukrs()}')`;

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.remove(uri, {
            method: "DELETE",
            success: function (oData, oResponse) {
              // console.log("Elminar Success (error):", oData);
              if (this.manager.msgResult(oResponse)) {
                this.onRefreshTable();
              }
            }.bind(this),
            error: function (oError) {
              console.error("Eliminar Roles (error):", oError);
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

        // #region PAGINATION

        onFirstPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let page = 1;
          let indice = 0;
          this.getRoles(cantFilas, indice, page);
        },

        onPreviousPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          if (indice >= cantFilas) {
            indice = indice - cantFilas;
            page -= 1;
            oLocal.setProperty("/page/Page", page);
            this.getRoles(cantFilas, indice, page);
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
            this.getRoles(cantFilas, indice, page);
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

          this.getRoles(cantFilas, indice, page);
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
