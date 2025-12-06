import { Routes } from "@angular/router";
import { EstimateBillingComponent } from "./estimate-billing.component";
import { EstimatesListComponent } from "./list/estimates-list.component";
import { EstimatePreviewComponent } from "./preview/preview.component";
import { EstimateFormComponent } from "./add-estimate/add-estimate.component";
import { inject } from "@angular/core";
import { InventoryService } from "../spares-and-services/inventory.service";
import { EstimateBillingService } from "./estimate-billing.service";

export default [
    {
        path: "",
        component: EstimateBillingComponent,
        children: [
            {
                path: "",
                component: EstimatesListComponent,
                resolve: {
                    products: () => inject(EstimateBillingService).getEstimates(),
                },
            },
            {
                path: "preview/:id",
                component: EstimatePreviewComponent,
                resolve: {},
            },
            {
                path: "add",
                component: EstimateFormComponent,
                resolve: {
                    estimates: () => inject(EstimateBillingService).getEstimates(),
                    products: () => inject(InventoryService).getProducts(),
                },
            },
        ],
    },
] as Routes;
