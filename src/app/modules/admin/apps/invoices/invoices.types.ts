import { IAddress } from "../contacts/contacts.types";

export type IInvoiceType = "SALE" | "SERVICE";
export interface IInvoice {
  id: string;
  invoiceNumber: string;

  date: number;
  type?: IInvoiceType;

  billTo: {
    id?: string;
    invoiceNumber: string;
    name: string;
    phoneNumber: {
      code: string;
      number: string;
    };
    email?: string;
    address?: IAddress;
    postCode?: string;
    city?: string;
    createdDate: number;
  };

  carInfo?: {
    id?: string;
    regNo: string;
    regYear: string;
    make: string;
    model: string;
    engineType: string;
    transmission: string;
    fuelType: string;
    mileage: string;
    color: string;
    vin: string;
    nextServiceDate?: string;
    motValidTill?: string;
    insuranceValidTill?: string;
    roadTaxValidTill?: string;
  };

  services: {
    id: string;
    item: string;
    quantity: number;
    price: number;
    total: string;
  }[];
  tax: {
    unit: "percentage" | "amount";
    value: number;
  };
  discount: {
    unit: "percentage" | "amount";
    value: number;
  };

  total: number;
}

export type TInvoiceTimeFilter = "1m" | "3m" | "6m" | "cfy" | "lfy" | "dr" | "";
export type TInvoiceTypeFilter = "ALL" | "SALE" | "SERVICE" | "";
