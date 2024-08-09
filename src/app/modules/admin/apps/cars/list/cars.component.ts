import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatOptionModule, MatRippleModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
// import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { fuseAnimations } from "@fuse/animations";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { Observable, Subject, takeUntil } from "rxjs";
import { ICar } from "../cars.types";
import { CarsService } from "../cars.service";
import { ContactsService } from "../../contacts/contacts.service";
import { Contact } from "../../contacts/contacts.types";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { DateTime } from "luxon";
import { COLOR, FUEL_TYPE, TRANSMISSION } from "../../utils/util";

@Component({
  selector: "inventory-list",
  templateUrl: "./cars.component.html",
  styles: [
    /* language=SCSS */
    `
      .inventory-grid {
        grid-template-columns: 48px auto 40px;

        @screen sm {
          grid-template-columns: 48px 112px 112px auto 72px;
        }

        @screen md {
          grid-template-columns: 48px 112px 112px auto 72px;
        }

        @screen lg {
          grid-template-columns: 48px 112px 112px auto 96px;
        }

        @screen xl {
          grid-template-columns: 48px 112px 112px 112px 112px 112px 112px auto 96px;
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    NgIf,
    MatProgressBarModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSortModule,
    NgFor,
    NgTemplateOutlet,
    MatDatepickerModule,
    NgClass,
    MatSlideToggleModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatRippleModule,
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
  ],
})
export class CarsListComponent implements OnInit, OnDestroy {
  //   @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  cars$: Observable<ICar[]>;
  filteredCustomers: Contact[];
  flashMessage: "success" | "error" | null = null;
  isLoading: boolean = false;
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  selectedCar: ICar | null = null;
  selectedProductForm: UntypedFormGroup;
  tagsEditMode: boolean = false;
  searchQuery: string;

  makesAndModels = {};
  makes = [];
  transmissionTypes = [];
  fuelTypes = [];
  colors = [];

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: UntypedFormBuilder,
    private _carsService: CarsService,
    private _contactsService: ContactsService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the selected product form
    this.selectedProductForm = this._formBuilder.group({
      id: [""],
      regNo: ["", [Validators.required]],
      make: ["", [Validators.required]],
      model: ["", [Validators.required]],
      customer: this._formBuilder.group({
        id: [""],
        name: [""],
        phoneNumber: [""],
      }),
      color: [""],
      fuelType: [""],
      vinNumber: [""],
      regYear: [""],
      transmission: [""],
      mileage: [""],
      nextServiceDate: [""],
      motValidTill: [""],
      insuranceValidTill: [""],
      roadTaxValidTill: [""],
    });

    // Get the products
    this.cars$ = this._carsService.cars$;

    this._carsService.getMakesAndModels().then((data) => {
      this.makesAndModels = data;
      this.makes = Object.keys(this.makesAndModels);
    });

    // Subscribe to search input field value changes
    this.searchInputControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((query) => {
        this.isLoading = true;
        this._carsService
          .searchCars(query)
          .then((data) => {
            this.isLoading = false;
          })
          .catch((err) => {
            this.isLoading = false;
          });
      });

    this.transmissionTypes = TRANSMISSION;
    this.fuelTypes = FUEL_TYPE;
    this.colors = COLOR;
  }

  getRegYearList() {
    const currentYear = DateTime.local().get("year");
    const regYearList = [];
    for (let i = currentYear; i >= 2000; i--) {
      regYearList.push(i);
    }

    return regYearList;
  }

  getModelsForAMake() {
    const model = this.selectedProductForm.get("make").value;

    if (!model) return [];
    return this.makesAndModels[model];
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle product details
   *
   * @param carId
   */
  toggleDetails(carId: string): void {
    console.log(
      "Received request to toggle details for id: ",
      carId,
      this.selectedCar
    );

    // If the product is already selected...
    if (this.selectedCar && this.selectedCar.id === carId) {
      // Close the details
      this.closeDetails();
      return;
    }

    // Get the product by id
    this._carsService.getCarById(carId).subscribe((product) => {
      product.nextServiceDate = DateTime.fromMillis(
        product.nextServiceDate
      ) as any;
      product.motValidTill = DateTime.fromMillis(product.motValidTill) as any;
      product.roadTaxValidTill = DateTime.fromMillis(
        product.roadTaxValidTill
      ) as any;
      product.insuranceValidTill = DateTime.fromMillis(
        product.insuranceValidTill
      ) as any;

      // Set the selected product
      this.selectedCar = product;

      // Fill the form
      this.selectedProductForm.patchValue(product);

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });

    console.log(
      "Selected product after fetching it from the service: ",
      this.selectedCar,
      this.selectedProductForm.value
    );
  }

  /**
   * Close the details
   */
  closeDetails(): void {
    this.selectedCar = null;
  }

  /**
   * Create product
   */
  createProduct(): void {
    // Create the product
    this._carsService.createNoopCar().subscribe((newCar) => {
      // Go to new product
      this.selectedCar = newCar;

      this.selectedProductForm.reset();
      // Fill the form
      this.selectedProductForm.patchValue(newCar);

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Update the selected product using the form data
   */
  updateSelectedProduct(): void {
    // Get the product object
    const product = this.selectedProductForm.getRawValue();
    product.nextServiceDate = product.nextServiceDate.toMillis();
    product.motValidTill = product.motValidTill.toMillis();
    product.roadTaxValidTill = product.roadTaxValidTill.toMillis();
    product.insuranceValidTill = product.insuranceValidTill.toMillis();

    // Update the product on the server
    this._carsService.updateCar(product.id, product).then(() => {
      // Show a success message
      this.showFlashMessage("success");
    });
  }

  /**
   * Delete the selected product using the form data
   */
  deleteSelectedProduct(): void {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete product",
      message:
        "Are you sure you want to remove this product? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {
      // If the confirm button pressed...
      if (result === "confirmed") {
        // Get the product object
        const product = this.selectedProductForm.getRawValue();

        console.log("Product to be deleted", product);
        // Delete the product on the server
        this._carsService.deleteProduct(product.id).then(() => {
          // Close the details
          this.closeDetails();
        });
      }
    });
  }

  /**
   * Show flash message
   */
  showFlashMessage(type: "success" | "error"): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {
      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  /**
   * Filter customers
   */
  async filterCustomers() {
    this.filteredCustomers = await this._contactsService.searchContacts(
      this.searchQuery
    );
  }

  selectCustomer(customer: Contact) {
    const customerFormGroup = this.selectedProductForm.get("customer");
    customerFormGroup.setValue({
      id: customer.id,
      name: customer.name,
      phoneNumber:
        customer.phoneNumbers && customer.phoneNumbers.length
          ? customer.phoneNumbers[0]
          : null,
    });
    this.searchQuery = customer.name;
  }
}
