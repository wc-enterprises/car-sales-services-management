import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from "rxjs";
import { InventoryProduct } from "./inventory.types";
import {
  Database,
  get,
  onValue,
  ref,
  set,
  Unsubscribe,
} from "@angular/fire/database";
import { generateUniqueId } from "../utils/util";

@Injectable({ providedIn: "root" })
export class InventoryService {
  // Private

  private _product: BehaviorSubject<InventoryProduct | null> =
    new BehaviorSubject<InventoryProduct | null>(null);
  private _products: BehaviorSubject<InventoryProduct[] | null> =
    new BehaviorSubject<InventoryProduct[] | null>(null);
  private _unsubscribers: Unsubscribe[] = [];

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient, private db: Database) {}
  destructor() {
    this._unsubscribers.forEach((item) => {
      item();
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for product
   */
  get product$(): Observable<InventoryProduct> {
    return this._product.asObservable() as Observable<InventoryProduct>;
  }

  /**
   * Getter for products
   */
  get products$(): Observable<InventoryProduct[]> {
    return this._products.asObservable() as Observable<InventoryProduct[]>;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get products
   */
  getProducts() {
    // TODO: Include pagination to this function

    const productsRef = ref(this.db, "products");
    const unsubsriber = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();

      const products: InventoryProduct[] = [];
      if (!data) {
        this._products.next(products);
        return;
      }

      Object.keys(data).forEach((key) => {
        const product = data[key];
        products.push(product);
      });

      const sortedProducts = products.sort((a, b) => b.date - a.date);

      this._products.next(sortedProducts);
    });

    this._unsubscribers.push(unsubsriber);
  }

  /**
   * Get product by id
   */
  getProductById(id: string): Observable<InventoryProduct> {
    return this._products.pipe(
      take(1),
      map((products) => {
        // Find the product
        const product = products
          ? products.find((item) => item.id === id) || null
          : null;

        // Update the product
        this._product.next(product);

        // Return the product
        return product;
      }),
      switchMap((product) => {
        if (!product) {
          return throwError("Could not found product with id of " + id + "!");
        }

        return of(product);
      })
    );
  }

  /**
   * Get product by id once
   */
  async getProductByIdOnce(id: string): Promise<InventoryProduct> {
    const productRef = ref(this.db, `products/${id}`);
    const snapshot = await get(productRef);
    return snapshot.val();
  }

  /**
   * Get products once
   */
  async getProductsOnce(): Promise<InventoryProduct[]> {
    const productsRef = ref(this.db, "products");
    const snapshot = await get(productsRef);
    return snapshot.val();
  }

  /**
   * Create noop product
   */
  createNoopProduct(productFromDraft?: InventoryProduct) {
    return this.products$.pipe(
      take(1),
      switchMap((products) => {
        let newProduct: InventoryProduct = {
          id: generateUniqueId(),
          name: "",
          description: "",
          images: [],
          stock: null,
          thumbnail: "",
          vendor: "",
          weight: null,
          barcode: "",
          brand: "",
          category: "",
          sku: "",
          tags: [],
          basePrice: null,
          discount: null,
          taxAmount: null,
          sellingPrice: null,
          active: true,
          date: Date.now(),
        };
        if (productFromDraft) {
          newProduct = { ...productFromDraft };
        }

        this._products.next([newProduct, ...products]);

        return of(newProduct);
      })
    );
  }

  /**
   * Create product
   */
  async createProduct(product: Omit<InventoryProduct, "id">): Promise<string> {
    const id = generateUniqueId();
    await set(ref(this.db, "products/" + id), { id, ...product });
    return id;
  }

  /**
   * Update product
   *
   * @param id
   * @param product
   */
  async updateProduct(
    id: string,
    product: Partial<InventoryProduct>
  ): Promise<InventoryProduct> {
    const existingVersion: InventoryProduct = await this.getProductByIdOnce(id);
    const newVersion: InventoryProduct = { ...existingVersion, ...product };

    await set(ref(this.db, "products/" + id), newVersion);

    this._product.next(newVersion);

    return newVersion;
  }

  /**
   * Delete the product
   *
   * @param id
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await set(ref(this.db, "products/" + id), null);

      await this.getProducts();

      return true;
    } catch (err: any) {
      console.log("An error occured while deleting the product", err.message);
      return false;
    }
  }
}
