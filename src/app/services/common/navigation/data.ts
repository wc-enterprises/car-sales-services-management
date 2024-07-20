/* eslint-disable */
import { FuseNavigationItem } from "@fuse/components/navigation";

export const defaultNavigation: FuseNavigationItem[] = [
  {
    id: "analytics",
    title: "Analytics",
    subtitle: "",
    type: "group",
    icon: "heroicons_outline:home",
    children: [
      {
        id: "dashboards.project",
        title: "Project",
        type: "basic",
        icon: "heroicons_outline:clipboard-document-check",
        link: "/dashboards/project",
      },
      {
        id: "dashboards.analytics",
        title: "Analytics",
        type: "basic",
        icon: "heroicons_outline:chart-pie",
        link: "/dashboards/analytics",
      },
      {
        id: "dashboards.finance",
        title: "Finance",
        type: "basic",
        icon: "heroicons_outline:banknotes",
        link: "/dashboards/finance",
      },
    ],
  },
  {
    id: "customer-data",
    title: "Customer data",
    subtitle: "",
    type: "group",
    icon: "heroicons_outline:home",
    children: [
      {
        id: "apps.contacts",
        title: "Contacts",
        type: "basic",
        icon: "heroicons_outline:user-group",
        link: "/customer-data/contacts",
      },
      {
        id: "apps.cars",
        title: "Cars",
        type: "basic",
        icon: "heroicons_outline:truck",
        link: "/customer-data/cars",
      },
    ],
  },
  {
    id: "inventory-and-invoice",
    title: "Inventory and Invoice",
    subtitle: "",
    type: "group",
    icon: "heroicons_outline:document",
    children: [
      {
        id: "apps.spares-and-services",
        title: "Spares & Services",
        type: "basic",
        icon: "heroicons_outline:wrench",
        link: "/inventory-and-invoice/spares-and-services",
      },
      {
        id: "apps.spares-and-services",
        title: "Invoices",
        type: "basic",
        icon: "heroicons_outline:calculator",
        link: "/inventory-and-invoice/invoices",
      },
      // {
      //     id: 'pages.authentication',
      //     title: 'Authentication',
      //     type: 'collapsable',
      //     icon: 'heroicons_outline:lock-closed',
      //     children: [
      //         {
      //             id: 'pages.authentication.sign-in',
      //             title: 'Sign in',
      //             type: 'collapsable',
      //             children: [
      //                 {
      //                     id: 'pages.authentication.sign-in.classic',
      //                     title: 'Classic',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-in/classic',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-in.modern',
      //                     title: 'Modern',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-in/modern',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-in.modern-reversed',
      //                     title: 'Modern Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-in/modern-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-in.split-screen',
      //                     title: 'Split Screen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-in/split-screen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-in.split-screen-reversed',
      //                     title: 'Split Screen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-in/split-screen-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-in.fullscreen',
      //                     title: 'Fullscreen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-in/fullscreen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-in.fullscreen-reversed',
      //                     title: 'Fullscreen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-in/fullscreen-reversed',
      //                 },
      //             ],
      //         },
      //         {
      //             id: 'pages.authentication.sign-up',
      //             title: 'Sign up',
      //             type: 'collapsable',
      //             link: '/pages/authentication/sign-up',
      //             children: [
      //                 {
      //                     id: 'pages.authentication.sign-up.classic',
      //                     title: 'Classic',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-up/classic',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-up.modern',
      //                     title: 'Modern',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-up/modern',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-up.modern-reversed',
      //                     title: 'Modern Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-up/modern-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-up.split-screen',
      //                     title: 'Split Screen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-up/split-screen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-up.split-screen-reversed',
      //                     title: 'Split Screen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-up/split-screen-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-up.fullscreen',
      //                     title: 'Fullscreen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-up/fullscreen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-up.fullscreen-reversed',
      //                     title: 'Fullscreen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-up/fullscreen-reversed',
      //                 },
      //             ],
      //         },
      //         {
      //             id: 'pages.authentication.sign-out',
      //             title: 'Sign out',
      //             type: 'collapsable',
      //             link: '/pages/authentication/sign-out',
      //             children: [
      //                 {
      //                     id: 'pages.authentication.sign-out.classic',
      //                     title: 'Classic',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-out/classic',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-out.modern',
      //                     title: 'Modern',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-out/modern',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-out.modern-reversed',
      //                     title: 'Modern Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-out/modern-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-out.split-screen',
      //                     title: 'Split Screen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-out/split-screen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-out.split-screen-reversed',
      //                     title: 'Split Screen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-out/split-screen-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-out.fullscreen',
      //                     title: 'Fullscreen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-out/fullscreen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.sign-out.fullscreen-reversed',
      //                     title: 'Fullscreen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/sign-out/fullscreen-reversed',
      //                 },
      //             ],
      //         },
      //         {
      //             id: 'pages.authentication.forgot-password',
      //             title: 'Forgot password',
      //             type: 'collapsable',
      //             link: '/pages/authentication/forgot-password',
      //             children: [
      //                 {
      //                     id: 'pages.authentication.forgot-password.classic',
      //                     title: 'Classic',
      //                     type: 'basic',
      //                     link: '/pages/authentication/forgot-password/classic',
      //                 },
      //                 {
      //                     id: 'pages.authentication.forgot-password.modern',
      //                     title: 'Modern',
      //                     type: 'basic',
      //                     link: '/pages/authentication/forgot-password/modern',
      //                 },
      //                 {
      //                     id: 'pages.authentication.forgot-password.modern-reversed',
      //                     title: 'Modern Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/forgot-password/modern-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.forgot-password.split-screen',
      //                     title: 'Split Screen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/forgot-password/split-screen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.forgot-password.split-screen-reversed',
      //                     title: 'Split Screen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/forgot-password/split-screen-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.forgot-password.fullscreen',
      //                     title: 'Fullscreen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/forgot-password/fullscreen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.forgot-password.fullscreen-reversed',
      //                     title: 'Fullscreen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/forgot-password/fullscreen-reversed',
      //                 },
      //             ],
      //         },
      //         {
      //             id: 'pages.authentication.reset-password',
      //             title: 'Reset password',
      //             type: 'collapsable',
      //             link: '/pages/authentication/reset-password',
      //             children: [
      //                 {
      //                     id: 'pages.authentication.reset-password.classic',
      //                     title: 'Classic',
      //                     type: 'basic',
      //                     link: '/pages/authentication/reset-password/classic',
      //                 },
      //                 {
      //                     id: 'pages.authentication.reset-password.modern',
      //                     title: 'Modern',
      //                     type: 'basic',
      //                     link: '/pages/authentication/reset-password/modern',
      //                 },
      //                 {
      //                     id: 'pages.authentication.reset-password.modern-reversed',
      //                     title: 'Modern Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/reset-password/modern-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.reset-password.split-screen',
      //                     title: 'Split Screen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/reset-password/split-screen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.reset-password.split-screen-reversed',
      //                     title: 'Split Screen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/reset-password/split-screen-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.reset-password.fullscreen',
      //                     title: 'Fullscreen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/reset-password/fullscreen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.reset-password.fullscreen-reversed',
      //                     title: 'Fullscreen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/reset-password/fullscreen-reversed',
      //                 },
      //             ],
      //         },
      //         {
      //             id: 'pages.authentication.unlock-session',
      //             title: 'Unlock session',
      //             type: 'collapsable',
      //             link: '/pages/authentication/unlock-session',
      //             children: [
      //                 {
      //                     id: 'pages.authentication.unlock-session.classic',
      //                     title: 'Classic',
      //                     type: 'basic',
      //                     link: '/pages/authentication/unlock-session/classic',
      //                 },
      //                 {
      //                     id: 'pages.authentication.unlock-session.modern',
      //                     title: 'Modern',
      //                     type: 'basic',
      //                     link: '/pages/authentication/unlock-session/modern',
      //                 },
      //                 {
      //                     id: 'pages.authentication.unlock-session.modern-reversed',
      //                     title: 'Modern Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/unlock-session/modern-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.unlock-session.split-screen',
      //                     title: 'Split Screen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/unlock-session/split-screen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.unlock-session.split-screen-reversed',
      //                     title: 'Split Screen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/unlock-session/split-screen-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.unlock-session.fullscreen',
      //                     title: 'Fullscreen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/unlock-session/fullscreen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.unlock-session.fullscreen-reversed',
      //                     title: 'Fullscreen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/unlock-session/fullscreen-reversed',
      //                 },
      //             ],
      //         },
      //         {
      //             id: 'pages.authentication.confirmation-required',
      //             title: 'Confirmation required',
      //             type: 'collapsable',
      //             link: '/pages/authentication/confirmation-required',
      //             children: [
      //                 {
      //                     id: 'pages.authentication.confirmation-required.classic',
      //                     title: 'Classic',
      //                     type: 'basic',
      //                     link: '/pages/authentication/confirmation-required/classic',
      //                 },
      //                 {
      //                     id: 'pages.authentication.confirmation-required.modern',
      //                     title: 'Modern',
      //                     type: 'basic',
      //                     link: '/pages/authentication/confirmation-required/modern',
      //                 },
      //                 {
      //                     id: 'pages.authentication.confirmation-required.modern-reversed',
      //                     title: 'Modern Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/confirmation-required/modern-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.confirmation-required.split-screen',
      //                     title: 'Split Screen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/confirmation-required/split-screen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.confirmation-required.split-screen-reversed',
      //                     title: 'Split Screen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/confirmation-required/split-screen-reversed',
      //                 },
      //                 {
      //                     id: 'pages.authentication.confirmation-required.fullscreen',
      //                     title: 'Fullscreen',
      //                     type: 'basic',
      //                     link: '/pages/authentication/confirmation-required/fullscreen',
      //                 },
      //                 {
      //                     id: 'pages.authentication.confirmation-required.fullscreen-reversed',
      //                     title: 'Fullscreen Reversed',
      //                     type: 'basic',
      //                     link: '/pages/authentication/confirmation-required/fullscreen-reversed',
      //                 },
      //             ],
      //         },
      //     ],
      // },
      // {
      //     id: 'pages.error',
      //     title: 'Error',
      //     type: 'collapsable',
      //     icon: 'heroicons_outline:exclamation-circle',
      //     children: [
      //         {
      //             id: 'pages.error.404',
      //             title: '404',
      //             type: 'basic',
      //             link: '/pages/error/404',
      //         },
      //         {
      //             id: 'pages.error.500',
      //             title: '500',
      //             type: 'basic',
      //             link: '/pages/error/500',
      //         },
      //     ],
      // },
      // {
      //     id: 'pages.invoice',
      //     title: 'Invoice',
      //     type: 'collapsable',
      //     icon: 'heroicons_outline:calculator',
      //     children: [
      //         {
      //             id: 'pages.invoice.printable.compact',
      //             title: 'Compact',
      //             type: 'basic',
      //             link: '/pages/invoice/printable/compact',
      //         },
      //         {
      //             id: 'pages.invoice.printable.modern',
      //             title: 'Modern',
      //             type: 'basic',
      //             link: '/pages/invoice/printable/modern',
      //         },
      //     ],
      // },
      // {
      //     id: 'pages.profile',
      //     title: 'Profile',
      //     type: 'basic',
      //     icon: 'heroicons_outline:user-circle',
      //     link: '/pages/profile',
      // },
      // {
      //     id: 'pages.settings',
      //     title: 'Settings',
      //     type: 'basic',
      //     icon: 'heroicons_outline:cog-8-tooth',
      //     link: '/pages/settings',
      // },
    ],
  },
  // {
  //     id: 'system-settings',
  //     title: 'System Settings',
  //     subtitle: '',
  //     type: 'group',
  //     icon: 'heroicons_outline:rectangle-stack',
  //     children: [
  //         {
  //             id: 'user-interface.advanced-search',
  //             title: 'Advanced Search',
  //             type: 'basic',
  //             icon: 'heroicons_outline:magnifying-glass-circle',
  //             link: '/ui/advanced-search',
  //         },
  //         {
  //             id: 'user-interface.colors',
  //             title: 'Colors',
  //             type: 'basic',
  //             icon: 'heroicons_outline:swatch',
  //             link: '/ui/colors',
  //         },
  //         {
  //             id: 'user-interface.confirmation-dialog',
  //             title: 'Confirmation Dialog',
  //             type: 'basic',
  //             icon: 'heroicons_outline:question-mark-circle',
  //             link: '/ui/confirmation-dialog',
  //         },
  //     ],
  // },
  {
    id: "divider-1",
    type: "divider",
  },
];
export const compactNavigation: FuseNavigationItem[] = [
  {
    id: "dashboards",
    title: "Dashboards",
    tooltip: "Dashboards",
    type: "aside",
    icon: "heroicons_outline:home",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "apps",
    title: "Apps",
    tooltip: "Apps",
    type: "aside",
    icon: "heroicons_outline:qrcode",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "pages",
    title: "Pages",
    tooltip: "Pages",
    type: "aside",
    icon: "heroicons_outline:document-duplicate",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "user-interface",
    title: "UI",
    tooltip: "UI",
    type: "aside",
    icon: "heroicons_outline:rectangle-stack",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "navigation-features",
    title: "Navigation",
    tooltip: "Navigation",
    type: "aside",
    icon: "heroicons_outline:bars-3",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
];
export const futuristicNavigation: FuseNavigationItem[] = [
  {
    id: "dashboards",
    title: "DASHBOARDS",
    type: "group",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "apps",
    title: "APPS",
    type: "group",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "others",
    title: "OTHERS",
    type: "group",
  },
  {
    id: "pages",
    title: "Pages",
    type: "aside",
    icon: "heroicons_outline:document-duplicate",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "user-interface",
    title: "User Interface",
    type: "aside",
    icon: "heroicons_outline:rectangle-stack",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
];
export const horizontalNavigation: FuseNavigationItem[] = [
  {
    id: "dashboards",
    title: "Dashboards",
    type: "group",
    icon: "heroicons_outline:home",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "apps",
    title: "Apps",
    type: "group",
    icon: "heroicons_outline:qrcode",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "pages",
    title: "Pages",
    type: "group",
    icon: "heroicons_outline:document-duplicate",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "user-interface",
    title: "UI",
    type: "group",
    icon: "heroicons_outline:rectangle-stack",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "navigation-features",
    title: "Misc",
    type: "group",
    icon: "heroicons_outline:bars-3",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
];
