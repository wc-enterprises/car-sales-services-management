import { IAddress } from "../contacts/contacts.types";

export type IInvoiceType = "SALE" | "SERVICE";
export interface IInvoice {
  id: string;
  date: string;
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
    unit: string;
    value: number;
  };
  discount: {
    unit: string;
    value: number;
  };
}
