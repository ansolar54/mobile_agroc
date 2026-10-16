sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../../model/Manager",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageBox, MessageToast, Manager) {
    "use strict";

    var oLocal = new JSONModel();
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.auth.Login",
      {
        manager: Manager,

        onInit: function () {
          // const oEventBus = sap.ui.getCore().getEventBus();
          // oEventBus.subscribe("Login", "Clear", this.onInitLogin, this);
          // +@JR - ACTIVACION DE ORIENTACION PORTRAIT DE PANTALLA PARA LOGIN EN MOBILE
          if (this.manager.isMobile()) {
            // console.log('Orientation is ' + screen.orientation.type);
            screen.orientation.lock('portrait');
          }
          this.initialLocal();
        },

        // onInitLogin: function (channel, event, oData) {
        //   this.initialization(oData.active);
        // },

        initialization: function (active) {
          this.initialLocal();
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);

          oLocal.setData({
            Usuario: "",
            Clave: "",
            Idioma: "ES",
            ImgLogo: this.manager.getImgLogo(),
            IsShowEye: true,
          });
        },

        onLoginPress: async function () {
          const usuario = oLocal.getProperty("/Usuario");
          const clave = oLocal.getProperty("/Clave");

          if (usuario.length == 0) {
            MessageToast.show(i18n.getText("MsgLoginValUsu"));
            return;
          } else if (clave.length == 0) {
            MessageToast.show(i18n.getText("MsgLoginValPass"));
            return;
          }

          const idioma = oLocal.getProperty("/Idioma");
          // sessionStorage.setItem("idioma", idioma);
          sap.ui.getCore().getConfiguration().setLanguage(idioma.toLowerCase());

          sessionStorage.setItem("usuario", usuario.toUpperCase());
          sessionStorage.setItem("clave", clave);
          // await this.getToken(usuario, clave);

          // this.callGetDatosUsuario(usuario.toUpperCase()); //-@ES20250324
          this.callValidarUsuario(usuario.toUpperCase());                          //+@ES20250324
        },

        callValidarUsuario: async function (usuario) {
          const oService = this.manager.getService("ADMIN");

          this.manager.isMobile() && SpinnerDialog.show();

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": usuario,
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          await oService.read("/ValidarUsuario", {
            method: "GET",
            success: function (oData, oResponse) {
              if (oData?.ValidarUsuario?.Error !== "X") {
                this.manager.setValidarUsuarioSession(usuario);
              }
              this.setThemeMobile(oData.ValidarUsuario.Tema); //+

              // this.compareDeviceTokens(oData.ValidarUsuario); //-@20260522
              this.navToMain();
              this.manager.isMobile() && SpinnerDialog.hide();

            }.bind(this),
            error: function (oError) {
              this.manager.isMobile() && SpinnerDialog.hide();
              console.error("DatosUsuario (error)", oError);
              if (oError?.response.statusCode === 401) {
                MessageToast.show(i18n.getText("MsgLoginError"));
              }
            }.bind(this),
          });
        },

        setThemeMobile: function (tema) {
          const body = document.body;
          let darkMode = false;
          let new_tema = "";

          if (tema == "gc_farmex_light") {
            darkMode = false;
          } else if (tema == "gc_farmex_dark") {
            darkMode = true;
          } else {
            darkMode = false;
            new_tema = "gc_farmex_light";
            this.manager.cambiarTema(this, new_tema);
          }

          if (darkMode) {
            body.classList.add("dark-theme"); // Asignar modo oscuro
          } else {
            body.classList.remove("dark-theme"); // Remover modo oscuro
          }

        },

        //{-@20260522
        // compareDeviceTokens: function (datosUsuario) {
        //   const tokenInStorage = sessionStorage.getItem("tokenFirebase");
        //   tokenInStorage === datosUsuario.Tokendevice
        //     ? true
        //     : this.callUpdateToken(Number(datosUsuario.Id), tokenInStorage);
        // },

        // callUpdateToken: function (idUsuario, tokenInStorage) {
        //   const oService = this.manager.getService("ADMIN");

        //   const data = {
        //     Id: idUsuario,
        //     Tokendevice: `${tokenInStorage}`,
        //   };

        //   oService.setHeaders({ 
        //     "X-Requested-With": "X",
        //     "usuario": this.manager.getUser(),
        //     "sociedad": this.manager.getBukrs(),
        //   });

        //   oService.update(`/UsuariosSet(${idUsuario})`, data, {
        //     method: "PUT",
        //     success: function (oData, oResponse) {
        //       console.log("USUARIO SET SUCCESS", oData);
        //     }.bind(this),
        //     error: function (oError) {
        //       this.manager.isMobile() && SpinnerDialog.hide();
        //       console.error("SetUsuario (error)", oError);
        //     },
        //   });
        // },
        //}-@20260522

        // getToken: async function (usuario, clave) {
        //   const oModel = new JSONModel();
        //   const url = this.manager.getUrlAdmin() + "/TipoCambioValue";

        //   // const { oData, oResponse, oError } = await this.manager.readMob(url);
        //   // if (oData || oResponse) {
        //   //   console.log(oData, oResponse);
        //   // } else if (oError) {
        //   // }

        //   try {
        //     const response = await fetch(url, {
        //       method: "GET",
        //       headers: this.manager.headersFetch(usuario, clave),
        //     });

        //     if (response.ok) {
        //       const token = response.headers.get("x-csrf-token");
        //       sessionStorage.setItem("token", token);

        //       var sCurrentLocale = sap.ui
        //         .getCore()
        //         .getConfiguration()
        //         .getLanguage();
        //       console.log(sCurrentLocale);

        //       const oData = await response.json();
        //       oModel.setData(oData.d);

        //       const valor = oModel.getProperty("/TipoCambioValue/Valor");
        //       sessionStorage.setItem("tipo-cambio", valor.trim());

        //       this.navToMain();
        //     } else {
        //       const error = response.text();
        //       console.error("Tipo Cambio (error)", error);
        //     }
        //   } catch (error) {
        //     console.error("Error:", error);
        //   }
        // },

        navToMain: function () {
          this.initialLocal();

          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteMain", {}, true);
        },

        onShowPassword: function () {
          oLocal.setProperty("/IsShowEye", !oLocal.getProperty("/IsShowEye"));
        }
      }
    );
  }
);
