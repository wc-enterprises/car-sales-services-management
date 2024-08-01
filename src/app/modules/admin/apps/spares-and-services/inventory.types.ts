export interface InventoryProduct {
  id: string;
  category?: string;
  name: string;
  description?: string;

  tags?: string[];
  sku?: string | null;
  barcode?: string | null;
  brand?: string | null;
  vendor: string | null;
  stock: number;

  basePrice: number;
  taxAmount: number;
  discount: number;
  sellingPrice: number;

  weight: number;
  thumbnail: string;
  images: string[];
  active: boolean;
  date: number;
}
