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
  stock: number | null;

  basePrice: number | null;
  taxAmount: number | null;
  discount: number | null;
  sellingPrice: number | null;

  weight: number | null;
  thumbnail: string;
  images: string[];
  active: boolean;
  date: number;
}
