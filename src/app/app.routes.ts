import { Route } from "@angular/router";
import { initialDataResolver } from "app/app.resolvers";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { NoAuthGuard } from "app/core/auth/guards/noAuth.guard";
import { LayoutComponent } from "app/layout/layout.component";
// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
  // Redirect empty path to '/dashboards/project'
  // { path: '', pathMatch: 'full', redirectTo: 'dashboards/project' },

  // Redirect empty path to '/customer-data/contacts'
  { path: "", pathMatch: "full", redirectTo: "/home/dashboard" },

  // Redirect signed-in user to the '/dashboards/project'
  //
  // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
  // path. Below is another redirection for that path to redirect the user to the desired
  // location. This is a small convenience to keep all main routes together here on this file.
  {
    path: "signed-in-redirect",
    pathMatch: "full",
    redirectTo: "home/dashboard",
  },

  // Auth routes for guests
  {
    path: "",
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      {
        path: "confirmation-required",
        loadChildren: () =>
          import(
            "app/modules/auth/confirmation-required/confirmation-required.routes"
          ),
      },
      {
        path: "forgot-password",
        loadChildren: () =>
          import("app/modules/auth/forgot-password/forgot-password.routes"),
      },

      {
        path: "sign-in",
        loadChildren: () => import("app/modules/auth/sign-in/sign-in.routes"),
      },
    ],
  },

  // Auth routes for authenticated users
  {
    path: "",
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      {
        path: "sign-out",
        loadChildren: () => import("app/modules/auth/sign-out/sign-out.routes"),
      },
    ],
  },

  // Admin routes
  {
    path: "",
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: initialDataResolver,
    },
    children: [
      // Dashboards
      {
        path: "home",
        children: [
          {
            path: "dashboard",
            loadChildren: () =>
              import("app/modules/analytics/analytics.routes"),
          },
        ],
      },
      {
        path: "customer-data",
        children: [
          {
            path: "contacts",
            loadChildren: () => import("app/modules/contacts/contacts.routes"),
          },
          {
            path: "cars",
            loadChildren: () => import("app/modules/cars/cars.routes"),
          },
        ],
      },

      // Apps
      {
        path: "inventory-and-invoice",
        children: [
          {
            path: "contacts",
            loadChildren: () => import("app/modules/contacts/contacts.routes"),
          },
          {
            path: "spares-and-services",
            loadChildren: () =>
              import("app/modules/spares-and-services/ecommerce.routes"),
          },
          {
            path: "invoices",
            loadChildren: () => import("app/modules/invoices/invoices.routes"),
          },
        ],
      },
      // 404 & Catch all
      {
        path: "404-not-found",
        pathMatch: "full",
        loadChildren: () =>
          import("app/modules/utils/error-404/error-404.routes"),
      },
      { path: "**", redirectTo: "404-not-found" },
    ],
  },
];
