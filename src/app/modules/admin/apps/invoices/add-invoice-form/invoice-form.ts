import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren,
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
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { FuseFindByKeyPipe } from "@fuse/pipes/find-by-key/find-by-key.pipe";
import { InvoicesService } from "app/modules/admin/apps/invoices/invoices.service";
import { map, startWith } from "rxjs";
import { products } from "app/services/apps/ecommerce/inventory/data";

@Component({
  selector: "invoice",
  templateUrl: "./invoice-form.html",
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
  @ViewChild("dropdown", { static: false }) dropdown: ElementRef;
  @ViewChildren("dropdown") dropdowns: QueryList<ElementRef>;
  contactList: string[] = [];
  numberList: string[] = [];
  filteredNames: string[] = [];
  selectedName: string = "";
  isDropdownOpened: boolean = false;
  serviceNames: string[] = products.map((product) => product.name);
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

  Nameandprice = products.reduce((acc, product) => {
    acc[product.name] = [product.basePrice, product.taxPercent];
    return acc;
  }, {});

  filteredServiceNames: string[];

  eRef: any;
  invoiceForm: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private invoiceService: InvoicesService,
    private router: Router
  ) {
    this.form = this.fb.group({
      invoiceNumber: [""],
      date: ["", Validators.required],
      dueDate: ["", Validators.required],
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
        country: ["", Validators.required],
        city: ["", Validators.required],
      }),
      carInfo: this.fb.group({
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
      }),
      services: this.fb.array([this.createServiceGroup()]),
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
      this.form.get("invoiceNumber").setValue("#0000" + (count + 1));
    });
  }

  async ngOnInit(): Promise<void> {
    console.log(this.invoiceService.mapName(""));
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
    this.calculateSubtotal();
    this.setupTotalCalculation();

    this.filteredServiceNames = this.serviceNames;
    // Subscribe to the input changes
    this.form.get("item")?.valueChanges.subscribe((value) => {
      this.filterServiceNames(value);
    });
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
        });

        const phoneNumberControl = billToGroup.get("phoneNumber");
        if (phoneNumberControl) {
          if (data.phoneNumbers.length)
            phoneNumberControl.patchValue({
              code: data.phoneNumbers[0].country,
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

  // serivesNames
  onInputChange(value: string, index: number): void {
    this.filteredSuggestions[index] = this.filterServiceNames(value);
    this.isDropdownOpen[index] = this.filteredSuggestions[index].length > 0;
  }

  filterServiceNames(value: string): string[] {
    return this.serviceNames.filter((name) =>
      name.toLowerCase().includes(value.toLowerCase())
    );
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
          regYear: data.regYear,
          fuelType: data.fuelType,
          transmission: data.transmission,
          mileage: data.mileage,
          color: data.color,
          vin: data.vinNumber,
          nextServiceDate: data.nextServiceDate,
          motValidTill: data.motValidTill,
          insuranceValidTill: data.insuranceValidTill,
          roadTaxValidTill: data.roadTaxValidTill,
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

  selectSuggestion(suggestion: string, index: number): void {
    const serviceGroup = this.services.at(index) as FormGroup;
    serviceGroup.get("item").setValue(suggestion);
    const price = this.Nameandprice[suggestion][0] || "";
    const tax = this.Nameandprice[suggestion][1] || "";
    serviceGroup.get("price").setValue(price);
    serviceGroup.get("quantity").setValue("1");
    serviceGroup.get("total").setValue("");
    const existingTaxValue = this.form.get("tax.value").value;
    this.form.get("tax.value").setValue(existingTaxValue + tax);

    this.isDropdownOpen[index] = false;
  }
  openDropdown(index: number): void {
    this.isDropdownOpen[index] = true;
  }

  closeDropdown(index: number): void {
    this.isDropdownOpen[index] = false;
  }

  @HostListener("document:click", ["$event"])
  clickout(event: Event): void {
    setTimeout(() => {
      this.dropdowns.forEach((dropdown, index) => {
        if (!this.eRef.nativeElement.contains(event.target)) {
          this.closeDropdown(index);
        }
      });
    }, 100);
  }

  preventClose(event: Event): void {
    event.preventDefault();
  }

  get services(): FormArray {
    return this.form.get("services") as FormArray;
  }

  createServiceGroup(suggestion: string = ""): FormGroup {
    const price = this.Nameandprice[suggestion] || "";
    const quantity = this.Nameandprice[suggestion] || "";
    return this.fb.group({
      item: [suggestion, Validators.required],
      price: [price],
      quantity: [quantity],
      total: [""],
    });
  }

  addService(suggestion: string = ""): void {
    this.services.push(this.createServiceGroup(suggestion));
    this.calculateSubtotal();
  }

  removeService(index: number): void {
    if (this.services.length > 1) {
      var a = 0;
      const removedService = this.services.at(index).value;
      const removedTax = this.Nameandprice[removedService.item][1] || 0;
      const currentTax = this.form.get("tax.value").value;
      this.form.get("tax.value").setValue(currentTax - removedTax);

      this.services.removeAt(index);
    } else {
      alert("At least one service is required.");
    }
    this.calculateSubtotal();
  }

  calculateSubtotal(): void {
    this.services.valueChanges
      .pipe(
        startWith(this.services.value),
        map((services) => {
          return services.reduce(
            (acc, service) => acc + service.price * service.quantity,
            0
          );
        })
      )
      .subscribe((subtotal) => {
        this.form
          .get("subtotal")
          .setValue(subtotal || "", { emitEvent: false });
        this.calculateTotal();
      });
  }

  setupTotalCalculation(): void {
    const taxControl = this.form.get("tax.value");
    const discountControl = this.form.get("discount.value");

    taxControl.valueChanges.subscribe(() => this.calculateTotal());
    discountControl.valueChanges.subscribe(() => this.calculateTotal());

    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        map((formValue) => {
          const subtotal = formValue.subtotal;
          const taxPercentage = formValue.tax.value;
          const discount = formValue.discount.value;
          const taxAmount = subtotal * (taxPercentage / 100);
          const total = subtotal + taxAmount - discount;
          return total;
        })
      )
      .subscribe((total) => {
        this.form
          .get("total")
          .setValue(total === 0 ? "" : total, { emitEvent: false });
      });
  }

  calculateTotal(): void {
    const subtotal = this.form.get("subtotal").value;
    const taxPercentage = this.form.get("tax").get("value").value;
    const discount = this.form.get("discount").get("value").value;
    const taxAmount = subtotal * (taxPercentage / 100);
    const total = subtotal + taxAmount - discount;
    this.form.get("total").setValue(total, { emitEvent: false });
  }

  // Utility method to format the date to "YYYY-MM-DD"
  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onSave() {
    if (this.form.valid) {
      const updatedData = this.form.value;
      this.invoiceService.saveInvoiceData(updatedData);
    }
    if (this.form.valid) {
      const formData = this.form.value;
      console.log("dates before formatting", formData);

      // Format the date fields to remove the timestamp
      formData.date = this.formatDate(formData.date);
      formData.dueDate = this.formatDate(formData.dueDate);
      formData.carInfo.nextServiceDate = this.formatDate(
        formData.carInfo.nextServiceDate
      );

      console.log("dates", formData);

      this.invoiceService.createInvoice(formData);
      console.log("Form data saved:", formData);
      alert("Data saved to local storage and shared service");
    }
  }

  onPrint() {
    if (this.form.valid) {
      this.onSave();
      this.router.navigate(["pages/invoice/printable/modern"]);
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
