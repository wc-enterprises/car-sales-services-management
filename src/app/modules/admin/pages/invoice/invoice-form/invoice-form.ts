import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
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
import { InvoicesService } from 'app/modules/admin/apps/invoices/invoices.service';
import { map, startWith } from 'rxjs';
import { result } from 'lodash';

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
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private invoiceService: InvoicesService,
        private router: Router
    ) {
        const id = this.anyformatDate(new Date());
        this.form = this.fb.group({
            id: [id],
            date: [''],
            dueDate: [''],
            billTo: this.fb.group({
                id: [''],
                name: [''],
                phoneNumber: this.fb.group({
                    code: [''],
                    number: [''],
                }),
                email: [''],
                address1: [''],
                address2: [''],
                postCode: [''],
                country: [''],
                city: [''],
            }),
            carInfo: this.fb.group({
                id: [''],
                regNo: [''],
                regYear: [''],
                make: [''],
                model: [''],
                engineType: [''],
                transmission: [''],
                fuelType: [''],
                mileage: [''],
                color: [''],
                vin: [''],
                nextServiceDate: [''],
                motValidTill: [''],
                insuranceValidTill: [''],
                roadTaxValidTill: [''],
            }),
            services: this.fb.array([this.createServiceGroup()]),
            subtotal: [0],
            tax: this.fb.group({
                value: [0],
            }),
            discount: this.fb.group({
                value: [0],
            }),
            total: [0],
        });
    }

    ngOnInit(): void {
        this.calculateSubtotal();
        this.setupTotalCalculation();
    }
    get services(): FormArray {
        return this.form.get('services') as FormArray;
    }

    createServiceGroup(): FormGroup {
        return this.fb.group({
            item: ['', Validators.required],
            price: [, Validators.required],
            quantity: [, Validators.required],
            total: [,],
        });
    }
    addService(): void {
        for (let i = 0; i < 3; i++) {
            this.services.push(this.createServiceGroup());
        }
        this.calculateSubtotal();
    }

    removeService(index: number): void {
        if (this.services.length > 1) {
            this.services.removeAt(index);
        } else {
            alert('At least one service is required.');
        }
        this.calculateSubtotal();
    }

    calculateSubtotal(): void {
        this.services.valueChanges
            .pipe(
                startWith(this.services.value),
                map((services) => {
                    return services.reduce(
                        (acc, service) =>
                            acc + service.price * service.quantity,
                        0
                    );
                })
            )
            .subscribe((subtotal) => {
                this.form
                    .get('subtotal')
                    .setValue(subtotal, { emitEvent: false });
                this.calculateTotal();
            });
    }

    setupTotalCalculation(): void {
        const taxControl = this.form.get('tax.value');
        const discountControl = this.form.get('discount.value');

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
                this.form.get('total').setValue(total, { emitEvent: false });
            });
    }

    calculateTotal(): void {
        const subtotal = this.form.get('subtotal').value;
        const taxPercentage = this.form.get('tax').get('value').value;
        const discount = this.form.get('discount').get('value').value;
        const taxAmount = subtotal * (taxPercentage / 100);
        const total = subtotal + taxAmount - discount;
        this.form.get('total').setValue(total, { emitEvent: false });
    }

    // Utility method to format the date to "YYYY-MM-DD"
    formatDate(date: Date): string {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    onSave() {
        if (this.form.valid) {
            const formData = this.form.value;
            console.log('dates before formatting', formData);

            // Format the date fields to remove the timestamp
            formData.date = this.formatDate(formData.date);
            formData.dueDate = this.formatDate(formData.dueDate);
            formData.carInfo.nextServiceDate = this.formatDate(
                formData.carInfo.nextServiceDate
            );

            console.log('dates', formData);

            this.invoiceService.createInvoice(formData);
            console.log('Form data saved:', formData);
            alert('Data saved to local storage and shared service');
        } else {
            console.log('Form is invalid:', this.form);
            alert('Please fill in all required fields');
        }
    }

    onPrint() {
        this.onSave();
        this.router.navigate(['pages/invoice/printable/modern']);
        window.print();
    }
    backToInvoices() {
        this.router.navigate(['inventory-and-invoice/invoices']);
    }
     padTo2Digits(num: number) {
        return num.toString().padStart(2, '0');
      }
      anyformatDate(date: Date) {
        return (
          [
            date.getFullYear(),
            this.padTo2Digits(date.getMonth() + 1),
            this.padTo2Digits(date.getDate()),
          ].join('') +
          '-'+
          [
            this.padTo2Digits(date.getHours()),
            this.padTo2Digits(date.getMinutes()),
            this.padTo2Digits(date.getSeconds()),
          ].join('')
        );
      }
      result = this.formatDate(new Date());
      
}
