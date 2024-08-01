import { inject } from "@angular/core";
import { Routes } from "@angular/router";
import { InventoryComponent } from "app/modules/admin/apps/spares-and-services/inventory.component";
import { InventoryService } from "app/modules/admin/apps/spares-and-services/inventory.service";
import { InventoryListComponent } from "app/modules/admin/apps/spares-and-services/list/inventory.component";

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
