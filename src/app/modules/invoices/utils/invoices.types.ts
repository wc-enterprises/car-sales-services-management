import { T_FUEL_TYPE } from "../../cars/cars.types";
import { IAddress } from "../../contacts/contacts.types";

export type IInvoiceType = "SALE" | "SERVICE";
export interface IInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: number;
  date: number;
  type: IInvoiceType;

  billTo: {
    id?: string;
    invoiceNumber: string;
    name: string;
    phoneNumber: {
      code: string;
      number: string;
    };
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    country: string;
    postalCode: string;
    address?: IAddress;
    postCode: string;
    city: string;
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
    fuelType: T_FUEL_TYPE;
    mileage: string;
    color: string;
    vin: string;
    nextServiceDate?: string;
    motValidTill?: string;
    insuranceValidTill?: string;
    roadTaxValidTill?: string;
  };

  services: IService[];

  tax: {
    unit: "percentage" | "amount";
    value: number;
  };
  discount: {
    unit: "percentage" | "amount";
    value: number;
  };
  subtotal?: number;
  total: number;
}

export type TInvoiceTimeFilter = "1m" | "3m" | "6m" | "cfy" | "lfy" | "dr" | "";
export type TInvoiceTypeFilter = "ALL" | "SALE" | "SERVICE" | "";

/** For a SALE bill, the data in the fields are different and mentioned in a comment on the side */
export interface IService {
  id: string; // Make
  item: string; // Model
  quantity: number; // Defaulted to 1
  price: number; // Price
  total: number; // Reg No
}
