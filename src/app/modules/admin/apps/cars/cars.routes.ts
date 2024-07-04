import { Routes } from "@angular/router";
import { CarsComponent } from "./cars.component";
import { CarsListComponent } from "./list/cars.component";

export default [
  {
    path: "",
    component: CarsComponent,
    children: [
      {
        path: "",
        component: CarsListComponent,
        resolve: {},
      },
    ],
  },
] as Routes;
