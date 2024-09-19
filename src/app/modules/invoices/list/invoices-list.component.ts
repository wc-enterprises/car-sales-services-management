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
import { ContactsService } from "../../contacts/contacts.service";
import { Contact } from "../../contacts/contacts.types";
import {
  IInvoice,
  TInvoiceTimeFilter,
  TInvoiceTypeFilter,
} from "../utils/invoices.types";
import { InvoicesService } from "../invoices.service";
import { Router } from "@angular/router";
import { MatMenuModule } from "@angular/material/menu";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { DateTime } from "luxon";
import { PDFDocument, rgb } from "pdf-lib";
import { drawTable, DrawTableOptions } from "pdf-lib-draw-table-beta";
import { TableOptionsDeepPartial } from "pdf-lib-draw-table-beta/build/types";
import { DateRangeDialogComponent } from "../utils/date-range-dialog.component";
import { getNowAndPastDateBasedOnFilterVal } from "../utils/util";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "inventory-list",
  templateUrl: "./invoices-list.component.html",
  styles: [
    /* language=SCSS */
    `
      .inventory-grid {
        // Mobile
        grid-template-columns: 36px auto 120px;

        // Tablet
        @screen sm {
          grid-template-columns: 48px 112px 112px auto 120px;
        }

        // Laptop small
        @screen md {
          grid-template-columns: 48px 112px 112px 112px auto 120px;
        }

        // Laptop medium
        @screen lg {
          grid-template-columns: 48px 112px 112px 112px 112px 112px 112px auto 120px;
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
    MatMenuModule,
    MatDatepickerModule,
    MatDialogModule,
    DatePipe,
    MatTooltipModule,
  ],
})
export class InvoicesListComponent implements OnInit, AfterViewInit, OnDestroy {
  //   @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  invoices$: Observable<IInvoice[]>;
  invoices: IInvoice[];
  filteredCustomers: Contact[];
  flashMessage: "success" | "error" | null = null;
  isLoading: boolean = false;
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  selectedInvoice: IInvoice | null = null;
  selectedProductForm: UntypedFormGroup;
  tagsEditMode: boolean = false;
  searchQuery: string;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedTimePeriodFilter: TInvoiceTimeFilter = "";
  selectedInvoiceTypeFilter: TInvoiceTypeFilter = "";
  dateRange = {
    startDate: Date.now(),
    endDate: Date.now(),
  };
  selectedDateRange: string = "Select date range";

  getDisplayValueOfSelectedFilter(
    actualValue: TInvoiceTimeFilter | TInvoiceTypeFilter,
    filterType: "TIME_PERIOD" | "INVOICE_TYPE"
  ) {
    if (filterType === "INVOICE_TYPE") {
      if (actualValue === "ALL") return "All";
      if (actualValue === "SALE") return "Sales";
      if (actualValue === "SERVICE") return "Services";
      if (actualValue === "") return "Filter by Invoice Type";
    }

    if (filterType === "TIME_PERIOD") {
      if (actualValue === "1m") return "Last 30 days";
      if (actualValue === "3m") return "Last 3 months";
      if (actualValue === "6m") return "Last 6 months";
      if (actualValue === "cfy") return "Current financial year";
      if (actualValue === "lfy") return "Last financial year";
      if (actualValue === "dr") return this.selectedDateRange;
      if (actualValue === "") return "Filter by time";
      if (actualValue === "all") return "All";
    }
  }

  setFilterValue(
    value: TInvoiceTimeFilter | TInvoiceTypeFilter,
    type: "TIME_PERIOD" | "INVOICE_TYPE"
  ) {
    if (type === "INVOICE_TYPE")
      this.selectedInvoiceTypeFilter = value as TInvoiceTypeFilter;
    if (type === "TIME_PERIOD")
      this.selectedTimePeriodFilter = value as TInvoiceTimeFilter;

    if (value === "dr") {
      this.openDateRangeDialog();
    } else {
      this._invoicesService.getInvoices(
        this.selectedTimePeriodFilter,
        this.selectedInvoiceTypeFilter,
        {
          dateRange: this.dateRange,
        }
      );
    }
  }

  openDateRangeDialog(): void {
    const dialogRef = this.dialog.open(DateRangeDialogComponent, {
      width: "380px",
      data: { startDate: null, endDate: null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { startDate, endDate } = result;

        this.selectedDateRange = `${startDate.toFormat(
          "dd/MM/yy"
        )} - ${endDate.toFormat("dd/MM/yy")}`;
        this.dateRange = {
          startDate: new Date(startDate).getTime(),
          endDate: new Date(endDate).getTime(),
        };

        this._invoicesService.getInvoices(
          "dr",
          this.selectedInvoiceTypeFilter,
          {
            dateRange: {
              startDate: new Date(startDate).getTime(),
              endDate: new Date(endDate).getTime(),
            },
          }
        );
      }
    });
  }

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: UntypedFormBuilder,
    private _invoicesService: InvoicesService,
    private _contactsService: ContactsService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  navigateToForm() {
    this.router.navigate(["/inventory-and-invoice/invoices/add"]);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Get the products
    this.invoices$ = this._invoicesService.invoices$;
    this._invoicesService.invoices$.subscribe((data) => {
      this.invoices = data;
    });

    this.searchInputControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((query) => {
        this.isLoading = true;
        this._invoicesService
          .searchInvoices(query)
          .then((data) => {
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();
          })
          .catch((err) => {
            console.log(err);
            this.isLoading = false;
          });
      });
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {}

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

  previewInvoice(id: string) {
    console.log("this url", this.router.url, id);
    this.router.navigate([`/inventory-and-invoice/invoices/preview/${id}`]);
  }

  /**
   * Toggle product details
   *
   * @param carId
   */
  toggleDetails(carId: string): void {
    console.log(
      "Received request to toggle details for id: ",
      carId,
      this.selectedInvoice
    );

    // If the product is already selected...
    if (this.selectedInvoice && this.selectedInvoice.id === carId) {
      // Close the details
      this.closeDetails();
      return;
    }

    // Get the product by id
    this._invoicesService.getInvoiceById(carId).subscribe((product) => {
      // Set the selected product
      this.selectedInvoice = product;

      // Fill the form
      this.selectedProductForm.patchValue(product);

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });

    console.log(
      "Selected product after fetching it from the service: ",
      this.selectedInvoice,
      this.selectedProductForm.value
    );
  }

  /**
   * Close the details
   */
  closeDetails(): void {
    this.selectedInvoice = null;
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
    this._invoicesService.updateInvoice(product.id, product).then(() => {
      // Show a success message
      this.showFlashMessage("success");
    });
  }

  /**
   * Delete the selected product using the form data
   */
  deleteInvoice(id: string): void {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete details",
      message:
        "Are you sure you want to delete this invoice? This action cannot be undone!",
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

        // Delete the product on the server
        this._invoicesService.deleteInvoice(id).then(() => {
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
    if (customerFormGroup)
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

  async generateInvoicesReport() {
    // Load the existing PDF template
    const templateUrl = "/assets/grace-templates/bang.pdf";
    const existingPdfBytes = await fetch(templateUrl).then((res) =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pdfForm = pdfDoc.getForm();

    const { now, pastDate } = getNowAndPastDateBasedOnFilterVal(
      this.selectedTimePeriodFilter,
      { dateRange: this.dateRange }
    );
    const endDate = DateTime.fromMillis(now).toFormat("LLLL dd, yyyy");
    const startDate = DateTime.fromMillis(pastDate).toFormat("LLLL dd, yyyy");

    pdfForm.getTextField("dateRange").setText(`${startDate} - ${endDate}`);

    pdfForm
      .getTextField("reportGeneratedOn")
      .setText(DateTime.local().toFormat("MMMM d, yyyy - h:mm a"));

    let totalTax = 0;
    let totalAmount = 0;
    this.invoices.forEach((invoice) => {
      console.log(
        "Invoice:",
        invoice.invoiceNumber,
        "Tax type",
        typeof invoice.tax?.value
      );
      if (invoice.tax && invoice.tax.value) totalTax += +invoice.tax?.value;
      totalAmount += +invoice.total;
    });

    console.log("Total tax", totalTax);
    pdfForm
      .getTextField("totalTax")
      .setText(`£ ${parseInt(totalTax as any).toFixed(2)}`);
    pdfForm.getTextField("total").setText(`£ ${totalAmount.toFixed(2)}`);
    pdfForm.flatten();

    const templatePage = pdfDoc.getPage(0);

    // Define the table data
    const tableHeaders = [
      [
        "Date",
        "Invoice ID",
        "Items",
        "Type",
        "Customer Name",
        "Car Name",
        "Vat Amount",
        "Total",
      ],
    ];

    let tableContents: string[][] = [
      ...this.invoices.map((invoice, index) => [
        DateTime.fromISO(new Date(invoice.date).toISOString()).toFormat(
          "dd/MM/yy"
        ),
        invoice.invoiceNumber,
        invoice.services.map((item) => item.item).join(", "),
        invoice.type,
        invoice.billTo.name,
        invoice.carInfo?.make ?? "-",
        invoice.tax?.value ? invoice.tax.value.toString() : "0",
        invoice.total.toString(),
      ]),
    ];

    // Set the starting X and Y coordinates for the table
    const startX = 50;
    const startY = 646;

    // Set the table options
    const options: TableOptionsDeepPartial<DrawTableOptions> | undefined = {
      header: {
        hasHeaderRow: true,
        backgroundColor: rgb(
          0.11764705882352941,
          0.32941176470588235,
          0.5098039215686274
        ),
        textSize: 10,
        textColor: rgb(1, 1, 1),
      },
      textSize: 8,
    };

    const finalDoc = await PDFDocument.create();
    let pageNumber = 1;

    // Outer loop is to handle the pages. Add new pages to the document when the current page is full.
    while (tableContents.length > 0) {
      /**
       * Load pdf pages here.
       */
      // Get the pages from the existing PDF
      const [templatePage] = await finalDoc.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );

      // Add the pages from the existing PDF to the new PDF

      const currentPage = finalDoc.addPage(templatePage);
      currentPage.drawText(`Page ${pageNumber}`, {
        x: currentPage.getWidth() / 2,
        y: 60,
        size: 8,
      });
      pageNumber++;

      // Inner loop creates the table by adding one invoice after the other until it throw the error : "Table height exceeds the available space on the page."
      const invoicesForPage = [];
      for (let i = 0; i < tableContents.length; i++) {
        invoicesForPage.push(tableContents[i]);
        try {
          /**
           * Keep on adding new items to the page until it throw.
           */

          // Draw the table
          const tableDimensions = await drawTable(
            finalDoc,
            currentPage,
            [...tableHeaders, ...invoicesForPage],
            startX,
            startY,
            options
          );

          if (i === tableContents.length - 1) {
            tableContents = [];
          }

          console.log("Table dimensions:", tableDimensions);
        } catch (error: any) {
          /**
           * When drawTable throws with table height exceeded error, create a new page and add it to doc.
           */
          console.error("Error drawing table:", error);
          if (
            error.message ===
            "Table height exceeds the available space on the page."
          ) {
            console.log("Page full. Proceed to add new page to document");
            tableContents = tableContents.slice(invoicesForPage.length);
            break;
          }
        }
      }
    }

    // Serialize the PDF to bytes and write to a file
    const pdfBytes = await finalDoc.save();

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    const formattedTime = `${date.getHours().toString().padStart(2, "0")}-${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}-${date.getSeconds().toString().padStart(2, "0")}`;

    // Trigger download
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_Report_${formattedDate}_${formattedTime}.pdf`;
    link.click();
  }
}
