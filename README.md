#

## www
Cuando pegue compilado de fiori en la carpeta *www*, favor de no reemplazar los archivos *index.html ni index.js*

```bash

# ANDROID
cordova platform add android  # Generar Plataforma
cordova build android # Generar Compilado

## Formas de ejecución
cordova emulate android
cordova run android
cordova run android --device  # dispositivo físico

# IOS
cordova platform add ios      # Generar Plataforma
cordova build ios     # Generar Compilado
cordova run ios

```

# ANDROID

## GENERATE KEY AND KEYSTORE

[Sign your app](https://developer.android.com/studio/publish/app-signing#generate-key)

## SIGNED
### APK
cordova build android --release "--" --keystore=C:\Users\DEVELOPER\Documents\axelera\farmex\R059\movil\fmx-migration-keystore.jks --storePassword=fmxcordova --alias=key0 --password=fmxcordova --packageType=apk

### ABB
cordova build android --release "--" --keystore=C:\Users\DEVELOPER\Documents\axelera\farmex\R059\movil\fmx-migration-keystore.jks --storePassword=fmxcordova --alias=key0 --password=fmxcordova --packageType=bundle

## UNSIGNED
### APK
cordova build android --release "--" --packageType=apk

### ABB
cordova build android --release "--" --packageType=bundle
