import { FuseNavigationItem } from "@fuse/components/navigation";

export const defaultNavigation: FuseNavigationItem[] = [
  {
    id: "analytics",
    title: "Home",
    subtitle: "",
    type: "group",
    icon: "heroicons_outline:home",
    children: [
      {
        id: "dashboards.analytics",
        title: "Dashboard",
        type: "basic",
        icon: "heroicons_outline:chart-pie",
        link: "/home/dashboard",
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
    ],
  },
  {
    id: "divider-1",
    type: "divider",
  },
];
