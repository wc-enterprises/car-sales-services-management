export interface ICar {
  id: string;
  regNo: string;
  make: string; // TODO: Make type of all make in UK
  model: string; // TODO: Make type of all models in UK

  customerId: string;
  nextServiceDate?: number;
  motValidTill?: number;
  insuranceValidTill?: number;
  roadTaxValidTill?: number;

  color?: string;
  fuelType?: T_FUEL_TYPE;
  vinNumber?: string; // Chasis number
  regYear?: string;
  transmission?: string;
  mileage?: number;
}

export type T_FUEL_TYPE =
  | "Petrol"
  | "Diesel"
  | "CNG"
  | "Bio-Diesel"
  | "LPG"
  | "Electric";

export interface InventoryPagination {
  length: number;
  size: number;
  page: number;
  lastPage: number;
  startIndex: number;
  endIndex: number;
}
