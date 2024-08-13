import { T_FUEL_TYPE } from "app/modules/cars/cars.types";

export interface Invoice {
  id: string;
  billTo: {
    name: string;
    phoneNumber: {
      code: string;
      number: string;
    };
    email: {
      email: string;
      label: string;
    };
    addressLine1: string;
    addressLine2: string;
    country: string;
    city: string;
    postalCode: string;
  };
  carInfo?: {
    id: string;
    regNo: string;
    make: string;
    model: string;
    color: string;
    engineType: string;
    fuelType: T_FUEL_TYPE;
    insuranceValidTill: string;
    mileage: string;
    motValidTill: string;
    nextServiceDate: string;
    regYear: string;
    roadTaxValidTill: string;
    transmission: string;
    vin: string;
  };
  services: {
    id: string;
    item: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  tax: {
    unit: string;
    value: number;
  };
  discount: {
    unit: string;
    value: number;
  };
  invoiceDate: string;
  dueDate: string;
}
