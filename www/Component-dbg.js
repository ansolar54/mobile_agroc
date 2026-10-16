/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/axelera/pe/gestioncomercial/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("com.axelera.pe.gestioncomercial.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // var savedTheme = localStorage.getItem("theme") || "light"; // Por defecto Light //-@ES20250324
                // this.setThemeMobile(savedTheme === "dark");                                     //-@ES20250324

                //{+@ES20260520
                // let sociedad = "1000"; // Valor por defecto: Farmex
                let sociedad = "1200"; // Valor por defecto: Agroconnexion
                
                const componentData = this.getComponentData();
                if (componentData && componentData.startupParameters) {
                    sociedad = componentData.startupParameters.bukrs[0];
                }
                sessionStorage.setItem("sociedad", sociedad);
                //}+@ES20260520
                
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            },

            myNavBack: function () {
                var oHistory = History.getInstance();
                var oPrevHash = oHistory.getPreviousHash();
                if (oPrevHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getRouter().navTo("masterSettings", {}, true);
                }
            },

            getContentDensityClass: function () {
                if (!this._sContentDensityClass) {
                    if (!Device.support.touch) {
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        this._sContentDensityClass = "sapUiSizeCozy";
                    }
                }
                return this._sContentDensityClass;
            },

            // setThemeMobile: function (isDark) {
            //     var body = document.body;
                
            //     if (isDark) {
            //         body.classList.add("dark-theme"); // Agregar modo oscuro
            //         localStorage.setItem("theme", "dark"); // Guardar preferencia
            //     } else {
            //         body.classList.remove("dark-theme"); // Remover modo oscuro
            //         localStorage.setItem("theme", "light");
            //     }
            // }

        });
    }
);