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
    // MatPaginatorModule,
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
export class CarsListComponent implements OnInit, AfterViewInit, OnDestroy {
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

    // // Get the brands
    // this._carsService.brands$
    //     .pipe(takeUntil(this._unsubscribeAll))
    //     .subscribe((brands: InventoryBrand[]) => {
    //         // Update the brands
    //         this.brands = brands;

    //         // Mark for check
    //         this._changeDetectorRef.markForCheck();
    //     });

    // // Get the categories
    // this._carsService.categories$
    //     .pipe(takeUntil(this._unsubscribeAll))
    //     .subscribe((categories: InventoryCategory[]) => {
    //         // Update the categories
    //         this.categories = categories;

    //         // Mark for check
    //         this._changeDetectorRef.markForCheck();
    //     });

    // Get the pagination
    // this._carsService.pagination$
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((pagination: InventoryPagination) => {
    //     // Update the pagination
    //     this.pagination = pagination;

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    //   });

    // Get the products
    this.cars$ = this._carsService.cars$;
    this.cars$.subscribe((cars) => {
      console.log("cars", cars);
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
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // if (this._sort && this._paginator) {
    //   // Set the initial sort
    //   this._sort.sort({
    //     id: "name",
    //     start: "asc",
    //     disableClear: true,
    //   });
    //   // Mark for check
    //   this._changeDetectorRef.markForCheck();
    //   // If the user changes the sort order...
    //   this._sort.sortChange
    //     .pipe(takeUntil(this._unsubscribeAll))
    //     .subscribe(() => {
    //       // Reset back to the first page
    //       this._paginator.pageIndex = 0;
    //       // Close the details
    //       this.closeDetails();
    //     });
    // Get products if sort or page changes
    //   merge(this._sort.sortChange, this._paginator.page)
    //     .pipe(
    //       switchMap(() => {
    //         this.closeDetails();
    //         this.isLoading = true;
    //         return this._carsService.getCars(
    //           this._paginator.pageIndex,
    //           this._paginator.pageSize,
    //           this._sort.active,
    //           this._sort.direction
    //         );
    //       }),
    //       map(() => {
    //         this.isLoading = false;
    //       })
    //     )
    //     .subscribe();
    // }
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
   * Cycle through images of selected product
   */
  cycleImages(forward: boolean = true): void {
    // Get the image count and current image index
    const count = this.selectedProductForm.get("images").value.length;
    const currentIndex =
      this.selectedProductForm.get("currentImageIndex").value;

    // Calculate the next and previous index
    const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1;
    const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1;

    // If cycling forward...
    if (forward) {
      this.selectedProductForm.get("currentImageIndex").setValue(nextIndex);
    }
    // If cycling backwards...
    else {
      this.selectedProductForm.get("currentImageIndex").setValue(prevIndex);
    }
  }

  /**
   * Create product
   */
  createProduct(): void {
    // Create the product
    this._carsService.createNoopCar().subscribe((newCar) => {
      // Go to new product
      this.selectedCar = newCar;

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

    // Remove the currentImageIndex field
    delete product.currentImageIndex;

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
