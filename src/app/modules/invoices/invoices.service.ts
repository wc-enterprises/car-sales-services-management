import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  of,
  switchMap,
  take,
  throwError,
} from "rxjs";
import {
  IInvoice,
  TInvoiceTimeFilter,
  TInvoiceTypeFilter,
} from "./utils/invoices.types";
import {
  child,
  Database,
  get,
  onValue,
  ref,
  set,
  Unsubscribe,
  update,
} from "@angular/fire/database";
import { FuseMockApiUtils } from "@fuse/lib/mock-api";
import { Contact } from "../contacts/contacts.types";
import { ICar } from "../cars/cars.types";
import { getNowAndPastDateBasedOnFilterVal } from "./utils/util";

@Injectable({ providedIn: "root" })
export class InvoicesService {
  private _invoice = new BehaviorSubject<IInvoice | null>(null);
  private _invoices = new BehaviorSubject<IInvoice[] | null>(null);
  private _unsubscribers: Unsubscribe[] = [];

  private invoiceData: any;
  private nameOfContact: string[] = [];
  private nameOfMake: string[] = [];

  constructor(private db: Database) {
    this.getInvoices("");
  }

  destructor(): void {
    this._unsubscribers.forEach((unsubscribe) => unsubscribe());
  }

  // Accessors
  get invoice$(): Observable<IInvoice> {
    return this._invoice
      .asObservable()
      .pipe(filter((invoice): invoice is IInvoice => invoice !== null));
  }

  get invoices$(): Observable<IInvoice[]> {
    return this._invoices
      .asObservable()
      .pipe(filter((invoices): invoices is IInvoice[] => invoices !== null));
  }

  getInvoiceData(): any {
    return this.invoiceData;
  }

  setInvoiceData(data: any): void {
    this.invoiceData = data;
  }

  // Public Methods

  /**
   * Fetch and filter invoices
   */
  getInvoices(
    timeFilter: TInvoiceTimeFilter = "all",
    typeFilter: TInvoiceTypeFilter = "ALL",
    additionalData?: { dateRange?: { startDate: number; endDate: number } }
  ): void {
    const invoicesRef = ref(this.db, "invoices");
    const unsubsriber = onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      let invoices: IInvoice[] = data ? Object.values(data) : [];

      if (timeFilter !== "all") {
        const { now, pastDate } = getNowAndPastDateBasedOnFilterVal(
          timeFilter,
          additionalData
        );
        invoices = invoices.filter(
          (invoice) => invoice.date >= pastDate && invoice.date <= now
        );
      }

      if (typeFilter !== "ALL") {
        invoices = invoices.filter((invoice) => invoice.type === typeFilter);
      }

      invoices.sort((a, b) => b.date - a.date);
      this._invoices.next(invoices);
    });

    this._unsubscribers.push(unsubsriber);
  }

  /**
   * Count total number of invoices
   */
  async countInvoices(): Promise<number> {
    try {
      const invoicesRef = ref(this.db, "invoices");
      const snapshot = await get(invoicesRef);
      const data = snapshot.val();
      return data ? Object.keys(data).length : 0;
    } catch (err) {
      console.error("Error counting invoices", err);
      return 0;
    }
  }

  /**
   * Fetch invoice by ID
   */
  async getInvoiceByIdOnce(id: string): Promise<IInvoice | null> {
    const invoiceRef = ref(this.db, `invoices/${id}`);
    const snapshot = await get(invoiceRef);
    return snapshot.val();
  }

  getInvoiceById(id: string): Observable<IInvoice> {
    return this._invoices.pipe(
      take(1),
      map((invoices) => invoices?.find((item) => item.id === id) || null),
      switchMap((invoice) =>
        invoice ? of(invoice) : throwError(`Invoice with ID ${id} not found!`)
      )
    );
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: Omit<IInvoice, "id">): Promise<string> {
    const id = FuseMockApiUtils.guid();
    await set(ref(this.db, `invoices/${id}`), { id, ...invoiceData });
    return id;
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(id: string, updatedInvoice: IInvoice): Promise<IInvoice> {
    await set(ref(this.db, `invoices/${id}`), updatedInvoice);
    this._invoice.next(updatedInvoice);
    return updatedInvoice;
  }

  /**
   * Delete an invoice by ID
   */
  async deleteInvoice(id: string): Promise<boolean> {
    try {
      await set(ref(this.db, `invoices/${id}`), null);
      return true;
    } catch (err) {
      console.error("Error deleting invoice", err);
      return false;
    }
  }

  /**
   * Retrieve contacts and make name data
   */
  async getNameOfContacts(): Promise<string[]> {
    const contactsRef = ref(this.db, "contacts");
    const snapshot = await get(contactsRef);
    const data: Record<string, Contact> = snapshot.val();
    this.nameOfContact = data
      ? Object.values(data).map((contact: Contact) => contact.name)
      : [];
    return this.nameOfContact;
  }

  async getNumberOfContacts(): Promise<string[]> {
    const contactsRef = ref(this.db, "contacts");
    const snapshot = await get(contactsRef);
    const data: Record<string, Contact> = snapshot.val();
    return data
      ? Object.values(data).flatMap(
          (contact) =>
            contact.phoneNumbers?.map((phone) => phone.phoneNumber) ?? []
        )
      : [];
  }

  async getRegNo(): Promise<string[]> {
    const carsRef = ref(this.db, "cars");
    const snapshot = await get(carsRef);
    const data: Record<string, ICar> = snapshot.val();
    return data ? Object.values(data).map((car) => car.regNo) : [];
  }

  async makeName(): Promise<string[]> {
    const makeRef = ref(this.db, "Makes");
    const snapshot = await get(makeRef);
    const data = snapshot.val();
    this.nameOfMake = data ? Object.keys(data) : [];
    return this.nameOfMake;
  }

  async makeMap(): Promise<any> {
    const makeRef = ref(this.db, "Makes");
    const snapshot = await get(makeRef);
    return snapshot.val();
  }

  async mapRegNo(regNo: string): Promise<ICar | null> {
    const carsRef = ref(this.db, "cars");
    const snapshot = await get(carsRef);
    const data: Record<string, ICar> = snapshot.val();
    return data
      ? Object.values(data).find(
          (car) =>
            car.regNo.replace(/[-\s]+/g, "").toLowerCase() ===
            regNo.replace(/[-\s]+/g, "").toLowerCase()
        ) || null
      : null;
  }

  async mapName(name: string): Promise<Contact | null> {
    if (!name) return null;
    const contactsRef = ref(this.db, "contacts");
    const snapshot = await get(contactsRef);
    const data: Record<string, Contact> = snapshot.val();
    return data
      ? Object.values(data).find(
          (contact) => contact.name.toLowerCase() === name.toLowerCase()
        ) || null
      : null;
  }

  async incrementTotalInvoicesCreated(): Promise<void> {
    const totalRef = ref(this.db, "totalInvoicesCreatedSoFar");
    const snapshot = await get(totalRef);
    const total = snapshot.val() ? +snapshot.val() + 1 : 1;
    await update(ref(this.db), { totalInvoicesCreatedSoFar: total });
  }

  async totalInvoicesCreatedSoFar(): Promise<number> {
    const totalRef = ref(this.db, "totalInvoicesCreatedSoFar");
    const snapshot = await get(totalRef);
    return parseInt(snapshot.val() || "0", 10);
  }

  async storeTotalInvoiceCreatedIfNotPresent(): Promise<void> {
    const totalRef = ref(this.db, "totalInvoicesCreatedSoFar");
    const snapshot = await get(totalRef);
    if (!snapshot.val()) {
      const count = await this.countInvoices();
      await update(ref(this.db), { totalInvoicesCreatedSoFar: count });
    }
  }

  /**
   * Search invoices based on query string
   */
  async searchInvoices(query: string): Promise<boolean> {
    const dbRef = ref(this.db);
    const snapshot = await get(child(dbRef, "invoices"));
    if (snapshot.exists()) {
      const invoices = Object.values(
        snapshot.val() as Record<string, IInvoice>
      ).filter((invoice: IInvoice) => {
        return (
          (invoice.type === "SALE" &&
            (invoice.services[0]?.total
              ?.toString()
              .toLowerCase()
              .includes(query.toLowerCase()) ||
              invoice.services[0]?.id
                ?.toLowerCase()
                .includes(query.toLowerCase()) ||
              invoice.services[0]?.item
                ?.toLowerCase()
                .includes(query.toLowerCase()))) ||
          invoice.carInfo?.regNo
            ?.replace(/\s/g, "")
            .toLowerCase()
            .includes(query.replace(/\s/g, "").toLowerCase()) ||
          invoice.carInfo?.make?.toLowerCase().includes(query.toLowerCase()) ||
          invoice.carInfo?.model?.toLowerCase().includes(query.toLowerCase()) ||
          invoice.billTo?.name
            ?.replace(/\s/g, "")
            .toLowerCase()
            .includes(query.replace(/\s/g, "").toLowerCase())
        );
      });

      this._invoices.next(invoices);
      return true;
    } else {
      console.error("No data found");
      return false;
    }
  }
}
