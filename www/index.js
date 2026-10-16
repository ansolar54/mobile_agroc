var appState = {
  takingPicture: true,
  imageUri: "",
};

var APP_STORAGE_KEY = "exampleAppState";

var app = {
  initialize: function () {
    this.bindEvents();
  },
  bindEvents: function () {
    document.addEventListener("deviceready", this.onDeviceReady.bind(this), true);
    document.addEventListener("pause", this.onPause.bind(this), true);
    document.addEventListener("resume", this.onResume.bind(this), true);
  },
  onDeviceReady: function () {
    console.log("onDeviceReady");
    // document
    //   .getElementById("take-picture-button")
    //   .addEventListener("click", () => {
    //     appState.takingPicture = true;

    //     navigator.camera.getPicture(
    //       cameraSuccessCallback,
    //       cameraFailureCallback,
    //       {
    //         sourceType: Camera.PictureSourceType.CAMERA,
    //         destinationType: Camera.DestinationType.FILE_URI,
    //         targetWidth: 250,
    //         targetHeight: 250,
    //       }
    //     );
    //   });

    document.getElementById("deviceready").classList.add("ready");

    window.FirebasePlugin.hasPermission((data) => {
      if (!data.isEnabled) {
         window.FirebasePlugin.grantPermission((hasPermission) => {
            if (hasPermission) {
               console.log("Existen permisos para noti");
            } else {
               console.log("permisos para noti rechazados");
            }
         });
      } else {
         console.log("Existen permisos");
      }
    });

    window.FirebasePlugin.getToken(
      (token) => {
        console.log("TOKEN FIREBASE", token)
        sessionStorage.setItem("tokenFirebase", token);
      },
      (error) => {
        console.error("ERROR TOKEN", error);
      }
    );

    window.FirebasePlugin.onTokenRefresh(
      (token) => {
        console.log("Actualizar para obtener nuevo token: " + token);
      },
      (error) => {
        alert("ERROR ACTUALIZAR TOKEN", error);
      }
    );

    window.FirebasePlugin.onMessageReceived(
      (message) => {
        if (message.messageType === "notification") {
          alert(message.body);
          if (message.tap) {
            alert("Presionada en: " + message.tap);
          }
        }
      },
      (error) => {
        console.error(error);
      }
    );
  },
  onPause: function () {
    console.log("onPause");
    if (appState.takingPicture || appState.imageUri) {
      window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
    }
  },
  onResume: function (event) {
    console.log("onResume");
    var storedState = window.localStorage.getItem(APP_STORAGE_KEY);

    if (storedState) {
      appState = JSON.parse(storedState);
    }

    if (!appState.takingPicture && appState.imageUri) {
      document.getElementById("get-picture-result").src = appState.imageUri;
    } else if (appState.takingPicture && event.pendingResult) {
      if (event.pendingResult.pluginStatus === "OK") {
        cameraSuccessCallback(event.pendingResult.result);
      } else {
        cameraFailureCallback(event.pendingResult.result);
      }
    }
  },
};

function cameraSuccessCallback(imageUri) {
  appState.takingPicture = false;
  appState.imageUri = imageUri;
  document.getElementById("get-picture-result").src = imageUri;
}

function cameraFailureCallback(error) {
  appState.takingPicture = false;
  console.log(error);
}

app.initialize();
