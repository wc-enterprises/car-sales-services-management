import { Routes } from "@angular/router";
import { InvoicesComponent } from "./invoices.component";
import { InvoicesListComponent } from "./list/invoices-list.component";
import { PreviewComponent } from "./preview/preview.component";
import { InvoiceFormComponent } from "./add-invoice/add-invoice.component";
import { inject } from "@angular/core";
import { InventoryService } from "../spares-and-services/inventory.service";
import { InvoicesService } from "./invoices.service";

export default [
  {
    path: "",
    component: InvoicesComponent,
    children: [
      {
        path: "",
        component: InvoicesListComponent,
        resolve: {
          products: () => inject(InvoicesService).getInvoices(),
        },
      },
      {
        path: "preview/:id",
        component: PreviewComponent,
        resolve: {},
      },
      {
        path: "add",
        component: InvoiceFormComponent,
        resolve: {
          invoices: () => inject(InvoicesService).getInvoices(),
          products: () => inject(InventoryService).getProducts(),
        },
      },
    ],
  },
] as Routes;
