import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { TextFieldModule } from "@angular/cdk/text-field";
import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import { InvoicesService } from "app/modules/invoices/invoices.service";
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
    FuseFindByKeyPipe,
    DatePipe,
  ],
})
export class ModernComponent {
  invoiceData: any;
  @ViewChild("invoice") invoiceElement: ElementRef;

  constructor(
    private invoiceService: InvoicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.invoiceData = this.invoiceService.getInvoiceData();
    if (!this.invoiceData) {
      // Handle the case where invoiceData is not available
      console.error("No invoice data available");
      return;
    }

    setTimeout(() => {
      window.print();
    }, 1000);
  }
  onPrint() {
    setTimeout(() => {
      window.print();
    }, 1000);
  }
  onEdit(): void {
    this.router.navigate(["inventory-and-invoice/invoices/add"], {
      state: { data: this.invoiceData },
    });
  }
}
