sap.ui.define(
  [
    "sap/ui/Device",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Popover",
    "sap/m/Button",
    "sap/m/BusyDialog",
    "sap/m/library",
    "../../model/Formatter",
    "../../model/Manager",
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
    Manager
  ) {
    "use strict";

    var oLocal = new JSONModel();
    var i18n = null;

    return Controller.extend(
      "com.axelera.pe.gestioncomercial.controller.dashboard.Dashboard",
      {
        formatter: Formatter,
        manager: Manager,

        onInit: function () {
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("Dashboard", "Clear", this.onInitDashboard, this);
        },

        onInitDashboard: function (channel, event, oData) {
          this.initialization(oData.active);
        },

        initialization: function (active) {
          this.initialLocal();
          if (active) {
            // this.getPerfilesUsu();
            this.manager.setBusy(false);
          }
        },

        initialLocal: function () {
          this.getView().setModel(oLocal, "local");
          i18n = this.manager.getI18nModel(this);
          oLocal.setData({
            IsMobile: this.manager.isMobile(), //+@dev-jrosales
          });
        },

        onNavigate: function (sKey) {
          this.manager.initPage(this, sKey, true);
        },

        // onNavFinished: function (sKey) {
        //   this.manager.initPage(sKey, true);
        // },

        itemSelect: function (sId) {
          const paginas = this.manager.getPaginas();
          const result = paginas.filter((item) => item.id == sId);
          if (result.length > 0) {
            this.manager.unexpandMenu();
          }
        },

        onNavigateToApp: function (oEvent) {
          // const oButton = oEvent.getSource();
          // const itemKey = oButton.data("parameter");
          const bindingContext = oEvent.getSource().getBindingContext();
          const itemKey = bindingContext.getProperty("key");
          this.manager.setBusy(true);

          sessionStorage.setItem("pagina", itemKey);
          this.itemSelect(itemKey);
          // this.onNavigate(itemKey); //+@
          const oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.publish(
            "com.axelera.pe.gestioncomercial",
            "dashboardNavigation",
            {
              parameter: itemKey,
            }
          );
        },
      }
    );
  }
);
