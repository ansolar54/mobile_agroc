sap.ui.define([], function () {
  return {
    booleano: function (valor) {
      switch (valor) {
        case "X":
          return true;
        default:
          break;
      }

      return false;
    },

    integer: function (value) {
      if (!value) return "";
      return parseInt(value);
    },

    twodecimals: function (value) {
      if (!value) return "";

      let num = parseFloat(value);
      if (isNaN(num)) return "";
      return num.toFixed(2);
    },

    // formato fecha odata a formato AAAA/MM/DD
    fecha: function (dParam) {
      let dia, mes, anio;

      if (dParam) {
        dFecha = new Date(dParam);
        dFecha.setHours(dFecha.getHours() + 5); //test
        dia = dFecha.getDate().toString();
        mes = (dFecha.getMonth() + 1).toString();
        anio = dFecha.getFullYear().toString();
        dia = dia.padStart(2, "0");
        mes = mes.padStart(2, "0");
        // return `${dia}-${mes}-${anio}`;
        return `${dia}/${mes}/${anio}`;
      }
    },

    // formato fecha odata a formato AAAA/MM/DD
    fecha1: function (dParam) {
      let dia, mes, anio;

      if (dParam) {
        dFecha = new Date(dParam);
        dFecha.setHours(dFecha.getHours() + 5); //test
        dia = dFecha.getDate().toString();
        mes = (dFecha.getMonth() + 1).toString();
        anio = dFecha.getFullYear().toString();
        dia = dia.padStart(2, "0");
        mes = mes.padStart(2, "0");
        // return `${dia}-${mes}-${anio}`;
        return `${dia}-${mes}-${anio}`;
      }
    },

    // Fecha DDMMAAAA a DD/MM/AAAA
    fecha2: function (param) {
      if (typeof param == "string") {
        if (param.length === 8) {
          let dia, mes, anio;
          dia = param.substring(6, 8);
          mes = param.substring(4, 6);
          anio = param.substring(0, 4);
          return dia + "/" + mes + "/" + anio;
        }
      }
    },

    formateaFecha: function (dParam) {
      if (typeof dParam === "object") {
        let dia, mes, anio;

        if (dParam) {
          dFecha = new Date(dParam);
          dFecha.setHours(dFecha.getHours() + 5); //test
          dia = dFecha.getDate().toString();
          mes = (dFecha.getMonth() + 1).toString();
          anio = dFecha.getFullYear().toString();
          dia = dia.padStart(2, "0");
          mes = mes.padStart(2, "0");
          // return `${dia}-${mes}-${anio}`;
          return `${anio}${mes}${dia}`;
        }
      } else {
        // +@JR - cuando fecha contiene - o / return yyyymmdd
        let datePart;
        if (dParam.includes("-")) {
          datePart = dParam.split("-");
          return datePart[2] + datePart[1] + datePart[0];
        } else if (dParam.includes("/")) {
          datePart = dParam.split("/");
          return datePart[2] + datePart[1] + datePart[0];
        }
        // +@JR - cuando fecha tiene formato yyyymmdd return dd-mm-yyyy
        if (dParam.length === 8) {
          let dia, mes, anio;
          dia = dParam.substring(6, 8);
          mes = dParam.substring(4, 6);
          anio = dParam.substring(0, 4);
          return dia + "-" + mes + "-" + anio;
        }
      }
    },

    formatNumber: function (sValue) {
      //{
      let groupSep = ",";
      let decSep = ".";
      const lv_sociedad = sessionStorage.getItem("sociedad");
      if (lv_sociedad == '1000') {
        groupSep = ",";
        decSep = ".";
      } else if (lv_sociedad == '1200') {
        groupSep = ".";
        decSep = ",";
      }
      //}
      // Creamos una instancia del formateador de números
      const oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        groupingEnabled: true, // Activa la agrupación de miles
        groupingSeparator: groupSep, // Define el separador de miles
        decimalSeparator: decSep, // Define el separador decimal
        decimals: 2, // Define el número de decimales
      });

      // Convierte el valor de cadena a número flotante y lo formatea
      return oNumberFormat.format(parseFloat(sValue));
    },

    formatNumberInt: function (sValue) {
      //{
      let groupSep = ",";
      let decSep = ".";
      const lv_sociedad = sessionStorage.getItem("sociedad");
      if (lv_sociedad == '1000') {
        groupSep = ",";
        decSep = ".";
      } else if (lv_sociedad == '1200') {
        groupSep = ".";
        decSep = ",";
      }
      //}
      // Creamos una instancia del formateador de números
      const oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        groupingEnabled: true, // Activa la agrupación de miles
        groupingSeparator: groupSep, // Define el separador de miles
        decimalSeparator: decSep, // Define el separador decimal
        decimals: 0, // Define el número de decimales
      });

      // Convierte el valor de cadena a número flotante y lo formatea
      return oNumberFormat.format(parseFloat(sValue));
    },

    rangeSAP: function (token) {
      let tokenText, tokenData;

      let sign, option, low, high;

      if (token?.data("range")) {
        tokenData = token.data("range");

        sign = tokenData.exclude ? "E" : "I";
        low = tokenData.value1;
        high = tokenData.value2;

        switch (tokenData.operation) {
          case "Contains":
            option = "CO";
            break;

          default: // "EQ"
            option = tokenData.operation;
            break;
        }
      } else if (token.getText().length > 0) {
        tokenText = token.getText();

        sign = "I";
        option = "EQ";
        low = tokenText;
        high = "";
      }

      return {
        Sign: sign === null ? "" : sign,
        Option: option === null ? "" : option,
        Low: low === null ? "" : low,
        High: high === null ? "" : high,
      };
    },

    rangeSAPFecha: function (token) {
      let tokenText, tokenData;
      let fecha;
      let sign, option, low, high;

      if (token?.data("range")) {
        tokenData = token.data("range");

        sign = tokenData.exclude ? "E" : "I";
        // low = tokenData.value1;
        // high = tokenData.value2;

        if (tokenData.value1) {
          low = this.getDateWithFormat(tokenData.value1);
        }

        if (tokenData.value2) {
          high = this.getDateWithFormat(tokenData.value2);
        }

        switch (tokenData.operation) {
          case "Contains":
            option = "CO";
            break;

          default: // "EQ"
            option = tokenData.operation;
            break;
        }
      } else if (token.getText().length > 0) {
        tokenText = token.getText();

        sign = "I";
        option = "EQ";
        low = tokenText;
        high = "";
      }

      return {
        Sign: sign === null ? "" : sign,
        Option: option === null ? "" : option,
        Low: low === null ? "" : low,
        High: high === null ? "" : high,
      };
    },

    getDateWithFormat: function (sFecha) {
      let dia, mes, anio;
      let fecha;

      if (!sFecha) {
        return;
      }

      dia = sFecha.getDate();
      mes = sFecha.getMonth() + 1;
      anio = sFecha.getFullYear();

      fecha =
        anio.toString().padStart(4, "0") +
        mes.toString().padStart(2, "0") +
        dia.toString().padStart(2, "0");

      return fecha;
    },

    // +@JR
    // CAMBIO PRECIO: Obetener nombre de estado de solicitud
    obtenerNombreEstado: function (strNumEstado) {
      switch (strNumEstado) {
        case "1":
          return "APROBADO";
        case "2":
          return "PENDIENTE";
        case "3":
          return "RECHAZADO";
        case "4":
          return "ANULADO";
        case "9":
          return "ELIMINADO";
        default:
          break;
      }
    },

    obtenerIdEstado: function (strNomEstado) {
      switch (strNomEstado) {
        case "APROBADO":
          return "1";
        case "PENDIENTE":
          return "2";
        case "RECHAZADO":
          return "3";
        case "ANULADO":
          return "4";
        default:
          return "";
      }
    },

    fechaEstandard: function (sFecha) {
      if (sFecha) {
        sFecha.setHours(0, 0, 0);
      }
      // if (sFecha) {
      //   fecha = sFecha.toGMTString();
      // }
      // const fecha = new Date(sFecha);
      // fecha.setHours(19, 0, 0, 0);
      return sFecha;
    },

    fechaEstandardRet: function (sFecha) {
      if (sFecha) {
        sFecha.setHours(sFecha.getHours() + 5);
      }
      return sFecha;
    },

    importe: function (sValor) {
      let valor = null;

      if (sValor) {
        if (typeof sValor == "string") {
          valor = parseFloat(sValor).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          sValor = `${valor}`.replaceAll(",", "");
        }
      } else {
        sValor = "0.00";
      }

      return sValor;
    },

    cantidad: function (sValor) {
      let valor = null;

      if (sValor) {
        if (typeof sValor == "string") {
          valor = parseFloat(sValor).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          sValor = `${valor}`.replaceAll(",", "");
          sValor = `${sValor}`.replaceAll(".00", "");

          if (sValor == "0") {
            sValor = "";
          }
        }
      } else {
        sValor = "";
      }

      return sValor;
    },

    cadena: function name(sValor) {
      if (sValor) {
        sValor = `${sValor}`;
      } else {
        sValor = "";
      }
      return sValor;
    },

    cadenaDec: function name(sValor) {
      if (sValor) {
        sValor = `${sValor}`;
      } else {
        sValor = "0.00";
      }
      return sValor;
    },

    cadenaEnt: function name(sValor) {
      if (sValor) {
        sValor = `${sValor}`.replaceAll(".00", "");
      } else {
        sValor = "";
      }
      return sValor;
    },

    cadenaFecha: function (dParam) {
      let dia, mes, anio;

      if (dParam) {
        dFecha = new Date(dParam);
        // dFecha.setHours(dFecha.getHours() + 5); //test
        dFecha.setHours(0, 0, 0);
        dia = dFecha.getDate().toString();
        mes = (dFecha.getMonth() + 1).toString();
        anio = dFecha.getFullYear().toString();
        dia = dia.padStart(2, "0");
        mes = mes.padStart(2, "0");
        // return `${dia}-${mes}-${anio}`;
        return `${anio}${mes}${dia}`;
      } else {
        return null;
      }
    },

    validaCorreo: function (correo) {
      const reg =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const regOficial =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

      if (reg.test(correo) && regOficial.test(correo)) {
        return true;
      }
      return false;
    },

    agregarPorcentaje: function (strNum) {
      if (strNum !== "") {
        return strNum + "%";
      }
    },

    formatearTextoi18n: function (isMobile, textoMovil, textoWeb) {
      return isMobile ? textoMovil : textoWeb;
    },

    getColorClass: function (bIsLightTheme) {
      return bIsLightTheme ? "colorChkTextLight" : "colorChkTextDark";
    },
  };
});
