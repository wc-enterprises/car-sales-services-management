import { inject } from "@angular/core";
import { Routes } from "@angular/router";
import { AnalyticsComponent } from "app/modules/admin/dashboards/analytics/analytics.component";
import { AnalyticsService } from "app/modules/admin/dashboards/analytics/analytics.service";
import { FinanceService } from "../finance/finance.service";
import { invoicesData } from "app/services/apps/invoice/data";
import { InvoicesService } from "../../apps/invoices/invoices.service";

export default [
  {
    path: "",
    component: AnalyticsComponent,
    resolve: {
      data: () => inject(AnalyticsService).getData(),
      financialData: () => inject(FinanceService).getData(),
      invoicesData: () => inject(InvoicesService).getInvoices(),
    },
  },
] as Routes;
