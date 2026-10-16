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
    var path = "com.axelera.pe.gestioncomercial.view.m1-admin.usuarios";
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.m1-admin.Usuarios",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("AD01", "Clear", this.onInitUsuarios, this);

          const isMobile = this.manager.isMobile();

          this.getView().setModel(oLocal, "localMobile");

          oLocal.setData({
            isMobile: this.manager.isMobile()
          });
        },



        onInitUsuarios: function (channel, event, oData) {
          this.initialization(oData.active);
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            this.callCountUsuarios();
            this.manager.setBusy(false);
          }
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            IdUsuario: "",
            Nombre: "",
            Apepat: "",
            Apemat: "",
            Correo: "",
            Usuario: "",
            Idrol: 0,
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

        setUsuario: function (data) {
          if (data) {
            oLocal.setProperty("/IdUsuario", data.Id);
            oLocal.setProperty("/Nombre", data.Nombre);
            oLocal.setProperty("/Apepat", data.Apepat);
            oLocal.setProperty("/Apemat", data.Apemat);
            oLocal.setProperty("/Correo", data.Correo);
            oLocal.setProperty("/Usuario", data.Usuario);
            oLocal.setProperty("/Idrol", data.Idrol);
          } else {
            oLocal.setProperty("/IdUsuario", "");
            oLocal.setProperty("/Nombre", "");
            oLocal.setProperty("/Apepat", "");
            oLocal.setProperty("/Apemat", "");
            oLocal.setProperty("/Correo", "");
            oLocal.setProperty("/Usuario", "");
            oLocal.setProperty("/Idrol", 0);
          }
        },

        onRefreshTable: function () {
          this.callCountUsuarios();
        },

        callCountUsuarios: function ( indBusqueda = "" ) {
          const oService = this.manager.getService("ADMIN");
          const uri = "/UsuariosSet/$count";

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
              // console.log("Count Usuarios (success)", oData);
              this.manager.setBusy(false);
              if (oResponse.body) {
                oLocal.setProperty(
                  "/page/TotalItems",
                  parseInt(oResponse.body)
                );
                this.getUsuarios(cantFilas, indice, page);
              } else {
                oLocal.setProperty("/loadingTbl", false);
              }
            }.bind(this),
            error: function (oError) {
              console.error("Count Usuarios (error)", oError);
              oLocal.setProperty("/loadingTbl", false);
              this.manager.setBusy(false);
            }.bind(this),
          });
        },

        getUsuario: async function (id, dialog) {
          const oService = this.manager.getService("ADMIN");
          const uri = `/UsuariosSet(Id=${id},Sociedad='${this.manager.getBukrs()}')`;

          oService.read(uri, {
            success: function (oData, oResponse) {
              this.setUsuario(oData);
              this.displayPopup(dialog);
            }.bind(this),
            error: function (oError) {
              oLocal.setProperty("/loadingTbl", false);
              console.error("Roles (error)", oError);
            },
          });
        },

        getUsuarios: async function (top, skip, page) {
          const totalItems = oLocal.getProperty("/page/TotalItems");
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          const totalPages = Math.ceil(totalItems / cantFilas);

          oLocal.setProperty("/page/TotalPages", totalPages);
          oLocal.setProperty("/page/Page", page);
          oLocal.setProperty("/page/Indice", skip);

          const oModel = new JSONModel();
          const oService = this.manager.getService("ADMIN");
          const uri = "/UsuariosSet";
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
              // console.log("Listar Usuarios (success)", oData)
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
              console.error("Listar Usuarios (error)", oError);
              oLocal.setProperty("/loadingTbl", false);
            },
          });

          this.getView().setModel(oModel, "oDataUsuarios");
        },

        getRoles: async function () {
          const oModelRoles = new JSONModel();
          const oService = this.manager.getService("ADMIN");

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.read("/RolesSet", {
            success: function (oData, oResponse) {
              // console.log("Listar Roles (success)", oData)
              const dataRoles = oData.results.filter((item) => {
                return item.Estado == true;
              });
              // console.log(dataRoles);
              dataRoles.unshift({ Id: 0, Nombre: "" });
              oModelRoles.setData(dataRoles);
            }.bind(this),
            error: function (oError) {
              console.error("Listar Roles (error)", oError);
            },
          });

          this.getView().setModel(oModelRoles, "oDataRoles");
        },

        setFilters: function (sQuery) {
          const aFilters = [];
          sQuery = sQuery.toUpperCase();

          if (typeof sQuery == "string" && sQuery.length > 0) {
            aFilters.push(
              new Filter(
                [
                  new Filter("Nombre", FilterOperator.Contains, sQuery),
                  new Filter("Apepat", FilterOperator.Contains, sQuery),
                  new Filter("Apemat", FilterOperator.Contains, sQuery),
                  new Filter("Usuario", FilterOperator.Contains, sQuery),
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
          this.callCountUsuarios("X");
        },

        onCloseDialog: function (oEvent, dialog) {
          if (dialog?.length > 0) {
            this.byId(dialog).destroy();
          }
        },

        onCrearUsuario: function () {
          this.getRoles();
          this.setUsuario(null);
          this.displayPopup("CrearUsuario");
        },

        onSaveCrearUsuario: function () {
          const oView = this.getView();
          const data = {
            Nombre: oLocal.getProperty("/Nombre"),
            Apepat: oLocal.getProperty("/Apepat"),
            Apemat: oLocal.getProperty("/Apemat"),
            Usuario: oLocal.getProperty("/Usuario"),
            Clave: "",
            Correo: oLocal.getProperty("/Correo"),
            Fechacreacion: null,
            Estado: true,
            Idrol: Number(oLocal.getProperty("/Idrol")),
            Tokenauth: "",
            Estadoclave: "",
            Orgventas: "",
            Tokendevice: "",
            Rol: "",
          };

          let error = false;

          const oSelectRol = oView.byId("selRolCR");
          if (data.Idrol == 0 && oSelectRol.getRequired()) {
            oSelectRol.setValueState("Error");
            oSelectRol.setValueStateText(i18n.getText("MsgValCampo"));
            error = true;
          }

          const aInputs = [
            oView.byId("txtNombreCR"),
            oView.byId("txtApepatCR"),
            oView.byId("txtCorreoCR"),
            oView.byId("txtUsuarioCR"),
          ];

          // Iterar sobre los inputs para verificar si hay errores
          aInputs.forEach(function (oInput) {
            const sValue = oInput.getValue();
            const sValueState = oInput.getValueState();

            if (
              typeof sValue == "string" &&
              sValue.length == 0 &&
              oInput.getRequired()
            ) {
              oInput.setValueState("Error");
              oInput.setValueStateText(i18n.getText("MsgValCampo"));
              error = true;
            } else if (sValueState === "Error") {
              error = true;
            }
          });

          if (error) {
            // MessageToast.show(i18n.getText("MsgErrorForm"));
            MessageBox.error(i18n.getText("MsgErrorForm"));
          } else {
            this.crearUsuario(data);
          }
        },

        crearUsuario: async function (data) {
          const oService = this.manager.getService("ADMIN");
          const uri = "/UsuariosSet";
          
          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.create(uri, data, {
            success: function (oData, oResponse) {
              // console.log('Crear Usuario (success)', oData);
              if (this.manager.msgResult(oResponse)) {
                this.onRefreshTable();
              }
              this.onCloseDialog(null, "dialogCrearUsuario");
            }.bind(this),
            error: function (oError) {
              console.error("Crear Usuario (error)", oError);
            },
          });
        },

        onChangeInput: function (oEvent) {
          const oInput = oEvent.getSource();
          const sValue = oInput.getValue();

          if (!sValue) {
            oInput.setValueState("Error");
            // oInput.setValueStateText("El nombre es obligatorio.");
          } else {
            oInput.setValueState("None");
          }
        },

        onChangeRol: function (oEvent) {
          const oSelect = oEvent.getSource();
          const sValue = oSelect.getSelectedKey();

          if (!sValue || sValue == 0) {
            oSelect.setValueState("Error");
            // oSelect.setValueStateText("El nombre es obligatorio.");
          } else {
            oSelect.setValueState("None");
          }
        },

        onChangeCorreo: function (oEvent) {
          const oInput = oEvent.getSource();
          const sValue = oInput.getValue();
          const rexMail = /^\w+[\w-+.]*@\w+([-.]\w+)*\.[a-zA-Z]{2,}$/;

          if (!sValue.match(rexMail)) {
            oInput.setValueState("Error");
            oInput.setValueStateText(i18n.getText("CorreoInvalido"));
          } else {
            oInput.setValueState("None");
          }
        },

        onEditarUsuario: function (oEvent) {
          const bindingContext = oEvent
            .getSource()
            .getBindingContext("oDataUsuarios");
          const id = bindingContext.getProperty("Id");

          this.getRoles();
          this.getUsuario(id, "EditarUsuario");
        },

        onSaveEditarUsuario: function (oEvent) {
          const id = oLocal.getProperty("/IdUsuario");
          const oView = this.getView();
          const data = {
            Nombre: oLocal.getProperty("/Nombre"),
            Apepat: oLocal.getProperty("/Apepat"),
            Apemat: oLocal.getProperty("/Apemat"),
            Usuario: oLocal.getProperty("/Usuario"),
            Clave: "",
            Correo: oLocal.getProperty("/Correo"),
            Fechacreacion: null,
            Estado: true,
            Idrol: Number(oLocal.getProperty("/Idrol")), // 0,
            Tokenauth: "",
            Estadoclave: "",
            Orgventas: "",
            Tokendevice: "",
            Rol: "",
          };

          let error = false;

          const oSelectRol = oView.byId("selRolED");
          if (data.Idrol == 0 && oSelectRol.getRequired()) {
            oSelectRol.setValueState("Error");
            oSelectRol.setValueStateText(i18n.getText("MsgValCampo"));
            error = true;
          }

          const aInputs = [
            oView.byId("txtNombreED"),
            oView.byId("txtApepatED"),
            oView.byId("txtCorreoED"),
            oView.byId("txtUsuarioED"),
          ];

          // Iterar sobre los inputs para verificar si hay errores
          aInputs.forEach(function (oInput) {
            const sValue = oInput.getValue();
            const sValueState = oInput.getValueState();

            if (
              typeof sValue == "string" &&
              sValue.length == 0 &&
              oInput.getRequired()
            ) {
              oInput.setValueState("Error");
              oInput.setValueStateText(i18n.getText("MsgValCampo"));
              error = true;
            } else if (sValueState === "Error") {
              error = true;
            }
          });

          if (error) {
            // MessageToast.show(i18n.getText("MsgErrorForm"));
            MessageBox.error(i18n.getText("MsgErrorForm"));
          } else {
            this.editarUsuario(id, data, "dialogEditarUsuario");
          }
        },

        onSwitchEstado: function (oEvent) {
          const bindingContext = oEvent
            .getSource()
            .getBindingContext("oDataUsuarios");
          const id = bindingContext.getProperty("Id");
          let estado = false;

          if (oEvent.mParameters.state) {
            estado = true;
          }

          this.manager.cambiarEstado(this, "USUARIOS", id.toString(), estado);
        },

        editarUsuario: async function (id, data, dialog) {
          const oService = this.manager.getService("ADMIN");
          const uri = `/UsuariosSet(Id=${id},Sociedad='${this.manager.getBukrs()}')`;

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.update(uri, data, {
            method: "PUT",
            success: function (oData, oResponse) {
              // console.log("Editar Usuario (success)", oData);
              this.onCloseDialog(null, dialog);
              if (this.manager.msgResult(oResponse)) {
                this.onRefreshTable();
              }
            }.bind(this),
            error: function (oError) {
              console.error("Editar Usuario (error)", oError);
            },
          });
        },

        onEliminarUsuario: function (oEvent) {
          const bindingContext = oEvent
            .getSource()
            .getBindingContext("oDataUsuarios");
          const id = bindingContext.getProperty("Id");

          MessageBox.warning(i18n.getText("MsgUSConfEliminarUsu"), {
            title: i18n.getText("EliminarUsu"),
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: function (sAction) {
              if (sAction === MessageBox.Action.OK) {
                this.deleteUsuario(id);
              }
            }.bind(this),
            dependentOn: this.getView(),
          });
        },

        deleteUsuario: async function (id) {
          const oService = this.manager.getService("ADMIN");
          const uri = `/UsuariosSet(Id=${id},Sociedad='${this.manager.getBukrs()}')`;

          oService.setHeaders({ 
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });
          
          oService.remove(uri, {
            method: "DELETE",
            success: function (oData, oResponse) {
              // console.log("Eliminar Usuario (success)", oData);
              // console.log("oResponse DELETE", oResponse);
              if (this.manager.msgResult(oResponse)) {
                this.onRefreshTable();
              }
            }.bind(this),
            error: function (oError) {
              console.error("Eliminar Usuario (error)", oError);
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
          this.getUsuarios(cantFilas, indice, page);
        },

        onPreviousPress: function () {
          const cantFilas = oLocal.getProperty("/page/CantFilas");
          let indice = oLocal.getProperty("/page/Indice");
          let page = oLocal.getProperty("/page/Page");

          if (indice >= cantFilas) {
            indice = indice - cantFilas;
            page -= 1;
            oLocal.setProperty("/page/Page", page);
            this.getUsuarios(cantFilas, indice, page);
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
            this.getUsuarios(cantFilas, indice, page);
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

          this.getUsuarios(cantFilas, indice, page);
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
