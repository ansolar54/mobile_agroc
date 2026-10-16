sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
  ],
  function (JSONModel, MessageToast, MessageBox, BusyDialog) {
    const oBusyDialog = new BusyDialog();
    const HOSTNAMES = {
      dev: "https://fioridev.sap.grupoif.net",
      qas: "https://fioriqas.sap.grupoif.net",
      prd: "https://fioriprd.sap.grupoif.net",
    };

    const HOSTNAME_MOB = HOSTNAMES.dev; // DEV
    // const HOSTNAME_MOB = HOSTNAMES.prd; // PRD MOBILE

    const URI = {
      Admin: `/sap/opu/odata/sap/ZSD_RC_ADMIN_SRV?sap-client=100`,
      Pedidos: `/sap/opu/odata/sap/ZSD_RC_PEDIDOS_SRV?sap-client=100`,
      Cambiop: `/sap/opu/odata/sap/ZSD_RC_CAMBIOP_SRV?sap-client=100`,
      Reportes: `/sap/opu/odata/sap/ZSD_RC_REPORTES_SRV?sap-client=100`,
    };

    const resources = {
      ImgLogo: `${HOSTNAME_MOB}/sap/public/bc/ui2/logon/img/sap_logo.png`,
      ImgBackground: `${HOSTNAME_MOB}/sap/public/bc/ui2/logon/themes/sap_belize/img/background.jpg`,
    };

    const aEvents = [
      { channel: "Login", event: "Clear", oData: { active: false } },
      { channel: "Dashboard", event: "Clear", oData: { active: false } },
      { channel: "AD01", event: "Clear", oData: { active: false } },
      { channel: "AD02", event: "Clear", oData: { active: false } },
      { channel: "AD03", event: "Clear", oData: { active: false } },
      { channel: "AD04", event: "Clear", oData: { active: false } },
      { channel: "GP01", event: "Clear", oData: { active: false } },
      { channel: "GP02", event: "Clear", oData: { active: false } },
      { channel: "CP01", event: "Clear", oData: { active: false } },
      { channel: "CP02", event: "Clear", oData: { active: false } },
      { channel: "CP03", event: "Clear", oData: { active: false } },
      { channel: "CP04", event: "Clear", oData: { active: false } },
      { channel: "R02", event: "Clear", oData: { active: false } },
      { channel: "R03", event: "Clear", oData: { active: false } },
      { channel: "R04", event: "Clear", oData: { active: false } },
      { channel: "R05", event: "Clear", oData: { active: false } },
      { channel: "R06", event: "Clear", oData: { active: false } },
      { channel: "R07", event: "Clear", oData: { active: false } },
      { channel: "R08", event: "Clear", oData: { active: false } },
    ];

    const paginas = [
      { id: "Login", channel: "Login" },
      { id: "Dashboard", channel: "Dashboard" },
      { id: "AD01", channel: "AD01" },
      { id: "AD02", channel: "AD02" },
      { id: "AD03", channel: "AD03" },
      { id: "AD04", channel: "AD04" },
      { id: "AD05", channel: "AD05" },
      { id: "R02", channel: "R02" },
      { id: "R03", channel: "R03" },
      { id: "R04", channel: "R04" },
      { id: "R05", channel: "R05" },
      { id: "R06", channel: "R06" },
      { id: "R07", channel: "R07" },
      { id: "R08", channel: "R08" },
      { id: "CP01", channel: "CP01" },
      { id: "CP02", channel: "CP02" },
      { id: "CP03", channel: "CP03" },
      { id: "CP04", channel: "CP04" },
      { id: "GP01", channel: "GP01" },
      { id: "GP02", channel: "GP02" },
      // { id: "GP03", channel: "GP03"},
    ];

    return {
      unexpandMenu: function () {
        const oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("onUnexpandMenu");
      },

      initPage: async function (that, sKey, bActive) {
        const oEventBus = sap.ui.getCore().getEventBus();
        const oResult = aEvents.find((item) => item.channel == sKey);
        if (oResult) {
          oResult.oData.active = bActive;
          await oEventBus.publish(
            oResult.channel,
            oResult.event,
            oResult.oData
          );
        }
      },

      setBusy: function (active) {
        active ? oBusyDialog.open() : oBusyDialog.close();
      },

      // initControllers: function (sKey) {
      //   const oEventBus = sap.ui.getCore().getEventBus();
      //   for (const item of aEvents) {
      //     if (sKey == item.channel) {
      //       item.oData.active = true;
      //     }
      //     oEventBus.publish(item.channel, item.event, item.oData);
      //   }
      // },

      getImgLogo: function () {
        return resources.ImgLogo;
      },

      getImgBackground: function () {
        return resources.ImgBackground;
      },

      getPaginas: function () {
        return paginas;
      },

      setLogSession: function () {
        let login = sessionStorage.getItem("login");
        if (login == null || login == '') {
          console.log("Bienvenido")
          sessionStorage.setItem("login", "X");
          // this.auditoria(5); //-@20260820
        }
      },

      setMobile: function (valor) {
        sessionStorage.setItem("mobile", JSON.stringify(valor));
      },

      isMobile: function () {
        const mobile = JSON.parse(sessionStorage.getItem("mobile"));
        return mobile;
      },

      getIndMobile: function () {
        if (this.isMobile()) {
          return "X";
        } else {
          return "";
        }
      },

      getUser: function () {
        const usuario = sessionStorage.getItem("usuario");
        return usuario;
      },

      getValidarUsuarioSessionKey: function (usuario) {
        return [
          String(usuario || "").toUpperCase(),
          this.getBukrs() || "",
          this.getIndMobile(),
        ].join("|");
      },

      hasValidarUsuarioSession: function (usuario) {
        return sessionStorage.getItem("validar-usuario-session") ===
          this.getValidarUsuarioSessionKey(usuario);
      },

      setValidarUsuarioSession: function (usuario) {
        sessionStorage.setItem(
          "validar-usuario-session",
          this.getValidarUsuarioSessionKey(usuario)
        );
      },

      clearValidarUsuarioSession: function () {
        sessionStorage.removeItem("validar-usuario-session");
      },

      getBukrs: function () {
        const sociedad = sessionStorage.getItem("sociedad");
        return sociedad;
      },

      getTitle: function (context) {
        const i18n = this.getI18nModel(context);
        const sociedad = this.getBukrs();
        if (sociedad == "1000") {
          return i18n.getText("titleFmx");
        } else if (sociedad == "1200") {
          return i18n.getText("titleAgx");
        } else {
          return '';
        }
      },

      getIdUser: function () {
        const idUsuario = Number(sessionStorage.getItem("id-usuario"));
        return idUsuario;
      },

      getService: function (modulo, json = true) {
        let uri = "";

        switch (modulo) {
          case "ADMIN":
            uri = URI.Admin;
            break;
          case "CAMBIOP":
            uri = URI.Cambiop;
            break;
          case "REPORTES":
            uri = URI.Reportes;
            break;
          case "PEDIDOS":
            uri = URI.Pedidos;
            break;
          default:
            break;
        }

        return this.isMobile()
          ? new sap.ui.model.odata.ODataModel(`${HOSTNAME_MOB}${uri}`, {
            json: json,
            user: sessionStorage.getItem("usuario"),
            password: sessionStorage.getItem("clave")
          })
          : new sap.ui.model.odata.ODataModel(uri, json);
        // ? new sap.ui.model.odata.v2.ODataModel(`${HOSTNAME_MOB}${uri}`, {
        // : new sap.ui.model.odata.v2.ODataModel(uri, json);
      },

      getHostName: function () {
        return HOSTNAME_MOB;
      },

      getI18nModel: function (that) {
        const i18n = that
          .getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
        return i18n;
      },

      // RECORDER

      cambiarEstado: async function (that, tabla, id, estado) {
        const oService = this.getService("ADMIN");
        const params = {
          Tabla: `'${tabla}'`,
          Id: `'${id}'`,
          Estado: `${estado}`,
        };

        // oService.setHeaders({ "X-Requested-With": "X" }); //-@
        oService.setHeaders({ 
          "X-Requested-With": "X",
          "usuario": this.getUser(),
          "sociedad": this.getBukrs(),
          "mobile": this.getIndMobile(),
        });
        
        oService.create("/CambioEstado", null, {
          method: "POST",
          urlParameters: params,
          success: function (oData, oResponse) {
            // console.log("CambioEstado (success)", oData.CambioEstado.Valor);
            this.msgEstado(that, oData.CambioEstado.Valor);
            that.onRefreshTable();
          }.bind(this),
          error: function (oError) {
            console.error("CambioEstado (error)", oError);
          },
        });
      },

      //{-@20260820
      // auditoria: function (idEvento) {
      //   const oService = this.getService("ADMIN");
      //   const uri = "/AuditoriaSet?/$expand=auditoria_registro_nav";
      //   const data = {
      //     Accion: "C",
      //     auditoria_registro_nav: [],
      //   };

      //   data.auditoria_registro_nav.push({
      //     Idusuario: this.getIdUser(),
      //     Idevento: idEvento,
      //     Ofiventas: sessionStorage.getItem("ofi-ventas"),
      //     Indicador: "FIORI", //indicador,
      //   });

      //   // oService.setHeaders({ "X-Requested-With": "X" });
      //   oService.setHeaders({ 
      //     "X-Requested-With": "X",
      //     "usuario": this.getUser(),
      //     "sociedad": this.getBukrs(),
      //   });
        
      //   oService.create(uri, data, {
      //     method: "POST",
      //     success: function (oData, oResponse) {
      //       // console.log("Auditoria-Registrar (success)", oData, oResponse);
      //     }.bind(this),
      //     error: function (oError) {
      //       console.error("Auditoria-Registrar (error)", oError);
      //     },
      //   });
      // },
      //}-@20260820

      cambiarTema: async function (that, tema) {
        // console.log("manager cambiar tema", tema)
        const oService = this.getService("ADMIN");
        const params = { Tema: `'${tema}'` };

        // oService.setHeaders({ "X-Requested-With": "X" });
        oService.setHeaders({ 
          "X-Requested-With": "X",
          "usuario": this.getUser(),
          "sociedad": this.getBukrs(),
          "mobile": this.getIndMobile(),
        });
        
        oService.create("/CambioTema", null, {
          method: "POST",
          urlParameters: params,
          success: function (oData, oResponse) {
            console.log("CambioTema (success)", oData.CambioTema.Valor);
            // this.msgTema(that, oData.CambioTema.Valor);
            // that.onRefreshTable();
          }.bind(this),
          error: function (oError) {
            console.error("CambioTema (error)", oError);
          },
        });
      },

      // MENSAJES
      msgEstado: function (context, indicador) {
        const i18n = this.getI18nModel(context);
        // let ok;

        // if (indicador == "X") {
        if (indicador) {
          MessageToast.show(i18n.getText("MsgEstadoAct"));
          // ok = true;
        } else {
          MessageToast.show(i18n.getText("MsgEstadoNoAct"));
          // ok = false;
        }
      },

      msgResult: function (oResponse) {
        let ok;

        ok = false;
        if (oResponse.headers["sap-message"]) {
          const oSapMessage = JSON.parse(oResponse.headers["sap-message"]);
          if (oSapMessage.severity == "success") {
            // MessageToast.show(oSapMessage.message);
            MessageBox.success(oSapMessage.message);
            ok = true;
          } else {
            // MessageToast.show(`${oSapMessage.severity}: ${oSapMessage.message}`);
            // MessageToast.show(`${oSapMessage.message}`);
            MessageBox.error(`${oSapMessage.message}`);
          }
        }

        return ok;
      },

      msgResult2: function (oResponse) {
        let ok;

        ok = false;
        if (oResponse.headers["sap-message"]) {
          const oSapMessage = JSON.parse(oResponse.headers["sap-message"]);
          if (oSapMessage.severity == "success") {
            MessageBox.success(oSapMessage.message);
            ok = true;
          } else {
            // MessageToast.show(`${oSapMessage.severity}: ${oSapMessage.message}`);
            MessageBox.error(`${oSapMessage.message}`);
          }
        }

        return ok;
      },

      msgResult3: function (oMensaje) {
        let ok = false,
          mensaje;
        mensaje = `${oMensaje.Message} ${oMensaje.Message1}`;

        if (oMensaje) {
          switch (oMensaje.Success) {
            case "S":
              MessageBox.success(mensaje);
              ok = true;
              break;
            case "E":
              MessageBox.error(mensaje);
              break;
            default:
              break;
          }
        }

        return ok;
      },

      msgResult4: function (aMensajes) {
        let ok = true;

        for (const mensaje of aMensajes) {
          const okAux = this.msgResult3(mensaje);
          if (!okAux) {
            ok = false;
          }
        }

        return ok;
      },
    };
  }
);
