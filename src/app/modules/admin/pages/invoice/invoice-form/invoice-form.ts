import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    QueryList,
    ViewChild,
    ViewChildren,
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
import { products } from 'app/services/apps/ecommerce/inventory/data';
import { List } from 'lodash';
import { getGlobal } from '@firebase/util';

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
    filteredSuggestions: { [key: number]: string[] } = {};
    isDropdownOpen: { [key: number]: boolean } = {};
    @ViewChild('dropdown', { static: false }) dropdown: ElementRef;
    @ViewChildren('dropdown') dropdowns: QueryList<ElementRef>;

    serviceNames: string[] = products.map((product) => product.name);

    Nameandprice = products.reduce((acc, product) => {
        acc[product.name] = [product.basePrice, product.taxPercent];
        return acc;
    }, {});

    filteredServiceNames: string[];

    eRef: any;

    constructor(
        private fb: FormBuilder,
        private invoiceService: InvoicesService,
        private router: Router
    ) {
        this.form = this.fb.group({
            id: [''],
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
            subtotal: [''],
            tax: this.fb.group({
                value: [],
            }),
            discount: this.fb.group({
                value: [],
            }),
            total: [''],
        });
    }

    ngOnInit(): void {
        this.calculateSubtotal();
        this.setupTotalCalculation();

        this.filteredServiceNames = this.serviceNames;

        // Subscribe to the input changes
        this.form.get('item').valueChanges.subscribe((value) => {
            this.filterServiceNames(value);
        });
    }

    onInputChange(value: string, index: number): void {
        this.filteredSuggestions[index] = this.filterServiceNames(value);
        this.isDropdownOpen[index] = this.filteredSuggestions[index].length > 0;
    }

    filterServiceNames(value: string): string[] {
        return this.serviceNames.filter((name) =>
            name.toLowerCase().includes(value.toLowerCase())
        );
    }

    selectSuggestion(suggestion: string, index: number): void {
        const serviceGroup = this.services.at(index) as FormGroup;
        serviceGroup.get('item').setValue(suggestion);
        const price = (this.Nameandprice[suggestion][0]) || '';
        const tax = (this.Nameandprice[suggestion][1]) || '';
        serviceGroup.get('price').setValue(price);
        serviceGroup.get('quantity').setValue('1');
        serviceGroup.get('total').setValue('');
        const existingTaxValue = this.form.get('tax.value').value;
        this.form.get('tax.value').setValue(existingTaxValue + tax);
    
        this.isDropdownOpen[index] = false;
    }
    openDropdown(index: number): void {
        this.isDropdownOpen[index] = true;
    }

    closeDropdown(index: number): void {
        this.isDropdownOpen[index] = false;
    }

    @HostListener('document:click', ['$event'])
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
        return this.form.get('services') as FormArray;
    }

    createServiceGroup(suggestion: string = ''): FormGroup {
        const price = this.Nameandprice[suggestion] || '';
        const quantity = this.Nameandprice[suggestion] || '' ; 
        return this.fb.group({
            item: [suggestion, Validators.required],
            price: [price, Validators.required],
            quantity: [quantity, Validators.required],
            total: [''],
        });
    }
    addService(suggestion: string = ''): void {
        this.services.push(this.createServiceGroup(suggestion));
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
                    .setValue(subtotal || '', { emitEvent: false });
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
                this.form.get('total').setValue(total === 0 ? '' : total, { emitEvent: false });
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
}
