import { inject } from "@angular/core";
import { Routes } from "@angular/router";
import { InventoryComponent } from "./inventory.component";
import { InventoryService } from "./inventory.service";
import { InventoryListComponent } from "./list/inventory.component";

export default [
  {
    path: "",
    component: InventoryComponent,
    children: [
      {
        path: "",
        component: InventoryListComponent,
        resolve: {
          products: () => inject(InventoryService).getProducts(),
        },
      },
    ],
  },
] as Routes;
