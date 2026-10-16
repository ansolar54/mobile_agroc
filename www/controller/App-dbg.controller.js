sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "../model/Manager",
  ],
  function (Controller, JSONModel, MessageToast, Manager) {
    "use strict";

    var oLocal = new JSONModel();

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.App",
      {
        manager: Manager,

        onInit: function () {
          this.initialization();
          sessionStorage.setItem("pagina", ""); // @dev-jrosales
        },

        initialization: function () {
          this.getView().setModel(oLocal, "local");
          oLocal.setData({ ImgBackground: "" });

          const mobile = /Mobi|Android/i.test(navigator.userAgent);
          this.manager.setMobile(mobile);
          mobile ? this.GoToMobile() : this.GoToDesktop();
          // const valor = /Mobi|Android/i.test(navigator.userAgent);
          // sessionStorage.setItem("mobile", JSON.stringify(valor));
          // const mobile = JSON.parse(sessionStorage.getItem("mobile"));
        },

        GoToDesktop: function () {
          let usuario = "";

          try {
            usuario = sap.ushell.Container?.getUser().getId();
            // usuario = usuario ? usuario : "AXELERA";
            // usuario = usuario ? usuario : "AXELERA_1";
            // usuario = usuario ? usuario : "MGONZALEZ";
            // usuario = usuario ? usuario : "GGERONIMO";
            // usuario = usuario ? usuario : "GNIERI";
            usuario = usuario ? usuario : "AMENDOZA";
            // usuario = usuario ? usuario : "GIF_AMENDOZA";
            // usuario = usuario ? usuario : "JASARMIENTO";
            // usuario = usuario ? usuario : "T_FRX_19";
            // // usuario = usuario ? usuario : "T_FRM_19";
            sessionStorage.setItem("usuario", usuario);
          } catch (error) {
            console.error("Inicio Desktop", error);
            return;
          }

          // evita repetir ese registro cuando recarga de la página.
          if (this.manager.hasValidarUsuarioSession(usuario)) {
            this.navToMain();
            return;
          }

          this.callValidarUsuario(usuario);

          // const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          // oRouter.navTo("RouteMain", {}, true);
        },

        GoToMobile: function () {
          oLocal.setProperty("/ImgBackground", this.manager.getImgBackground());

          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteLogin", {}, true);
        },

        callValidarUsuario: async function (usuario) {
          const oService = this.manager.getService("ADMIN");

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": usuario,
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          await oService.read("/ValidarUsuario", {
            method: "GET",
            success: function (oData, oResponse) {
              const error = oData.ValidarUsuario.Error;
              if (error == "X") {
                MessageToast.show(oData.ValidarUsuario.Mensaje);
                return;
              }

              this.manager.setValidarUsuarioSession(usuario);

              const urlTheme = this.getThemeFromURL();
              const userTheme = oData.ValidarUsuario.Tema;
              this.checkTheme(urlTheme, userTheme);

            }.bind(this),
            error: function (oError) {
              console.error("DatosUsuario (error)", oError);
            },
          });
        },

        navToMain: function () {
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteMain", {}, true);
        },

        checkTheme: function (urlTheme, userTheme) {

          if (urlTheme == "localhost") {
            this.navToMain();
            return;
          }

          if (urlTheme == userTheme) {
            if (urlTheme.length == 0) {
              this.setThemeWeb("", true, true);
            } else {
              this.navToMain();
            }
          } else if (userTheme.length > 0 && urlTheme.length == 0) {
            this.setThemeWeb(userTheme, true, false);
          } else if (urlTheme.length > 0 && userTheme.length == 0) {
            this.setThemeWeb(urlTheme, false, true);
          } else {
            this.setThemeWeb(userTheme, true, false);
          }

        },

        getThemeFromURL: function () {
          const complete_url = window.location.href;
          let theme = "";

          if (complete_url.includes("gc_farmex_light")) {
            theme = "gc_farmex_light";
          } else if (complete_url.includes("gc_farmex_dark")) {
            theme = "gc_farmex_dark";
          } else if (complete_url.includes("localhost")) {
            theme = "localhost";
          }

          return theme;
        },

        setThemeWeb: function (theme, reload, save) {
          const complete_url = window.location.href;
          let complete_url_aux = "";
          let new_url = "", new_theme = "";

          if (theme.length == 0) {
            new_theme = "gc_farmex_light"
            new_url = complete_url.replace("&sap-language=ES", `&sap-language=ES&sap-theme=${new_theme}`);
          } else {
            new_theme = theme;
            complete_url_aux = complete_url;
            complete_url_aux = complete_url_aux.replaceAll("&sap-theme=gc_farmex_light", "");
            complete_url_aux = complete_url_aux.replaceAll("&sap-theme=gc_farmex_dark", "");
            new_url = complete_url_aux.replace("&sap-language=ES", `&sap-language=ES&sap-theme=${new_theme}`);
          }

          if (save) {
            this.manager.cambiarTema(this, new_theme);
          }

          if (reload) {
            sap.m.URLHelper.redirect(new_url);
          }

        },

        // getThemeFromURL: function (tema) {
        //   const complete_url = window.location.href;
        //   let temaUrl = "";

        //   if (complete_url.includes("gc_farmex_light")) {
        //     temaUrl = "gc_farmex_light";
        //   } else if (complete_url.includes("gc_farmex_dark")) {
        //     temaUrl = "gc_farmex_dark";
        //   } else if (complete_url.includes("localhost")) {
        //     temaUrl = "";
        //     return true;
        //   } else {
        //     return false;
        //   }

        //   if (tema == temaUrl) {
        //     return true;
        //   } else {
        //     return false;
        //   }
        // },

        // setThemeWeb: function (user_theme) {
        //   const complete_url = window.location.href;
        //   let complete_url_aux = "";
        //   let new_url = "", new_theme = "";
        //   if (user_theme.length == 0 || user_theme == undefined) {
        //     new_theme = "gc_farmex_light";
        //     new_url = complete_url.replace("&sap-language=ES",`&sap-language=ES&sap-theme=${new_theme}`);  
        //     this.manager.cambiarTema(this, new_theme);
        //   } else {
        //     complete_url_aux = complete_url;
        //     complete_url_aux = complete_url_aux.replaceAll("&sap-theme=gc_farmex_light","");
        //     complete_url_aux = complete_url_aux.replaceAll("&sap-theme=gc_farmex_dark","");
        //     new_url = complete_url_aux.replace("&sap-language=ES",`&sap-language=ES&sap-theme=${user_theme}`);
        //   }

        //   sap.m.URLHelper.redirect( new_url );
        // },

      }
    );
  }
);
