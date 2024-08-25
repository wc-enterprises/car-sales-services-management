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
  increment,
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
  //   private _pagination: BehaviorSubject<InventoryPagination | null> =
  //     new BehaviorSubject(null);
  private _invoice: BehaviorSubject<IInvoice | null> =
    new BehaviorSubject<IInvoice | null>(null);
  private _invoices: BehaviorSubject<IInvoice[] | null> = new BehaviorSubject<
    IInvoice[] | null
  >(null);

  private _unsubscribers: Unsubscribe[] = [];
  private invoiceData: any;
  getInvoiceData(): any {
    return this.invoiceData;
  }

  setInvoiceData(data: any): void {
    this.invoiceData = data;
  }
  /**
   * Constructor
   */
  constructor(private db: Database) {
    this.getInvoices("");
  }
  destructor() {
    this._unsubscribers.forEach((item) => {
      item();
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for pagination
   */
  //   get pagination$(): Observable<InventoryPagination> {
  //     return this._pagination.asObservable();
  //   }

  /**
   * Getter for product
   */
  get invoice$(): Observable<IInvoice> {
    return this._invoice
      .asObservable()
      .pipe(filter((invoices): invoices is IInvoice => invoices !== null));
  }

  /**
   * Getter for products
   */
  get invoices$(): Observable<IInvoice[]> {
    return this._invoices
      .asObservable()
      .pipe(filter((v): v is IInvoice[] => v !== null));
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get invoices
   */
  getInvoices(
    timeFilter?: TInvoiceTimeFilter,
    typeFilter?: TInvoiceTypeFilter,
    additionalData?: {
      dateRange?: {
        startDate: number;
        endDate: number;
      };
    }
  ) {
    // TODO: Include pagination to this function.

    const invoicesRef = ref(this.db, "invoices");
    const unsubsriber = onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();

      let invoices: IInvoice[] = [];
      if (!data) {
        this._invoices.next(invoices);
        return invoices;
      }

      Object.keys(data).forEach((key) => {
        const val = data[key];
        invoices.push(val);
      });

      if (timeFilter && timeFilter != "all") {
        const { now, pastDate } = getNowAndPastDateBasedOnFilterVal(
          timeFilter,
          additionalData
        );

        invoices = invoices.filter((invoice) => {
          return invoice.date >= pastDate && invoice.date <= now;
        });
      }

      if (typeFilter && typeFilter !== "ALL") {
        invoices = invoices.filter((invoice) => invoice.type === typeFilter);
      }

      // Sort invoices based on the created date (latest first)
      invoices = invoices.sort((a, b) => b.date - a.date);

      this._invoices.next(invoices);
    });

    this._unsubscribers.push(unsubsriber);
  }

  async countInvoices(): Promise<number> {
    try {
      const invoicesRef = await ref(this.db, "invoices");
      const snapshot = await get(invoicesRef);
      const data = snapshot.val();

      let count = 0;
      if (data) {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            count++;
          }
        }
      }

      return count;
    } catch (err) {
      console.log(err, "errored in count invoices");
      return 0;
    }
  }

  async getInvoiceByIdOnce(id: string) {
    const invoicesRef = ref(this.db, `invoices/${id}`);
    const snapshot = await get(invoicesRef);
    return snapshot.val();
  }

  /**
   * Get product by id
   */
  getInvoiceById(id: string): Observable<IInvoice> {
    return this._invoices.pipe(
      take(1),
      map((invoices) => {
        // Find the product
        const invoice = invoices
          ? invoices.find((item) => item.id === id) || null
          : null;

        // Update the product
        this._invoice.next(invoice);

        // Return the product
        return invoice;
      }),
      switchMap((invoice) => {
        if (!invoice) {
          return throwError("Could not found invoice with id of " + id + "!");
        }

        return of(invoice);
      })
    );
  }

  /**
   * Create invoice
   */
  async createInvoice(invoiceData: Omit<IInvoice, "id">): Promise<string> {
    const id = FuseMockApiUtils.guid();
    await set(ref(this.db, "invoices/" + id), { id, ...invoiceData });
    return id;
  }

  /**
   * Update invoice
   *
   * @param id
   * @param invoice
   */
  async updateInvoice(id: string, updatedInvoice: IInvoice): Promise<IInvoice> {
    await set(ref(this.db, "invoices/" + id), updatedInvoice);

    this._invoice.next(updatedInvoice);

    return updatedInvoice;
  }

  /**
   * Delete the invoice
   *
   * @param id
   */
  async deleteInvoice(id: string): Promise<boolean> {
    try {
      await set(ref(this.db, "invoices/" + id), null);
      return true;
    } catch (err: any) {
      console.log("An error occured while deleting the invoice", err.message);
      return false;
    }
  }
  private invoiceDataSubject = new BehaviorSubject<any>(null);

  nameOfContact: string[] = [];
  numberOfConcatact: string[] = [];
  nameOfMake: string[] = [];
  async getNameOfContacts() {
    const contactsRef = ref(this.db, "contacts");
    // Fetch the data once
    const snapshot = await get(contactsRef);
    const data = snapshot.val();

    // Clear the existing nameOfContact array
    this.nameOfContact = [];

    // Iterate through the data and push names to nameOfContact array
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const val = data[key];
        this.nameOfContact.push(val.name);
      }
    }
    return this.nameOfContact;
  }

  async getNumberOfContacts(): Promise<string[]> {
    const contactsRef = ref(this.db, "contacts");

    // Fetch the data once
    const snapshot = await get(contactsRef);
    const data = snapshot.val();

    if (!data) return [];

    // Clear the existing nameContact array
    const contacts: Contact[] = [];

    // Iterate through the data and push contacts to nameContact array
    Object.keys(data).forEach((key) => {
      const val = data[key];
      contacts.push(val);
    });

    return contacts
      .map((contact) => {
        if (contact.phoneNumbers && contact.phoneNumbers.length) {
          return contact.phoneNumbers.map((item) => item.phoneNumber);
        }
        return [];
      })
      .flat()
      .filter(Boolean);
  }

  async getRegNo() {
    const carsRef = ref(this.db, "cars");
    // Fetch the data once
    const snapshot = await get(carsRef);
    const data = snapshot.val();
    // Clear the existing nameOfContact array
    let regNo = [];
    // Iterate through the data and push regNo to regNo array
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const val = data[key];
        regNo.push(val.regNo);
      }
    }
    return regNo;
  }

  async makeName() {
    const makeRef = ref(this.db, "Makes");
    // Fetch the data once
    const snapshot = await get(makeRef);
    const data = snapshot.val();
    // Clear the existing nameOfContact array
    this.nameOfMake = [];

    // Iterate through the data and push names to nameOfContact array
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this.nameOfMake.push(key);
      }
    }

    return this.nameOfMake;
  }

  async makeMap() {
    const makeRef = ref(this.db, "Makes");
    // Fetch the data once
    const snapshot = await get(makeRef);
    const data = snapshot.val();

    return data;
  }

  async mapRegNo(regNo: string): Promise<ICar | null> {
    const carsRef = ref(this.db, "cars");

    // Fetch the data once
    const snapshot = await get(carsRef);
    const data = snapshot.val();

    for (const key in data) {
      const val = data[key];

      if (
        val.regNo.replace(/[-\s]+/g, "").toLowerCase() ===
        regNo.replace(/[-\s]+/g, "").toLowerCase()
      )
        return val;
    }
    return null;
  }

  async mapName(name: string): Promise<Contact | null> {
    if (!name) return null;

    const contactsRef = ref(this.db, "contacts");

    // Fetch the data once
    const snapshot = await get(contactsRef);
    const data = snapshot.val();

    for (const key in data) {
      const val = data[key];
      if (val.name.toLowerCase() === name.toLowerCase()) return val;
    }
    return null;
  }

  incrementTotalInvoicesCreated = async () => {
    const totalInvoicesCreatedSoFarRef = ref(
      this.db,
      "totalInvoicesCreatedSoFar"
    );
    const snapshot = await get(totalInvoicesCreatedSoFarRef);
    const data = snapshot.val();
    const totalInvoicesCreatedSoFar = data ? +data + 1 : 0;
    await update(ref(this.db), { totalInvoicesCreatedSoFar });
  };

  totalInvoicesCreatedSoFar = async (): Promise<number> => {
    const totalInvoicesCreatedSoFarRef = ref(
      this.db,
      "totalInvoicesCreatedSoFar"
    );
    const snapshot = await get(totalInvoicesCreatedSoFarRef);
    const data = snapshot.val();
    return parseInt(data);
  };

  storeTotalInvoiceCreatedIfNotPresent = async () => {
    const totalInvoicesCreatedSoFarRef = ref(
      this.db,
      "totalInvoicesCreatedSoFar"
    );
    const snapshot = await get(totalInvoicesCreatedSoFarRef);
    const data = snapshot.val();

    if (!data) {
      const totalInvoicesCreatedSoFar: number = await this.countInvoices();

      await update(ref(this.db), { totalInvoicesCreatedSoFar });
    }
  };

  searchInvoices(query: string) {
    console.log("Received query string", query);
    const dbRef = ref(this.db);

    return get(child(dbRef, "invoices"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const dbInvoices = snapshot.val();

          // Frame cars for component
          let invoices: IInvoice[] = [];
          Object.keys(dbInvoices).forEach((key) => {
            const val = dbInvoices[key];
            invoices.push(val);
          });

          invoices = invoices.filter((invoice) => {
            if (invoice.type === "SALE") {
              if (
                (invoice.services[0]?.total as unknown as string)
                  ?.toLowerCase()
                  .replace(/\s/g, "")
                  .includes(query.toLowerCase().replace(/\s/g, "")) ||
                invoice.services[0]?.id
                  ?.toLowerCase()
                  .includes(query.toLowerCase()) ||
                invoice.services[0]?.item
                  ?.toLowerCase()
                  .includes(query.toLowerCase())
              )
                return true;
            }

            if (
              invoice.carInfo?.regNo
                ?.toLowerCase()
                .replace(/\s/g, "")
                .includes(query.toLowerCase().replace(/\s/g, "")) ||
              invoice.carInfo?.make
                ?.toLowerCase()
                .includes(query.toLowerCase()) ||
              invoice.carInfo?.model
                ?.toLowerCase()
                .includes(query.toLowerCase()) ||
              invoice.billTo?.name
                ?.toLowerCase()
                .replace(/\s/g, "")
                .includes(query.toLowerCase().replace(/\s/g, ""))
            ) {
              return true;
            }
            return false;
          });

          this._invoices.next(invoices);
          return true;
        } else {
          console.log("No data available");
          return false;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
