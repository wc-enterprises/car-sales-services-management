import { TextFieldModule } from "@angular/cdk/text-field";
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  Validators,
} from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatOptionModule, MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router, RouterLink } from "@angular/router";
import { FuseFindByKeyPipe } from "@fuse/pipes/find-by-key/find-by-key.pipe";
import { InvoicesService } from "app/modules/invoices/invoices.service";
import { DateTime } from "luxon";
import { EMPTY, merge, map, Observable, startWith, Subject, takeUntil } from "rxjs";
import { CarsService } from "../../cars/cars.service";
import { ICar } from "../../cars/cars.types";
import { ContactsService } from "../../contacts/contacts.service";
import { Contact, Country } from "../../contacts/contacts.types";
import { InventoryService } from "../../spares-and-services/inventory.service";
import { InventoryProduct } from "../../spares-and-services/inventory.types";
import {
  COLOR,
  countries,
  FUEL_TYPE,
  getRegYearList,
  TRANSMISSION,
} from "../../utils/util";
import { IInvoice, IService } from "../utils/invoices.types";

@Component({
  selector: "invoice",
  templateUrl: "./add-invoice.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    RouterLink,
    MatIconModule,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    NgClass,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    TextFieldModule,
    FuseFindByKeyPipe,
    DatePipe,
    MatAutocompleteModule,
    AsyncPipe,
    MatSlideToggleModule,
  ],
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  countries = countries;
  form: FormGroup;
  invoiceData: any;
  filteredSuggestions: { [key: number]: string[] } = {};
  isDropdownOpen: { [key: number]: boolean } = {};

  contactList: string[] = [];
  numberList: string[] = [];
  filteredNames: string[] = [];
  selectedName: string = "";
  isDropdownOpened: boolean = false;
  // carRegNo
  regNoList: string[] = [];
  filteredRegNo: string[] = [];
  selectedRegNo: string = "";
  isDropdownOpenedRegNo: boolean = false;
  // carMakes
  makeNameList: string[] = [];
  mapForMake: {} = {};
  makeModelMapping: { [key: string]: string[] } = this.mapForMake;
  filteredMakeName: string[] = [];
  selectedMakeName: string = "";
  isDropdownOpenedMakeName: boolean = false;

  modelName: string[] = [];
  filteredModelName: string[] = [];
  selectedModelName: string = "";
  isDropdownOpenedModelName: boolean = false;

  filteredPhoneNumber: string[] = [];
  selectedPhoneNumber: string = "";
  isDropdownOpenedNumber: boolean = false;

  currentInvoiceNumber: string = "";

  makesAndModels: Record<string, string[]> = {};
  makes: string[] = [];
  filteredMakes: string[];
  filteredMakes$: Observable<string[]>[] = [];

  filteredColors: string[];

  allServices: InventoryProduct[] = [];

  invoiceTypes: {
    value: string;
    viewValue: string;
  }[] = [
    {
      value: "SERVICE",
      viewValue: "Service",
    },
    {
      value: "SALE",
      viewValue: "Sale",
    },
  ];

  eRef: any;
  invoiceForm: any;

  colors: string[] = [];
  fuelTypes: string[] = [];
  transmissionTypes: string[] = [];
  regYearList: number[] = [];

  /** Service names */
  filteredServices: InventoryProduct[] = [];

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoicesService,
    private contactService: ContactsService,
    private carService: CarsService,
    private router: Router,
    private _inventoryService: InventoryService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      invoiceNumber: [""],
      type: ["SERVICE", Validators.required],
      date: ["", Validators.required],
      billTo: this.fb.group({
        id: [""],
        name: ["", Validators.required],
        phoneNumber: this.fb.group({
          code: ["gb"],
          number: [""],
        }),
        email: [""],
        addressLine1: [""],
        addressLine2: [""],
        postalCode: [""],
        country: ["United Kingdom", Validators.required],
        city: [""],
        createdDate: [""],
      }),
      services: this.fb.array([this.createServiceGroup()]) as FormArray,
      subtotal: [""],
      tax: this.fb.group({
        value: [],
      }),
      discount: this.fb.group({
        value: [],
      }),
      total: [""],
      hasWarranty: [true],
      advance: [0],
      balance: [0],
      partExchange: [0],
    });

    this.form.controls.billTo.get("phoneNumber.code")?.patchValue("gb");

    this.invoiceService.totalInvoicesCreatedSoFar().then((count) => {
      this.currentInvoiceNumber = this.frameInvoiceNumber(count);
      this.form.get("invoiceNumber")?.setValue(this.currentInvoiceNumber);
    });

    this.form.get("date")?.patchValue(new Date());
  }

  /**
   * Get country info by iso code
   *
   * @param iso
   */
  getCountryByIso(iso: string): Country {
    const countryFound = countries.find((country) => country.iso === iso);
    return countryFound as Country;
  }

  frameInvoiceNumber(numberOfExistingInvoices: number) {
    const nextInvoiceNumber = `${numberOfExistingInvoices + 1}`;
    switch (nextInvoiceNumber.length) {
      case 1:
        return "#0000" + nextInvoiceNumber;
      case 2:
        return "#000" + nextInvoiceNumber;
      case 3:
        return "#00" + nextInvoiceNumber;
      case 4:
        return "#0" + nextInvoiceNumber;
      default:
        return "#" + nextInvoiceNumber;
    }
  }

  createServiceGroup(suggestion?: IService): FormGroup {
    const price = suggestion?.price ?? "";
    const quantity = suggestion?.quantity ?? 1;
    const total = suggestion?.total
      ? +suggestion?.total
      : null || +price * +quantity;

    const control = this.fb.control(suggestion?.id ?? "");

    this.filteredMakes$.push(
      control.valueChanges.pipe(
        startWith(""),
        map((value) => this._filter(value as string))
      )
    );

    return this.fb.group({
      id: control,
      item: [suggestion?.item ?? "", Validators.required],
      price: [price, Validators.required],
      quantity: [quantity],
      total: [total || 0],
      discount: [""],
      tax: [""],
    });
  }

  _filter(value: string): string[] {
    const filterValue = value?.toLowerCase();
    return this.makes.filter((make) =>
      make.toLowerCase().includes(filterValue)
    );
  }

  addService(suggestion?: IService): void {
    (this.form.get("services") as FormArray).push(
      this.createServiceGroup(suggestion)
    );
  }

  get services() {
    return this.form.get("services") as FormArray;
  }

  filterItems(value: string, index: number): void {
    this._inventoryService.products$.subscribe((products) => {
      this.filteredServices = products.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
    });
  }

  selectSuggestion(item: InventoryProduct, index: number): void {
    const serviceGroup = (this.form.get("services") as FormArray).at(
      index
    ) as FormGroup;
    serviceGroup.get("item")?.setValue(item.name);
    const price = item.sellingPrice ?? "";

    serviceGroup.get("id")?.setValue(item.id);
    serviceGroup.get("price")?.setValue(price);
    serviceGroup.get("quantity")?.setValue("1");

    // Tax for individual service
    const tax = item.taxAmount ?? "";
    const existingTaxValue = this.form.get("tax.value")?.value;
    this.form.get("tax.value")?.setValue(existingTaxValue + tax);
    serviceGroup.get("tax")?.setValue(tax);

    this.isDropdownOpen[index] = false;
  }

  /**
   * Remove item
   *
   * @param index
   */
  removeService(index: number): void {
    // Get form array for phone numbers
    const servicesFormArray = this.form.get("services") as UntypedFormArray;

    const itemToBeRemoved = servicesFormArray.at(index).value;

    // Remove the phone number field
    servicesFormArray.removeAt(index);

    // Subtract any added tax and re-calcuate the total.
    // Tax
    const currentFormTax = this.form.get("tax")?.value;

    if (itemToBeRemoved.tax && currentFormTax.value >= itemToBeRemoved.tax) {
      const newTaxVal = currentFormTax.value - itemToBeRemoved.tax;

      this.form.get("tax.value")?.setValue(newTaxVal);
    }

    this.calculateTotal();

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  getModelsForAMakeWithoutParam() {
    const make = this.form.controls.carInfo?.get("make")?.value;
    if (!make) return [];
    return this.makesAndModels[make];
  }

  getModelsForAMake(make: string) {
    if (!make) return [];
    const modelsOfMake = this.makesAndModels[make];
    return modelsOfMake;
  }

  async ngOnInit(): Promise<void> {
    /** Fetch makes and function to get model for make */
    this.carService.getMakesAndModels().then((data) => {
      this.makesAndModels = data;
      this.makes = Object.keys(this.makesAndModels);
    });
    /************************** */

    await this.getMakeForMaping();
    this.makeModelMapping = this.mapForMake;
    this.getMakeName();
    this.numberInformation();
    this.getContactList();
    this.getRegno();

    this.filterItems("", 0);

    /** Check for invoice draft */
    const invoiceDraft = localStorage.getItem("invoiceDraft");
    if (invoiceDraft) {
      const parsedInvoice: Partial<IInvoice> = JSON.parse(invoiceDraft);
      const services = parsedInvoice.services;

      this.form.patchValue({ ...parsedInvoice, date: new Date() });

      if (services && services.length) {
        services.shift();
        services?.forEach((item) => {
          this.addService(item);
        });
      }
    }

    this.form.valueChanges.subscribe((data: IInvoice) => {
      if (!data.billTo?.phoneNumber?.code) data.billTo.phoneNumber.code = "gb";
      data.services = data.services.filter((item) => item.item);
      localStorage.setItem("invoiceDraft", JSON.stringify(data));
    });

    (this.form.get("services") as FormArray).valueChanges
      .pipe(
        startWith((this.form.get("services") as FormArray).value),
        map((services: IService[]) => {
          return services.reduce((acc, service) => {
            return acc + service.price * (service.quantity || 1);
          }, 0);
        })
      )
      .subscribe((subtotal) => {
        this.form
          .get("subtotal")
          ?.setValue(subtotal || "", { emitEvent: false });
        const total = this.calculateTotal();

        this.form.get("total")?.setValue(total);
      });

    this.form.get("tax")?.valueChanges.subscribe((data) => {
      const total = this.calculateTotal();
      this.form.get("total")?.setValue(total);
    });

    merge(
      this.form.get("advance")?.valueChanges || EMPTY,
      this.form.get("partExchange")?.valueChanges || EMPTY
    )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        const total = this.form.get("total")?.value || 0;
        const advance = this.form.get("advance")?.value || 0;
        const partExchange = this.form.get("partExchange")?.value || 0;
        const balance = total - advance - partExchange;
        this.form.get("balance")?.setValue(balance);
      });

    this.colors = COLOR;
    this.fuelTypes = FUEL_TYPE;
    this.transmissionTypes = TRANSMISSION;
    this.regYearList = getRegYearList();

    this._inventoryService
      .getProductsOnce()
      .then((data) => {
        this.allServices = data;
      })
      .catch((err) => {
        console.error(
          "Errored while fetching services in add invoice component"
        );
        this.allServices = [];
      });
  }

  ngOnDestroy(): void {
    /** Unsubscribe from all subscriptions */
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  clearForm(resetToType?: "SERVICE" | "SALE") {
    localStorage.removeItem("invoiceDraft");
    this.form.reset();
    this.form.patchValue({
      invoiceNumber: this.currentInvoiceNumber,
      type: resetToType ?? "SERVICE",
      date: new Date(),
      billTo: {
        phoneNumber: {
          code: "gb",
        },
        country: "United Kingdom",
      },
      hasWarranty: true,
    });
  }

  typeChanged(type: "SERVICE" | "SALE") {
    this.clearForm(type);
    this.form.get("services")?.reset();
  }

  showCarDetails() {
    const aYearFromNow = DateTime.local().plus({ year: 1 }).toISODate();

    // If invoice type is services, show car details in the add form.
    if (this.form.get("type")?.value === "SERVICE") {
      const carInfo = this.fb.group({
        id: [""],
        regNo: ["", Validators.required],
        regYear: [""],
        make: ["", Validators.required],
        model: ["", Validators.required],
        engineType: [""],
        transmission: [""],
        fuelType: [""],
        mileage: [""],
        color: [""],
        vin: [""],
        nextServiceDate: [aYearFromNow, Validators.required],
      });

      this.form.addControl("carInfo", carInfo);

      this.form.controls.carInfo
        .get("nextServiceDate")
        ?.patchValue(aYearFromNow);

      carInfo.get("make")?.valueChanges.subscribe((value) => {
        this.filteredMakes = this._filter(value as string);
      });
      carInfo.get("color")?.valueChanges.subscribe((value) => {
        if (!value) {
          this.filteredColors = [];
          return;
        }
        const filterValue = value.toLowerCase();
        this.filteredColors = this.colors.filter((color) =>
          color.toLowerCase().includes(filterValue)
        );
      });
      return true;
    }
    //Else do not show.
    this.form.removeControl("carInfo");
    return false;
  }

  async numberInformation() {
    this.numberList = await this.invoiceService.getNumberOfContacts();
  }
  async getContactList() {
    this.contactList = await this.invoiceService.getNameOfContacts();
  }
  async getRegno() {
    this.regNoList = await this.invoiceService.getRegNo();
  }
  async getMakeName() {
    this.makeNameList = await this.invoiceService.makeName();
  }
  async getMakeForMaping() {
    this.mapForMake = await this.invoiceService.makeMap();
  }
  // CustomerNames
  filterNames() {
    this.filteredNames = this.contactList.filter((name) =>
      name.toLowerCase().includes(this.selectedName.toLowerCase())
    );
  }

  selectName(name: string) {
    this.selectedName = name;
    this.filteredNames = [];
    this.isDropdownOpened = false;

    this.invoiceService.mapName(name).then((data) => {
      if (!data) return;

      const billToGroup = this.form.get("billTo");
      if (billToGroup) {
        billToGroup.patchValue({
          id: data.id,
          name: data.name,
          addressLine1: data.address?.addressLine1 ?? "",
          addressLine2: data.address?.addressLine2 ?? "",
          city: data.address?.city ?? "",
          country: data.address?.country ?? "",
          postalCode: data.address?.postalCode ?? "",
          createdDate: data.createdDate ?? "",
        });

        const phoneNumberControl = billToGroup.get("phoneNumber");
        if (phoneNumberControl) {
          if (data.phoneNumbers && data.phoneNumbers.length)
            phoneNumberControl.patchValue({
              code: data.phoneNumbers[0].country ?? null,
              number: data.phoneNumbers[0].phoneNumber,
            });
        }
      }
    });
  }

  preventClosed(event: Event): void {
    event.preventDefault();
  }
  //phone number
  filterPhoneNumber() {
    this.filteredPhoneNumber = this.numberList.filter((phoneNumber) =>
      phoneNumber.toLowerCase().includes(this.selectedPhoneNumber.toLowerCase())
    );
  }

  selectPhoneNumber(phoneNumber: string) {
    this.selectedPhoneNumber = phoneNumber;
    this.filteredPhoneNumber = [];
    this.isDropdownOpenedNumber = false;
  }

  // carRegNo
  filterRegNo() {
    this.filteredRegNo = this.regNoList.filter((regNo) =>
      regNo.toLowerCase().includes(this.selectedRegNo.toLowerCase())
    );
  }
  selectRegNo(regNoList: string) {
    this.selectedRegNo = regNoList;
    this.filteredRegNo = [];
    this.isDropdownOpenedRegNo = false;

    this.invoiceService.mapRegNo(regNoList).then((data) => {
      if (!data) return;

      const carInfoGroup = this.form.get("carInfo");
      if (carInfoGroup) {
        carInfoGroup.patchValue({
          id: data.id,
          regNo: data.regNo,
          make: data.make,
          model: data.model,
          regYear: data.regYear ?? null,
          fuelType: data.fuelType ?? null,
          transmission: data.transmission ?? null,
          mileage: data.mileage ?? null,
          color: data.color ?? null,
          vin: data.vinNumber ?? null,
          nextServiceDate: data.nextServiceDate ?? null,
        });
      }
    });
  }

  filterMakeName() {
    this.filteredMakeName = this.makeNameList.filter((makeName) =>
      makeName.toLowerCase().includes(this.selectedMakeName.toLowerCase())
    );
  }

  selectMakeName(makeName: string) {
    this.selectedMakeName = makeName;
    this.filteredMakeName = [];
    this.isDropdownOpenedMakeName = false;
    this.updateModelList(makeName); // Update the model list based on selected make
  }

  updateModelList(makeName: string) {
    this.modelName = this.makeModelMapping[makeName] || [];
    this.selectedModelName = ""; // Reset the selected model
    this.filteredModelName = this.modelName;
  }

  filterModelName() {
    this.filteredModelName = this.modelName.filter((modelName) =>
      modelName.toLowerCase().includes(this.selectedModelName.toLowerCase())
    );
  }

  selectModelName(modelName: string) {
    this.selectedModelName = modelName;
    this.filteredModelName = [];
    this.isDropdownOpenedModelName = false;

    // Update selected make to selected model name
    this.selectedModelName = modelName;
  }

  openDropdown(index: number): void {
    this.isDropdownOpen[index] = true;
  }

  closeDropdown(index: number): void {
    this.isDropdownOpen[index] = false;
  }

  preventClose(event: Event): void {
    event.preventDefault();
  }

  calculateTotal(): number {
    const subtotal: number = this.form.get("subtotal")?.value;
    let taxAmount: number = parseInt(this.form.get("tax")?.get("value")?.value);

    if (isNaN(taxAmount)) taxAmount = 0;

    const total = subtotal + taxAmount;
    return total;
  }

  // Utility method to format the date to "YYYY-MM-DD"
  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // async onSave() {
  //   if (this.form.valid) {
  //     const formData = this.form.value;
  //     const now = Date.now();

  //     let customerId: string = "";
  //     if (
  //       !formData.billTo.id &&
  //       (formData.billTo.phoneNumber?.number || formData.billTo.addressLine1)
  //     ) {
  //       // Save the contact
  //       // There will be no code in phone. Hardcode it to Great Britan.

  //       const billToCustomer = formData.billTo as IInvoice["billTo"];
  //       const contact: Omit<Contact, "id"> = {
  //         name: billToCustomer.name,
  //         address: {
  //           addressLine1: billToCustomer.addressLine1,
  //           addressLine2: billToCustomer.addressLine2,
  //           city: billToCustomer.city,
  //           country: billToCustomer.country,
  //           postalCode: billToCustomer.postalCode,
  //         },
  //         phoneNumbers: [
  //           {
  //             country: "gb",
  //             label: "",
  //             phoneNumber: billToCustomer.phoneNumber?.number,
  //           },
  //         ],
  //         createdDate: now,
  //       };

  //       customerId = await this.contactService.createContact(contact);

  //       formData.billTo.id = customerId;
  //       formData.billTo.createdDate = now;
  //     }

  //     const carInfoFromForm = formData.carInfo;
  //     if (carInfoFromForm && !carInfoFromForm.id) {
  //       // Save the car

  //       const car: Omit<ICar, "id"> = {
  //         regNo: carInfoFromForm.regNo,
  //         make: carInfoFromForm.make,
  //         model: carInfoFromForm.model,
  //         color: carInfoFromForm.color,
  //         fuelType: carInfoFromForm.fuelType,
  //         mileage: carInfoFromForm.mileage
  //           ? parseInt(carInfoFromForm.mileage)
  //           : null,
  //         nextServiceDate: carInfoFromForm.nextServiceDate
  //           ? new Date(carInfoFromForm.nextServiceDate).getTime()
  //           : null,
  //         regYear: carInfoFromForm.regYear,
  //         transmission: carInfoFromForm.transmission,
  //         vinNumber: carInfoFromForm.vin,
  //         customerId: customerId ?? null,
  //       };

  //       await this.carService.createCar(car);
  //     }

  //     /**
  //      * Save new services to inventory
  //      */
  //     const services = formData.services;
  //     for (let service of services) {
  //       if (formData.type === "SERVICE") {
  //         if (!service.id)
  //           this._inventoryService.createProduct({
  //             name: service.item,
  //             vendor: null,
  //             stock: null,
  //             basePrice: service.price,
  //             taxAmount: 0,
  //             discount: 0,
  //             sellingPrice: service.price,
  //             weight: null,
  //             images: [],
  //             active: true,
  //             date: new Date().getTime(),
  //           });
  //         else
  //           this._inventoryService.updateProduct(service.id, {
  //             name: service.item,
  //             sellingPrice: service.price,
  //           });
  //       } else if (formData.type === "SALE") {
  //         this.carService.addCarIfNotPresent(
  //           {
  //             make: service.id,
  //             model: service.item,
  //             regNo: service.total,
  //             price: service.price,
  //             color: service.discount,
  //           },
  //           customerId
  //         );
  //       }
  //     }

  //     // Format the date fields to remove the timestamp
  //     formData.date = new Date(formData.date).getTime();

  //     if (formData.carInfo)
  //       formData.carInfo.nextServiceDate = new Date(
  //         formData.carInfo.nextServiceDate
  //       ).getTime();

  //     const invoiceId = await this.invoiceService.createInvoice(formData);

  //     localStorage.removeItem("invoiceDraft");
  //     this.router.navigate([
  //       `/inventory-and-invoice/invoices/preview/${invoiceId}`,
  //     ]);
  //     this.invoiceService.incrementTotalInvoicesCreated();
  //     return invoiceId;
  //   } else {
  //     alert("Please fill in all required fields before printing");
  //   }
  // }

  async onSave() {
    if (!this.form.valid) {
      alert("Please fill in all required fields before saving");
      return;
    }
  
    const formData = this.form.value;
    const now = Date.now();
  
    const customerId = await this.saveCustomerIfNeeded(formData, now);
    await this.saveCarIfNeeded(formData, customerId);
    await this.saveServicesToInventory(formData, customerId);
  
    this.formatDateFields(formData);
  
    const invoiceId = await this.saveInvoice(formData);
    this.finalizeInvoice(invoiceId);
    return invoiceId;
  }
  
  /**
   * Save the customer if the `billTo` contact is new.
   */
  private async saveCustomerIfNeeded(formData: any, now: number): Promise<string> {
    if (formData.billTo.id || !this.isBillToValid(formData.billTo)) {
      return formData.billTo.id || "";
    }
  
    const billToCustomer = formData.billTo as IInvoice["billTo"];
    const contact: Omit<Contact, "id"> = {
      name: billToCustomer.name,
      address: {
        addressLine1: billToCustomer.addressLine1,
        addressLine2: billToCustomer.addressLine2,
        city: billToCustomer.city,
        country: billToCustomer.country,
        postalCode: billToCustomer.postalCode,
      },
      phoneNumbers: [
        {
          country: "gb",
          label: "",
          phoneNumber: billToCustomer.phoneNumber?.number,
        },
      ],
      createdDate: now,
    };
  
    const customerId = await this.contactService.createContact(contact);
    formData.billTo.id = customerId;
    formData.billTo.createdDate = now;
    return customerId;
  }
  
  /**
   * Validate the `billTo` contact details.
   */
  private isBillToValid(billTo: any): boolean {
    return !!(billTo.phoneNumber?.number || billTo.addressLine1);
  }
  
  /**
   * Save the car if the car info is new.
   */
  private async saveCarIfNeeded(formData: any, customerId: string) {
    const carInfo = formData.carInfo;
    if (carInfo && !carInfo.id) {
      const car: Omit<ICar, "id"> = {
        regNo: carInfo.regNo,
        make: carInfo.make,
        model: carInfo.model,
        color: carInfo.color,
        fuelType: carInfo.fuelType,
        mileage: carInfo.mileage ? parseInt(carInfo.mileage) : null,
        nextServiceDate: carInfo.nextServiceDate
          ? new Date(carInfo.nextServiceDate).getTime()
          : null,
        regYear: carInfo.regYear,
        transmission: carInfo.transmission,
        vinNumber: carInfo.vin,
        customerId: customerId,
      };
  
      await this.carService.createCar(car);
    }
  }
  
  /**
   * Save new services to inventory or update existing services.
   */
  private async saveServicesToInventory(formData: any, customerId: string) {
    const services = formData.services || [];
    for (const service of services) {
      if (formData.type === "SERVICE") {
        await this.saveOrUpdateProduct(service);
      } else if (formData.type === "SALE") {
        this.carService.addCarIfNotPresent(
          {
            make: service.id,
            model: service.item,
            regNo: service.total,
            price: service.price,
            color: service.discount,
          },
          customerId
        );
      }
    }
  }
  
  /**
   * Save or update a service in the inventory.
   */
  private async saveOrUpdateProduct(service: any) {
    if (!service.id) {
      await this._inventoryService.createProduct({
        name: service.item,
        vendor: null,
        stock: null,
        basePrice: service.price,
        taxAmount: 0,
        discount: 0,
        sellingPrice: service.price,
        weight: null,
        images: [],
        active: true,
        date: new Date().getTime(),
      });
    } else {
      await this._inventoryService.updateProduct(service.id, {
        name: service.item,
        sellingPrice: service.price,
      });
    }
  }
  
  /**
   * Format the date fields in the form data.
   */
  private formatDateFields(formData: any) {
    formData.date = new Date(formData.date).getTime();
  
    if (formData.carInfo) {
      formData.carInfo.nextServiceDate = new Date(
        formData.carInfo.nextServiceDate
      ).getTime();
    }
  }
  
  /**
   * Save the invoice and return the invoice ID.
   */
  private async saveInvoice(formData: any): Promise<string> {
    return await this.invoiceService.createInvoice(formData);
  }
  
  /**
   * Finalize the invoice creation by navigating and updating the local state.
   */
  private finalizeInvoice(invoiceId: string) {
    localStorage.removeItem("invoiceDraft");
    this.router.navigate([`/inventory-and-invoice/invoices/preview/${invoiceId}`]);
    this.invoiceService.incrementTotalInvoicesCreated();
  }

  backToInvoices() {
    this.router.navigate(["inventory-and-invoice/invoices"]);
  }

  onCancel() {
    this.router.navigate(["inventory-and-invoice/invoices"]);
  }

  getServiceItemTotal(a: string, b: string) {
    let i = parseInt(a);
    let j = parseInt(b);

    i = isNaN(i) ? 0 : i;
    j = isNaN(j) ? 0 : j;
    return i * j;
  }
}
