export interface Contact {
  id: string;
  avatar?: string | null;
  background?: string | null;
  name: string;
  emails?: {
    email: string;
    label: string;
  }[];
  phoneNumbers?: {
    country: string;
    phoneNumber: string;
    label: string;
  }[];
  address?: IAddress;
  notes?: string | null;

  createdDate: number;
}

export interface Country {
  id: string;
  iso: string;
  name: string;
  code: string;
  flagImagePos: string;
}

export interface Tag {
  id?: string;
  title?: string;
}

export interface IAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  postalCode: string;
}
