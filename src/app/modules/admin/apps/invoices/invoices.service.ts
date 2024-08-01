import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
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
} from "./invoices.types";
import {
  Database,
  get,
  onValue,
  ref,
  set,
  Unsubscribe,
} from "@angular/fire/database";
import { FuseMockApiUtils } from "@fuse/lib/mock-api";
import { Contact } from "../contacts/contacts.types";
import { ICar } from "../cars/cars.types";

@Injectable({ providedIn: "root" })
export class InvoicesService {
  //   private _pagination: BehaviorSubject<InventoryPagination | null> =
  //     new BehaviorSubject(null);
  private _invoice: BehaviorSubject<IInvoice | null> = new BehaviorSubject(
    null
  );
  private _invoices: BehaviorSubject<IInvoice[] | null> = new BehaviorSubject(
    null
  );

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
    this.getInvoices();
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
    return this._invoice.asObservable();
  }

  /**
   * Getter for products
   */
  get invoices$(): Observable<IInvoice[]> {
    return this._invoices.asObservable();
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

      if (timeFilter) {
        let now = Date.now();
        let pastDate: number;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();

        switch (timeFilter) {
          case "1m":
            pastDate = new Date(
              currentDate.setMonth(currentDate.getMonth() - 1)
            ).getTime();
            break;
          case "3m":
            pastDate = new Date(
              currentDate.setMonth(currentDate.getMonth() - 3)
            ).getTime();
            break;
          case "6m":
            pastDate = new Date(
              currentDate.setMonth(currentDate.getMonth() - 6)
            ).getTime();
            break;
          case "cfy":
            if (currentMonth >= 3) {
              // April is month 3 in JS Date
              pastDate = new Date(currentYear, 3, 1).getTime(); // April 1st of current year
            } else {
              pastDate = new Date(currentYear - 1, 3, 1).getTime(); // April 1st of last year
            }
            break;
          case "lfy":
            if (currentMonth >= 3) {
              now = new Date(currentYear, 2, 31, 23, 59, 59).getTime(); // March 31st of this year
              pastDate = new Date(currentYear - 1, 3, 1).getTime(); // April 1st of last year
            } else {
              now = new Date(currentYear - 1, 2, 31, 23, 59, 59).getTime(); // March 31st of last year
              pastDate = new Date(currentYear - 2, 3, 1).getTime(); // April 1st of two years ago
            }
            break;
          case "dr":
            now = additionalData?.dateRange?.endDate || now;
            pastDate = additionalData?.dateRange?.startDate || now;
            break;
          default:
            pastDate = 0; // default to earliest date if no filter is provided
            break;
        }

        invoices = invoices.filter((invoice) => {
          return invoice.date >= pastDate && invoice.date <= now;
        });
      }

      if (typeFilter) {
        if (typeFilter !== "ALL") {
          invoices = invoices.filter((invoice) => invoice.type === typeFilter);
        }
      }

      // Sort invoices based on the created date (latest first)
      invoices = invoices.sort((a, b) => b.date - a.date);

      this._invoices.next(invoices);
    });

    this._unsubscribers.push(unsubsriber);
  }

  async countInvoices(): Promise<number> {
    const invoicesRef = ref(this.db, "invoices");
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
        const invoice = invoices.find((item) => item.id === id) || null;

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
    } catch (err) {
      console.log("An error occured while deleting the invoice", err.message);
      return false;
    }
  }
  private invoiceDataSubject = new BehaviorSubject<any>(null);

  nameOfContact = [];
  numberOfConcatact = [];
  nameOfMake = [];
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

  async getNumberOfContacts() {
    const contactsRef = ref(this.db, "contacts");

    // Fetch the data once
    const snapshot = await get(contactsRef);
    const data = snapshot.val();

    // Clear the existing nameContact array
    let contact = [];
    let numbers = [];

    // Iterate through the data and push contacts to nameContact array
    Object.keys(data).forEach((key) => {
      const val = data[key];
      contact.push(val);
    });

    // Push phone numbers into the Numbers array
    for (let i = 0; i < contact.length; i++) {
      if (contact[i].phoneNumbers) numbers.push(contact[i].phoneNumbers);
    }

    // Clear the NumberOfConcatact array
    this.numberOfConcatact = [];
    let flatNumbers = numbers.flat();

    for (let i = 0; i < flatNumbers.length; i++) {
      this.numberOfConcatact.push(flatNumbers[i].phoneNumber);
    }

    // Return the NumberOfConcatact array
    return this.numberOfConcatact;
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
    console.log("Incoming regNo: ", regNo);
    const carsRef = ref(this.db, "cars");

    // Fetch the data once
    const snapshot = await get(carsRef);
    const data = snapshot.val();

    for (const key in data) {
      const val = data[key];

      console.log(
        "check",
        val.regNo.replace(/[-\s]+/g, "").toLowerCase() ===
          regNo.replace(/[-\s]+/g, "").toLowerCase(),
        "dbCar",
        val.regNo.replace(/[-\s]+/g, "").toLowerCase(),
        "incoming car",
        regNo.replace(/[-\s]+/g, "").toLowerCase()
      );
      if (
        val.regNo.replace(/[-\s]+/g, "").toLowerCase() ===
        regNo.replace(/[-\s]+/g, "").toLowerCase()
      )
        return val;
    }
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
  }
  searchInvoices(query: string) {
    //TODO: Implement search invoices

    //   const dbRef = ref(this.db);

    //   return get(child(dbRef, "cars"))
    //     .then((snapshot) => {
    //       if (snapshot.exists()) {
    //         const dbCars = snapshot.val();

    //         // Frame cars for component
    //         let cars: IInvoice[] = [];
    //         Object.keys(dbCars).forEach((key) => {
    //           const val = dbCars[key];
    //           cars.push(val);
    //         });

    //         cars = cars.filter((car) => {
    //           if (
    //             (car.regNo &&
    //               car.regNo
    //                 .toLowerCase()
    //                 .replace(/\s/g, "")
    //                 .includes(query.toLowerCase().replace(/\s/g, ""))) ||
    //             (car.make &&
    //               car.make.toLowerCase().includes(query.toLowerCase())) ||
    //             (car.model &&
    //               car.model.toLowerCase().includes(query.toLowerCase())) ||
    //             (car.customerId && car.customerId === query) ||
    //             (car.id && car.id === query)
    //           ) {
    //             return true;
    //           }
    //           return false;
    //         });

    //         this._invoices.next(cars);
    //         return true;
    //       } else {
    //         console.log("No data available");
    //         return false;
    //       }
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
    1;
  }
}
