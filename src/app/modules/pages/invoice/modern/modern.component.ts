import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Invoice } from "../invoice.type";
import { InvoicesService } from "../invoice.service";
import { Subject, takeUntil } from "rxjs";
import { TextFieldModule } from "@angular/cdk/text-field";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRippleModule, MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";

@Component({
  selector: "modern",
  templateUrl: "./modern.component.html",
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
    DatePipe,
  ],
})
export class ModernComponent {
  editMode: boolean = true;
  invoiceForm: UntypedFormGroup;

  invoice: Invoice;
  invoices: Invoice[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _invoicesService: InvoicesService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.invoiceForm = this._formBuilder.group({
      id: [""],
      billTo: this._formBuilder.group({
        name: ["", [Validators.required]],
        address: [null],
        phoneNumber: [""],
        email: [""],
      }),
      carInfo: this._formBuilder.group({
        regNo: [""],
        make: [""],
        model: [""],
      }),
      services: this._formBuilder.array([
        this._formBuilder.group({
          item: [""],
          quantity: [""],
          price: [""],
        }),
        this._formBuilder.group({
          item: [""],
          quantity: [""],
          price: [""],
        }),
        this._formBuilder.group({
          item: [""],
          quantity: [""],
          price: [""],
        }),
        this._formBuilder.group({
          item: [""],
          quantity: [""],
          price: [""],
        }),
        this._formBuilder.group({
          item: [""],
          quantity: [""],
          price: [""],
        }),
      ]),
      tax: [""],
      discount: [""],
    });

    // this._invoicesService.invoices$
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((invoices: Invoice[]) => {
    //     this.invoices = invoices;

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    //   });

    // this._invoicesService.invoice$
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((invoice: Invoice) => {
    //     this.invoice = invoice;

    //     (this.invoiceForm.get("services") as UntypedFormArray).clear();

    //     this.invoiceForm.patchValue(invoice);
    //   });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  get services() {
    return this.invoiceForm.get("services") as FormArray;
  }

  addItemRows() {
   for(let i = 0; i < 5; i++){
    this.services.push(
        this._formBuilder.group({
            item: [""],
            quantity: [""],
            price: [""],
          })
    );
   }
  }
}
