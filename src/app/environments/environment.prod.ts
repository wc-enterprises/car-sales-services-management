import { EnvInterface } from "./types";

export const environment: EnvInterface = {
  environment: "prod",
  theme: "444547",
  navBarTheme: ["FFF3EB", "FEE2D3", "FDD0B9"],
  logoUrl: "assets/logo/grace_logo.svg",
  firebaseConfig: {
    apiKey: "AIzaSyBiCDeeajImbT-aoiNU1bSFLwUsybq9xQU",
    authDomain: "grace-auto-service.firebaseapp.com",
    databaseURL:
      "https://grace-auto-service-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "grace-auto-service",
    storageBucket: "grace-auto-service.appspot.com",
    messagingSenderId: "835945835666",
    appId: "1:835945835666:web:13f64ce8e5fae3460e4a4b",
  },
};
