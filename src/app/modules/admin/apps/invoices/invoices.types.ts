export interface IInvoice {
  id: string;
  date: string;
  dueDate?: string;

  billTo: {
    id?: string;
    name: string;
    phoneNumber: {
      code: string;
      number: string;
    };
    email?: string;
    address?: string;
    postCode?:string;
  };

  carInfo: {
    id?: string;
    regNo: string;
    regYear:string;
    make: string;
    model: string;
    engineType:string;
    transmission:string;
    fuelType:string;
    mileage:string;
    color:string;
    vin:string;
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
}