import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  Database,
  Unsubscribe,
  child,
  get,
  onValue,
  ref,
  set,
  update,
} from "@angular/fire/database";
import { FuseMockApiUtils } from "@fuse/lib/mock-api";
import { Contact, Country, Tag } from "app/modules/contacts/contacts.types";
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
import { countries } from "../utils/util";

@Injectable({ providedIn: "root" })
export class ContactsService {
  // Private
  private _contact: BehaviorSubject<Contact | null> =
    new BehaviorSubject<Contact | null>(null);
  private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject<
    Contact[] | null
  >(null);
  private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject<
    Country[] | null
  >(null);

  private _unsubscribers: Unsubscribe[] = [];

  /**
   * Constructor
   */
  constructor(private db: Database) {
    this.getContacts();
    this.getCountries();
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
   * Getter for contact
   */
  get contact$(): Observable<Contact> {
    return this._contact
      .asObservable()
      .pipe(filter((v): v is Contact => v !== null));
  }

  /**
   * Getter for contacts
   */
  get contacts$(): Observable<Contact[]> {
    return this._contacts
      .asObservable()
      .pipe(filter((v): v is Contact[] => v !== null));
  }

  /**
   * Getter for countries
   */
  get countries$(): Observable<Country[]> {
    return this._countries
      .asObservable()
      .pipe(filter((v): v is Country[] => v !== null));
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // getContacts(): Observable<Contact[]> {
  //   return this._httpClient.get<Contact[]>("api/apps/contacts/all").pipe(
  //     tap((contacts) => {
  //       this._contacts.next(contacts);
  //     })
  //   );
  // }

  private frameContactsForComponent(dbContacts: Record<string, Contact>) {
    const contacts: Contact[] = [];
    if (!dbContacts) return contacts;
    Object.keys(dbContacts).forEach((key) => {
      const val = dbContacts[key];
      contacts.push(val);
    });

    const sortedContacts = contacts.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;

      return 0; // names are equal
    });
    return sortedContacts;
  }

  /**
   * Get contacts
   */
  getContacts() {
    const contactsRef = ref(this.db, "contacts");
    const unsubsriber = onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();

      const framedContacts = this.frameContactsForComponent(data);

      this._contacts.next(framedContacts);
    });

    this._unsubscribers.push(unsubsriber);
  }

  /**
   * Create contact
   */
  async createContact(contactData: Omit<Contact, "id">) {
    const id = FuseMockApiUtils.guid();
    const createdDate = new Date().getTime();
    await set(ref(this.db, "contacts/" + id), {
      id,
      ...contactData,
      createdDate,
    });
    console.log("Contact created succesfully", {
      id,
      ...contactData,
      createdDate,
    });
    return id;
  }

  createNoopContact(): Observable<Contact> {
    return this.contacts$.pipe(
      take(1),
      switchMap((contacts) => {
        const newContact = {
          id: FuseMockApiUtils.guid(),
          avatar: null,
          background: null,
          name: "New Contact",
          emails: [],
          phoneNumbers: [],
          notes: null,
          createdDate: new Date().getTime(),
        };
        // Update the contacts with the new contact
        this._contacts.next([newContact, ...contacts]);

        // Return the new contact
        return of(newContact);
      })
    );
  }

  /**
   * Search contacts with given query
   *
   * @param query
   */
  searchContacts(query: string): Promise<Contact[]> {
    console.log("Search contacts function called with query: ", query);

    const dbRef = ref(this.db);
    return get(child(dbRef, `contacts`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          let framedContacts = this.frameContactsForComponent(snapshot.val());

          if (!query) this._contacts.next(framedContacts);

          framedContacts = framedContacts.filter(
            (contact) =>
              contact.name &&
              contact.name.toLowerCase().includes(query.toLowerCase())
          );
          this._contacts.next(framedContacts);
          return framedContacts;
        } else {
          console.log("No data available");
          return [];
        }
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  }

  /**
   * Get contact by id
   */
  getContactById(id: string | null): Observable<Contact> {
    return this._contacts.pipe(
      take(1),
      map((contacts) => {
        if (!contacts) return;
        // Find the contact
        const contact = contacts.find((item) => item.id === id) || null;
        // Update the contact
        this._contact.next(contact);

        // Return the contact
        return contact;
      }),
      switchMap((contact) => {
        if (!contact) {
          return throwError("Could not found contact with id of " + id + "!");
        }

        return of(contact);
      })
    );
  }

  /**
   * Update contact
   *
   * @param id
   * @param contact
   */
  async updateContact(id: string, updatedContact: Contact): Promise<Contact> {
    await set(ref(this.db, "contacts/" + id), updatedContact);

    console.log("Update contact called, observable tried to be updated: ");
    this._contact.subscribe((data) => {
      console.log("data in contact obs: ", data);
    });
    // Update the contact if it's selected
    this._contact.next(updatedContact);

    // Return the updated contact
    return updatedContact;
  }

  /**
   * Delete the contact
   *
   * @param id
   */
  async deleteContact(id: string): Promise<boolean> {
    try {
      await set(ref(this.db, "contacts/" + id), null);
      this.getContacts();
      return true;
    } catch (err: any) {
      console.log("An error occured while deleting the record", err.message);
      return false;
    }
  }

  /**
   * Get countries
   */
  getCountries(): void {
    const starCountRef = ref(this.db, "countries");
    const unsubsriber = onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const countries: Country[] = [];

      if (data)
        Object.keys(data).forEach((key) => {
          const val = data[key];
          countries.push(val);
        });

      this._countries.next(countries);
    });

    this._unsubscribers.push(unsubsriber);
  }

  /**
   * Add countries if not already present
   */
  async addCountriesIfNotAlreadyPresent() {
    const countriesRef = ref(this.db, "countries");

    // Fetch the data once
    const snapshot = await get(countriesRef);
    const data = snapshot.val();

    // If no data, add countries to db.
    if (!data) {
      const updates: Record<string, object> = {};
      countries.forEach((item) => {
        updates[`countries/${item.id}`] = item;
      });

      await update(ref(this.db), updates);
    }
  }

  /**
   * Update the avatar of the given contact
   *
   * @param id
   * @param avatar
   */
  uploadAvatar(id: string, avatar: File) {
    //   return this.contacts$.pipe(
    //     take(1),
    //     switchMap((contacts) =>
    //       this._httpClient
    //         .post<Contact>(
    //           "api/apps/contacts/avatar",
    //           {
    //             id,
    //             avatar,
    //           },
    //           {
    //             headers: {
    //               // eslint-disable-next-line @typescript-eslint/naming-convention
    //               "Content-Type": avatar.type,
    //             },
    //           }
    //         )
    //         .pipe(
    //           map((updatedContact) => {
    //             // Find the index of the updated contact
    //             const index = contacts.findIndex((item) => item.id === id);
    //             // Update the contact
    //             contacts[index] = updatedContact;
    //             // Update the contacts
    //             this._contacts.next(contacts);
    //             // Return the updated contact
    //             return updatedContact;
    //           }),
    //           switchMap((updatedContact) =>
    //             this.contact$.pipe(
    //               take(1),
    //               filter((item) => item && item.id === id),
    //               tap(() => {
    //                 // Update the contact if it's selected
    //                 this._contact.next(updatedContact);
    //                 // Return the updated contact
    //                 return updatedContact;
    //               })
    //             )
    //           )
    //         )
    //     )
    //   );
  }
}
