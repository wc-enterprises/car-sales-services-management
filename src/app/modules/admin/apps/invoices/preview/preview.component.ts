import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewChild,
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { InvoicesService } from 'app/modules/admin/apps/invoices/invoices.service';
@Component({
    selector: 'modern',
    templateUrl: './preview.component.html',
    styles: [
        `
            .minify {
                /* Default (Mobile small) */
                @apply scale-[0.31] origin-top-left;

                /* Mobile medium */
                @screen mobile-medium {
                    @apply scale-[0.37];
                }

                /* Mobile large */
                @screen mobile-large {
                    @apply scale-[0.42];
                }
                // Tablet
                @screen sm {
                    @apply scale-[0.7];
                }

                // Laptop small
                @screen md {
                    @apply scale-100;
                }

                // Laptop medium
                @screen lg {
                    @apply scale-100;
                }
            }
        `,
    ],
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
export class PreviewComponent {
    invoiceId: string;
    invoiceData: any = {
        billTo: {
            address1: 'C2-104, Akshaya Apartments',
            address2: 'Guduvancherry',
            city: 'Chennai',
            country: 'India',
            email: '',
            id: '',
            name: 'Damn',
            phoneNumber: {
                code: '',
                number: '23424',
            },
            postCode: '603202',
        },
        carInfo: {
            color: '',
            engineType: '',
            fuelType: '',
            id: '',
            insuranceValidTill: '',
            make: 'Skoda',
            mileage: '',
            model: 'Rapid',
            motValidTill: '',
            nextServiceDate: '2024-07-23',
            regNo: 'SF234 342',
            regYear: '',
            roadTaxValidTill: '',
            transmission: '',
            vin: '',
        },
        date: '2024-07-12',
        dueDate: '2024-07-19',
        id: 'c5e2557b-e7e2-478c-95b1-dda205b68f5c',
        invoiceNumber: '#00002',
        services: [{ item: 'Horn', price: 950, quantity: '2', total: '' }],
        subtotal: 950,
        tax: { value: 10 },
        total: 1045,
    };
    @ViewChild('invoice') invoiceElement: ElementRef;

    constructor(
        private invoiceService: InvoicesService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.invoiceId = params['id'];
            this.invoiceService
                .getInvoiceByIdOnce(this.invoiceId)
                .then((data) => {
                    this.invoiceData = data;
                    console.log('Invoice data', this.invoiceData);
                });
        });
        if (!this.invoiceData) {
            // Handle the case where invoiceData is not available
            console.error('No invoice data available');
            return;
        }
    }

    onPrint() {
        setTimeout(() => {
            window.print();
        }, 1000);
    }

    onEdit(): void {
        this.router
            .navigate(['pages/invoice/form'], {
                state: { data: this.invoiceData },
            })
            .then(() => {
                window.location.reload();
            });
    }

    getTotalCostOfItem(price: number, quantity: string) {
        return price * parseInt(quantity);
    }
}
