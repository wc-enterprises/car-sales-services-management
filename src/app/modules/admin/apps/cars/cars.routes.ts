import { Routes } from "@angular/router";
import { CarsComponent } from "./cars.component";
import { CarsListComponent } from "./list/cars.component";
import { inject } from "@angular/core";
import { CarsService } from "./cars.service";

export default [
  {
    path: "",
    component: CarsComponent,
    children: [
      {
        path: "",
        component: CarsListComponent,
        resolve: {
          cars: () => inject(CarsService).getCars(),
        },
      },
    ],
  },
] as Routes;
