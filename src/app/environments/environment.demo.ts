import { EnvInterface } from "./types";

export const environment: EnvInterface = {
  environment: "demo",
  theme: "444547",
  navBarTheme: ["FFF3EB", "FEE2D3", "FDD0B9"],
  logoUrl: "assets/logo/grace_logo.svg",
  firebaseConfig: {
    apiKey: "AIzaSyAmGvCTNOF0TTmZracSSBmWN-ZvG7bqJt8",
    authDomain: "car-sales-service-management.firebaseapp.com",
    databaseURL:
      "https://car-sales-service-management-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "car-sales-service-management",
    storageBucket: "car-sales-service-management.appspot.com",
    messagingSenderId: "268044674385",
    appId: "1:268044674385:web:a6b5930ea178eed2b21f70",
  },
};
