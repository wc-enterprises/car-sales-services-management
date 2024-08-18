import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { TextFieldModule } from "@angular/cdk/text-field";
import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatOptionModule, MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router, RouterLink } from "@angular/router";
import { FuseFindByKeyPipe } from "@fuse/pipes/find-by-key/find-by-key.pipe";
import { InvoicesService } from "app/modules/invoices/invoices.service";
import { map, startWith } from "rxjs";
import { Contact } from "../../contacts/contacts.types";
import { ContactsService } from "../../contacts/contacts.service";
import { ICar } from "../../cars/cars.types";
import { CarsService } from "../../cars/cars.service";
import { InventoryService } from "../../spares-and-services/inventory.service";
import { InventoryProduct } from "../../spares-and-services/inventory.types";
import {
  COLOR,
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
  ],
})
export class InvoiceFormComponent {
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
          code: [""],
          number: ["", Validators.required],
        }),
        email: [""],
        addressLine1: ["", Validators.required],
        addressLine2: [""],
        postalCode: ["", Validators.required],
        country: ["United Kingdom", Validators.required],
        city: ["", Validators.required],
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
    });

    this.invoiceService.countInvoices().then((count) => {
      console.log("count", count);
      this.currentInvoiceNumber = this.frameInvoiceNumber(count);
      this.form.get("invoiceNumber")?.setValue(this.currentInvoiceNumber);
    });

    this.form.get("date")?.patchValue(new Date());
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
    const total = suggestion?.total ?? +price * quantity;

    return this.fb.group({
      id: [suggestion?.id ?? ""],
      item: [suggestion?.item ?? "", Validators.required],
      price: [price],
      quantity: [quantity],
      total: [total || ""],
      discount: [""],
      tax: [""],
    });
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

    serviceGroup.get("price")?.setValue(price);
    serviceGroup.get("quantity")?.setValue("1");

    // Tax for individual service
    const tax = item.taxAmount ?? "";
    const existingTaxValue = this.form.get("tax.value")?.value;
    this.form.get("tax.value")?.setValue(existingTaxValue + tax);
    serviceGroup.get("tax")?.setValue(tax);

    // Discount for individual service
    const discount = item.discount ?? "";
    const existingDiscountVallue = this.form.get("discount.value")?.value;
    this.form
      .get("discount.value")
      ?.setValue(existingDiscountVallue + discount);
    serviceGroup.get("discount")?.setValue(discount);

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
    console.log("Item to be removed", itemToBeRemoved);

    // Remove the phone number field
    servicesFormArray.removeAt(index);

    // Subtract any added tax and discount and re-calcuate the total.
    // Tax
    const currentFormTax = this.form.get("tax")?.value;
    console.log(itemToBeRemoved.tax, currentFormTax);
    if (itemToBeRemoved.tax && currentFormTax.value >= itemToBeRemoved.tax) {
      const newTaxVal = currentFormTax.value - itemToBeRemoved.tax;
      console.log("New tax value", newTaxVal);
      this.form.get("tax.value")?.setValue(newTaxVal);
    }

    const currentDiscount = this.form.get("discount")?.value;
    if (
      itemToBeRemoved.discount &&
      currentDiscount.value >= itemToBeRemoved.discount
    ) {
      const newDiscount = currentDiscount.value - itemToBeRemoved.discount;
      console.log("New Discount value", newDiscount);
      this.form.get("discount.value")?.setValue(newDiscount);
    }

    this.calculateTotal();

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  getModelsForAMake(make: string) {
    if (!make) return [];
    return this.makesAndModels[make];
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
    if (history.state.data) {
      this.invoiceData = history.state.data;
      this.form.patchValue(this.invoiceData);
    }

    this.filterItems("", 0);

    /** Check for invoice draft */
    const invoiceDraft = localStorage.getItem("invoiceDraft");
    if (invoiceDraft) {
      const parsedInvoice: IInvoice = JSON.parse(invoiceDraft);
      this.form.patchValue({ ...parsedInvoice, date: new Date() });
      parsedInvoice.services.forEach((item) => {
        this.addService(item);
      });
    }

    this.form.valueChanges.subscribe((data) => {
      localStorage.setItem("invoiceDraft", JSON.stringify(data));
    });

    (this.form.get("services") as FormArray).valueChanges
      .pipe(
        startWith((this.form.get("services") as FormArray).value),
        map((services: IService[]) => {
          return services.reduce((acc, service) => {
            return acc + service.price * (service.quantity ?? 1);
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

    this.form.get("discount")?.valueChanges.subscribe((data) => {
      const total = this.calculateTotal();
      this.form.get("total")?.setValue(total);
    });

    this.colors = COLOR;
    this.fuelTypes = FUEL_TYPE;
    this.transmissionTypes = TRANSMISSION;
    this.regYearList = getRegYearList();
  }

  clearForm() {
    console.log("Called clear form");
    localStorage.removeItem("invoiceDraft");
    this.form.reset();
    this.form.patchValue({
      invoiceNumber: this.currentInvoiceNumber,
      type: "SERVICE",
      date: new Date(),
    });
  }

  showCarDetails() {
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
        nextServiceDate: ["", Validators.required],
        motValidTill: [""],
        insuranceValidTill: [""],
        roadTaxValidTill: [""],
      });

      this.form.addControl("carInfo", carInfo);
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
    console.log("received request to filter names", this.selectedName);
    this.filteredNames = this.contactList.filter((name) =>
      name.toLowerCase().includes(this.selectedName.toLowerCase())
    );
    console.log("filtered names:", this.filteredNames, this.isDropdownOpened);
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
          motValidTill: data.motValidTill ?? null,
          insuranceValidTill: data.insuranceValidTill ?? null,
          roadTaxValidTill: data.roadTaxValidTill ?? null,
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
    const subtotal = this.form.get("subtotal")?.value;
    const taxAmount = this.form.get("tax")?.get("value")?.value;
    const discount = this.form.get("discount")?.get("value")?.value;

    console.log("Values going into total calc", subtotal, taxAmount, discount);

    const total = subtotal + taxAmount - discount;
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

  async onSave() {
    if (this.form.valid) {
      const formData = this.form.value;
      const now = Date.now();

      let customerId: string = "";
      if (!formData.billTo.id) {
        // Save the contact
        // There will be no code in phone. Hardcode it to Great Britan.

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

        customerId = await this.contactService.createContact(contact);

        formData.billTo.id = customerId;
        formData.billTo.createdDate = now;
      }

      const carInfoFromForm = formData.carInfo;
      if (carInfoFromForm && !carInfoFromForm.id) {
        console.log("Saving car block called", formData.carInfo);
        // Save the car

        const car: Omit<ICar, "id"> = {
          regNo: carInfoFromForm.regNo,
          make: carInfoFromForm.make,
          model: carInfoFromForm.model,
          color: carInfoFromForm.color,
          fuelType: carInfoFromForm.fuelType,
          mileage: carInfoFromForm.mileage
            ? parseInt(carInfoFromForm.mileage)
            : undefined,
          insuranceValidTill: carInfoFromForm.insuranceValidTill
            ? new Date(carInfoFromForm.insuranceValidTill).getTime()
            : undefined,
          motValidTill: carInfoFromForm.motValidTill
            ? new Date(carInfoFromForm.motValidTill).getTime()
            : undefined,
          nextServiceDate: carInfoFromForm.nextServiceDate
            ? new Date(carInfoFromForm.nextServiceDate).getTime()
            : undefined,
          roadTaxValidTill: carInfoFromForm.roadTaxValidTill
            ? new Date(carInfoFromForm.roadTaxValidTill).getTime()
            : undefined,
          regYear: carInfoFromForm.regYear,
          transmission: carInfoFromForm.transmission,
          vinNumber: carInfoFromForm.vin,
          customerId: customerId ?? null,
        };

        await this.carService.createCar(car);
      }

      // Format the date fields to remove the timestamp
      formData.date = now;
      if (formData.carInfo)
        formData.carInfo.nextServiceDate = new Date(
          formData.carInfo.nextServiceDate
        ).getTime();

      const invoiceId = await this.invoiceService.createInvoice(formData);
      console.log("Form data saved:", formData, invoiceId);
      localStorage.removeItem("invoiceDraft");
      this.router.navigate([
        `/inventory-and-invoice/invoices/preview/${invoiceId}`,
      ]);
      return invoiceId;
    } else {
      alert("Please fill in all required fields before printing");
    }
  }

  backToInvoices() {
    this.router.navigate(["inventory-and-invoice/invoices"]);
  }

  onCancel() {
    this.router.navigate(["inventory-and-invoice/invoices"]);
  }
}
