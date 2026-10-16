sap.ui.define(
  [
    "sap/ui/Device",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Popover",
    "sap/m/Button",
    "sap/m/BusyDialog",
    "sap/m/library",
    "../model/Formatter",
    "../model/Manager",
    "sap/ui/core/Fragment"
  ],
  function (
    Device,
    Controller,
    JSONModel,
    Popover,
    Button,
    BusyDialog,
    library,
    Formatter,
    Manager,
    Fragment
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var i18n = null;
    var oMyAvatar, _oPopover;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.Main",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("onUnexpandMenu", this.onNavBtnUnexpand, this);
          this.initialization();
          this.oMyAvatar = this.getView().byId("myAvatar");
          // this.oMyAvatar = this.oView.byId("myAvatar");

          this._oPopover = Fragment.load({
            id: this.oView.getId(),
            name: "com.axelera.pe.gestioncomercial.view.Popover",
            controller: this
          }).then(function (oPopover) {
            this.oView.addDependent(oPopover);
            this._oPopover = oPopover;
          }.bind(this));

          this.onHideHeader();
        },

        onHideHeader: function () {
          const oRenderer = sap.ushell?.Container?.getRenderer("fiori2");
          if (oRenderer) {
            oRenderer.setHeaderVisibility(false);
          }
        },

        onAfterRendering: function () {
          this.initialization();
          // contraer menu lateral en mobile cuando se hace touch fuera
          if (this.manager.isMobile()) {
            const oView = this.getView();
            const oMenu = oView.byId("sideNavigation"); // tu ID del menú lateral

            // Agregamos un listener global
            document.addEventListener("touchstart", function (event) {
              const oMenuDomRef = oMenu.getDomRef();
              const oToggleButtonDomRef = oView.byId("sideNavigationToggleButton").getDomRef(); // ID de tu botón
              if (oMenu.getExpanded()) { // solo si el menú está expandido

                const bTouchInsideMenu = oMenuDomRef && oMenuDomRef.contains(event.target);
                const bTouchOnButton = oToggleButtonDomRef && oToggleButtonDomRef.contains(event.target);

                // if (oMenuDomRef && !oMenuDomRef.contains(event.target)) {
                if (!bTouchInsideMenu && !bTouchOnButton) {
                  // El toque fue FUERA del menú
                  oMenu.setExpanded(false); // Colapsar el menú
                  const oToolPage = this.byId("toolPage");
                  oToolPage.setSideExpanded(false);
                }
              }
            }.bind(this));
          }

        },

        initialization: function () {
          this.initialLocal();
          this.manager.isMobile()
            ? oLocal.setProperty("/CerrarSesion", true)
            : oLocal.setProperty("/CerrarSesion", false);
          this.callGetDatosUsuario();
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);
          this.getView().byId("switchTheme").addStyleClass("bgSwitchTheme"); //+@ES20250319
          // console.log(localStorage.getItem("theme"));
          oLocal.setData({
            Pagina: "",
            FechaActual: this.formatter.fecha(new Date()),
            TipoCambio: "",
            CerrarSesion: false,
            IsMobile: this.manager.isMobile(), //+@dev-jrosales
            Title: this.manager.getTitle(this), //+@
            Usuario: sessionStorage.getItem("usuario"), //+@dev-jrosales
            // IsDarkMode: localStorage.getItem("theme") === "light", //+@dev-jrosales
            IsDarkMode: this.getThemeMob(), //+@dev-jrosales
            IsLightTheme: this.getTheme(),
            // MsgTheme: this.getMsgTheme(),
          });
        },

        // getMsgTheme: function () {
        //   const complete_url = window.location.href;
        //   let mensaje = "";

        //   if (complete_url.includes("gc_farmex_light")) {
        //     mensaje = i18n.getText("MsgChangeDark");
        //   } else if (complete_url.includes("gc_farmex_dark")) {
        //     mensaje = i18n.getText("MsgChangeLight");
        //   }

        //   return mensaje;
        // },

        getTheme: function () {
          const complete_url = window.location.href;
          let isLightTheme = false;

          if (complete_url.includes("gc_farmex_light")) {
            isLightTheme = true;
          } else if (complete_url.includes("gc_farmex_dark")) {
            isLightTheme = false;
          } else {
            isLightTheme = true;
          }

          return isLightTheme;
        },

        getThemeMob: function () {
          const isDark = document.body.classList.contains("dark-theme");
          if (isDark) {
            return true;
          } else {
            return false;
          }
        },

        // onChangeTheme: function () {
        //   console.log("Cambio de tema ejecutado");

        //   const complete_url = window.location.href;
        //   let new_url = "", new_theme = "";

        //   if (complete_url.includes("gc_farmex_light")) {
        //     new_theme = "gc_farmex_dark";
        //     new_url = complete_url.replace("gc_farmex_light", new_theme);
        //   } else if (complete_url.includes("gc_farmex_dark")) {
        //     new_theme = "gc_farmex_light";
        //     new_url = complete_url.replace("gc_farmex_dark", new_theme);
        //   } else {
        //     return;
        //   }

        //   this.manager.cambiarTema(this, new_theme);
        //   sap.m.URLHelper.redirect( new_url );
        // },

        onChangeTheme: function () {
          const body = document.body;
          const isDark = body.classList.contains("dark-theme");
          let newTheme = "";

          if (isDark) {
            body.classList.remove("dark-theme");
            newTheme = "gc_farmex_light";
          } else {
            body.classList.add("dark-theme");
            newTheme = "gc_farmex_dark";
          }

          // Guardar en backend
          this.manager.cambiarTema(this, newTheme);
        },

        onNavigate: function () {
          // let pagina = oLocal.getProperty("/Pagina");
          const pagina = sessionStorage.getItem("pagina");
          this.manager.initPage(this, pagina, true);
        },

        // onNavFinished: function () {
        //   // let pagina = oLocal.getProperty("/Pagina");
        //   const pagina = sessionStorage.getItem("pagina");
        //   this.manager.initPage(this, pagina, true);
        // },

        //{-@20260513
        // callGetTipoCambio: function () {
        //   const oService = this.manager.getService("ADMIN");

        //   oService.read("/TipoCambioValue", {
        //     method: "GET",
        //     success: function (oData, oResponse) {
        //       // console.log("TipoCambio (success)", oData);
        //       oLocal.setProperty("/TipoCambio", oData?.TipoCambioValue.Valor);
        //     }.bind(this),
        //     error: function (oError) {
        //       console.error("TipoCambio (error)", oError);
        //     },
        //   });
        // },
        //}-@20260513

        callGetDatosUsuario: function () {
          const oService = this.manager.getService("ADMIN");

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.create("/DatosUsuario", null, {
            method: "POST",
            urlParameters: {
              Usuario: `'${this.manager.getUser()}'`,
            },
            success: function (oData, oResponse) {
              // console.log("DatosUsuario (success)", oData.DatosUsuario.Id);
              // sessionStorage.setItem("sociedad", oData.DatosUsuario.Sociedad); //+@20260213 //-@20260520
              sessionStorage.setItem("id-usuario", oData.DatosUsuario.Id);
              sessionStorage.setItem("usuario", oData.DatosUsuario.Usuario); // +@JR
              sessionStorage.setItem("ofi-ventas", oData.DatosUsuario.Vkbur); // +@ES
              sessionStorage.setItem("id-rol", oData.DatosUsuario.Idrol); // +@ES
              sessionStorage.setItem("puesto", oData.DatosUsuario.Puesto); // +@ES20250310

              oLocal.setProperty("/TipoCambio", oData.DatosUsuario.TipoCambio); //+@20260513

              this.manager.setLogSession(); //+@20250827
              this.getPerfilesUsu();

              if (this.manager.isMobile()) {
                // +@JR - DESACTIVACION DE ORIENTACION PORTRAIT DE PANTALLA PARA PODER ROTAR
                screen.orientation.unlock();
                //{+@20260522
                // Lógica Token
                this.compareDeviceTokens(oData.DatosUsuario);
                //}+@20260522
              } 
              //else {
              //  this.compareDeviceTokens(oData.DatosUsuario);
              //}

            }.bind(this),
            error: function (oError) {
              console.error("DatosUsuario (error)", oError);
            },
          });
        },

        //{+@20260522
        compareDeviceTokens: function (datosUsuario) {
          const tokenInStorage = sessionStorage.getItem("tokenFirebase");
          tokenInStorage === datosUsuario.Tokendevice
            ? true
            : this.callUpdateToken(Number(datosUsuario.Id), tokenInStorage);
        },

        callUpdateToken: function (idUsuario, tokenInStorage) {
          const oService = this.manager.getService("ADMIN");

          const data = {
            Id: idUsuario,
            Tokendevice: `${tokenInStorage}`,
          };

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
            "token": "X",
          });

          oService.update(`/UsuariosSet(Id=${idUsuario},Sociedad='${this.manager.getBukrs()}')`, data, {
            method: "PUT",
            success: function (oData, oResponse) {
              console.log("USUARIO SET SUCCESS", oData);
            }.bind(this),
            error: function (oError) {
              this.manager.isMobile() && SpinnerDialog.hide();
              console.error("SetUsuario (error)", oError);
            }.bind(this),
          });
        },
        //}+@20260522

        getPerfilesUsu: function () {
          const oService = this.manager.getService("ADMIN");
          const data = {
            IsOpcion: "P",
            IsRol: "",
            perfil_perfiles_nav: [],
            perfil_mensajes_nav: [],
            perfil_perfiles_e_nav: [],
          };

          const uri =
            "/PerfilSet?/$expand=perfil_perfiles_nav," +
            "perfil_mensajes_nav," +
            "perfil_perfiles_e_nav";

          this.manager.setBusy(true);

          oService.setHeaders({
            "X-Requested-With": "X",
            "usuario": this.manager.getUser(),
            "sociedad": this.manager.getBukrs(),
            "mobile": this.manager.getIndMobile(),
          });

          oService.create(uri, data, {
            method: "POST",
            success: function (oData, oResponse) {
              // console.log("Inicio Perfiles (success)", oData);
              this.manager.setBusy(false);
              // this.callGetTipoCambio(); //-@20260513
              this.cargarPaginas(oData.perfil_perfiles_e_nav);
            }.bind(this),
            error: function (oError) {
              console.error("Inicio Perfiles (error)");
              this.manager.setBusy(false);
            }.bind(this),
          });
        },

        cargarPaginas: function (perfil_perfiles_e_nav) {
          const mobile = this.manager.isMobile(); //+@ES20250324
          const oModel = new JSONModel();
          const aGrupo1 = [],
            aGrupo2 = [],
            aGrupo3 = [],
            aGrupo4 = [];

          const paginas = {
            selectedKey: "",
            navigation: [],
            navigationDB: [],
            fixedNavigation: [
              //   // {
              //   // 	title: "Acceso a NEXO",
              //   // 	icon: "sap-icon://chain-link",
              //   	// key: "importantLinks",
              //   // 	href: "https://my350505.crm.ondemand.com/sap/ap/ui/clogin?saml2=disabled&app.component=%2fSAP_UI_CT%2fMain%2froot.uiccwoc&rootWindow=X&redirectUrl=%2fsap%2fpublic%2fbyd%2fruntime&supressAutoLogon=true#"
              //   // }
              {
                // title: "Cerrar sesión",
                title: i18n.getText("CerrarSesion"),
                icon: "sap-icon://offsite-work",
                key: "Logout",
                visible: oLocal.getProperty("/CerrarSesion"),
                // href: "https://my350505.crm.ondemand.com/sap/ap/ui/clogin?saml2=disabled&app.component=%2fSAP_UI_CT%2fMain%2froot.uiccwoc&rootWindow=X&redirectUrl=%2fsap%2fpublic%2fbyd%2fruntime&supressAutoLogon=true#"
              },
            ],
          };

          if (perfil_perfiles_e_nav) {
            perfil_perfiles_e_nav.results.map((item) => {

              if (item.Active) {
                const oItem = {
                  title: item.NameModul,
                  key: item.IdModulo,
                  icon: item.Icono,
                };

                if (mobile) {
                  if (item.Mobile != "X") { return; }
                } else {
                  if (item.Web != "X") { return; }
                }

                switch (item.Grupo) {
                  case "1":
                    aGrupo1.push(oItem);
                    break;
                  case "2":
                    aGrupo2.push(oItem);
                    break;
                  case "3":
                    aGrupo3.push(oItem);
                    break;
                  case "4":
                    aGrupo4.push(oItem);
                    break;
                  default:
                    break;
                }
              }
            });

            // Agregar paginas
            paginas.navigation.push(
              {
                title: "Inicio",
                icon: "sap-icon://home",
                expanded: true,
                key: "Dashboard",
                items: [],
              },
              {
                // title: "Administración",
                title: i18n.getText("Grupo-1"),
                icon: "sap-icon://key-user-settings",
                expanded: false,
                // key: "Administración",
                key: i18n.getText("Grupo-1"),
                items: aGrupo1,
              },
              {
                title: i18n.getText("Grupo-4"),
                icon: "sap-icon://chart-table-view",
                expanded: false,
                key: i18n.getText("Grupo-4"),
                items: aGrupo4,
              },
              {
                // "title": "Cambio Precio",
                title: i18n.getText("Grupo-3"),
                icon: "sap-icon://credit-card",
                expanded: false,
                // "key": "statistics",
                key: i18n.getText("Grupo-3"),
                items: aGrupo3,
              },
              {
                // "title": "Reportes",
                title: i18n.getText("Grupo-2"),
                icon: "sap-icon://sap-box",
                expanded: false,
                // "key": "statistics",
                key: i18n.getText("Grupo-2"),
                items: aGrupo2,
              }
            );
          }

          // filtro de si el módulo tiene subitems
          paginas.navigation = paginas.navigation.filter((item) => {
            return item.items.length > 0 || item.key === "Dashboard";
          });

          paginas.navigationDB = paginas.navigation.filter((item) => {
            return item.items.length > 0;
          });

          oModel.setData(paginas);
          // const oModel = new JSONModel(sap.ui.require.toUrl("com/axelera/pe/gestioncomercial/model/sideContent.json"));
          this.getView().setModel(oModel);
          this.setToggleBtnTooltip(!Device.system.desktop);

          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe(
            "com.axelera.pe.gestioncomercial",
            "dashboardNavigation",
            function (sChannelId, sEventId, oData) {
              const itKey = oData.parameter;
              if (itKey) {
                const oNavContainer = this.byId("pageContainer");
                oNavContainer.to(this.getView().createId(itKey.toString()));
              }
            },
            this
          );
        },

        onItemSelect: function (oEvent) {
          // const oItem = oEvent.getParameter("item");
          const expanded = oEvent.getParameter("item").getExpanded();
          oEvent.getParameter("item").setExpanded(!expanded);

          const paginas = this.manager.getPaginas();
          const key = oEvent.getSource().getSelectedKey();
          //+@{
          const currentPage = sessionStorage.getItem("pagina");
          if (currentPage == key) {
            return;
          }
          if (currentPage == "" && key == "Dashboard") {
            return;
          }
          //+@}
          if (key == "Logout") {
            // const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            // oRouter.navTo("RouteLogin", {}, true);
            // cordova.plugins.diagnostic.restart(null, true);
            window.location.reload(); // +@JR
          }

          const result = paginas.filter((item) => item.id == key);
          if (result.length > 0) {
            // oLocal.setProperty("/Pagina", key); //+@
            sessionStorage.setItem("pagina", key);
            this.onNavBtnUnexpand();
            // if (key.length > 0 && currentPage.length > 0) {
            if (key.length > 0) {
              this.manager.setBusy(true);
              this.byId("pageContainer").to(this.getView().createId(key));
            }
          }

          // this.byId("pageContainer").to(
          //   this.getView().createId(oItem.getKey())
          // );
        },

        retractSideNav() {
          const oSideNavigation = this.byId("sideNavigation");
          oSideNavigation.setExpanded(false);
          this.onSideNavBtnPress();
        },

        handleUserNamePress: function (event) {
          const oPopover = new Popover({
            showHeader: false,
            placement: library.PlacementType.Bottom,
            content: [
              new Button({
                text: i18n.getText("CerrarSesion"),
                type: library.ButtonType.Transparent,
              }),
            ],
          }).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover");

          oPopover.openBy(event.getSource());
        },

        onSideNavBtnPress: function () {
          const oToolPage = this.byId("toolPage");
          // const oSideNav = this.byId("sideNavigation");
          // const oToggleButton = this.byId("sideNavigationToggleButton");
          const bSideExpanded = oToolPage.getSideExpanded();
          this.setToggleBtnTooltip(bSideExpanded);

          oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        onNavBtnUnexpand: function () {
          const oToolPage = this.byId("toolPage");
          this.setToggleBtnTooltip(true);
          oToolPage.setSideExpanded(false);
        },

        setToggleBtnTooltip: function (bLarge) {
          const oToggleBtn = this.byId("sideNavigationToggleButton");
          if (bLarge) {
            oToggleBtn.setTooltip(i18n.getText("ExpandirMenu"));
          } else {
            oToggleBtn.setTooltip(i18n.getText("EsconderMenu"));
          }
        },

        // +@dev-jrosales {
        onPressAvatar: function (oEvent) {
          let oEventSource = oEvent.getSource(),
            bActive = this.oMyAvatar.getActive();

          this.oMyAvatar.setActive(!bActive);

          if (bActive) {
            this._oPopover.close();
          } else {
            this._oPopover.openBy(oEventSource);
          }
        },

        onPopoverClose: function () {
          this.oMyAvatar.setActive(false);
        },

        // onListItemPress: function (oEvent) {
        //   console.log(oEvent.getParameters().id);
        //   if (oEvent.getParameters().id === "__item89") {
        //     oLocal.setProperty("/IsDarkMode", !oLocal.getProperty("/IsDarkMode"));
        //     this.onToggleTheme();
        //   }
        //   if (oEvent.getParameters().id === "__item90") {
        //     window.location.reload(); // +@JR
        //   }
        //   this.oMyAvatar.setActive(false);
        //   this._oPopover.close();
        // },

        onListItemPress: async function (oEvent) {
          const action = oEvent.getSource().getCustomData()[0].getValue();
          console.log("Action:", action);

          switch (action) {
            case "toggleTheme":
              oLocal.setProperty("/IsDarkMode", !oLocal.getProperty("/IsDarkMode"));
              this.onToggleTheme();
              break;

            case "logout":
              var sLogoffUrl = this.manager.getHostName() + "/sap/public/bc/icf/logoff";

              this.manager.clearValidarUsuarioSession();
              sessionStorage.removeItem("login");

              fetch(sLogoffUrl, {
                method: "GET"
              }).then(response => {
                console.log("Logoff response:", response);
                // sessionStorage.clear();
              }).catch(error => {
                console.error("Logoff error:", error);
              });

              // sessionStorage.setItem("mobile", JSON.stringify(true));

              const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
              oRouter.navTo("RouteLogin", {}, true);
              break;
          }

          this.oMyAvatar.setActive(false);
          this._oPopover.close();
        },


        onToggleTheme: function () {
          // var isDark = document.body.classList.contains("dark-theme");
          // this.changeThemeMobile(!isDark);
          this.changeThemeMobile();
        },

        changeThemeMobile: function () {
          const isDark = document.body.classList.contains("dark-theme");
          let new_theme = "";
          const body = document.body;

          if (isDark) {
            new_theme = "gc_farmex_light";
            body.classList.remove("dark-theme"); // Remover modo oscuro
          } else {
            new_theme = "gc_farmex_dark";
            body.classList.add("dark-theme"); // Asignar modo oscuro
          }

          this.manager.cambiarTema(this, new_theme);
        }
        //}
      }
    );
  }
);
