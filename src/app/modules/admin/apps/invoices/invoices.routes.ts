import { Routes } from "@angular/router";
import { InvoicesComponent } from "./invoices.component";
import { InvoicesListComponent } from "./list/invoices-list.component";
import { PreviewComponent } from "./preview/preview.component";
import { InvoiceFormComponent } from "./add-invoice-form/invoice-form";

export default [
  {
    path: "",
    component: InvoicesComponent,
    children: [
      {
        path: "",
        component: InvoicesListComponent,
        resolve: {},
      },
      {
        path: "preview/:id",
        component: PreviewComponent,
        resolve: {},
      },
      {
        path: "add",
        component: InvoiceFormComponent,
        resolve: {}
      }
    ],
  },
] as Routes;
