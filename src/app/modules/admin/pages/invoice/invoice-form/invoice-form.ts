import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';

import { FormBuilder, FormGroup } from '@angular/forms';
import { InvoicesService } from '../invoice.service';

@Component({
    selector: 'invoice',
    templateUrl: './invoice-form.html',
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
    /**
     * Constructor
     */

    form: FormGroup;
    invoiceData: any;

    constructor(
        private fb: FormBuilder,
        private invoiceService: InvoicesService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            invoiceNumber: [''],
            Date: [''],
            dueDate: [''],
            Name: [''],
            phone: [''],
            Addressline1: [''],
            Addressline2: [''],
            'Town/city': [''],
            country: [''],
            Postcode: [''],
            regno: [''],
            make: [''],
            model: [''],
            color: [''],
            fueltype: [''],
            vin: [''],
            regyear: [''],
            enginetype: [''],
            transmission: [''],
            mileage: [''],
            nextservicedate: [''],
            enterservice: [''],
            rate: [''],
            qty: [''],
            subtotal: [''],
            tax: [''],
            discount: [''],
            total: [''],
        });
    }

    backToInvoices() {
        this.router.navigate(['inventory-and-invoice/invoices']);
    }
}
