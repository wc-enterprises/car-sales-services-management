import { inject } from "@angular/core";
import { Routes } from "@angular/router";
import { InvoicesService } from "../invoices/invoices.service";
import { AnalyticsComponent } from "./analytics.component";
import { AnalyticsService } from "./analytics.service";

export default [
  {
    path: "",
    component: AnalyticsComponent,
    resolve: {
      data: () => inject(AnalyticsService).getData(),
      invoicesData: () => inject(InvoicesService).getInvoices(),
    },
  },
] as Routes;
