import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
export class InvoiceFormComponent
{

    form: FormGroup;

    constructor(private fb: FormBuilder, private invoiceService: InvoicesService,private router: Router,) {
      this.form = this.fb.group({
        id: [''],
        date: ['', ],
        dueDate: [''],
        billTo: this.fb.group({
          id: [''],
          name: ['', ],
          phoneNumber: this.fb.group({
            code: [''],
            number: [''],
          }),
          email: [''],
          address: ['']
        }),
        carInfo: this.fb.group({
          id: [''],
          regNo: ['', ],
          make: [''],
          model: [''],
          nextServiceDate: [''],
          motValidTill: [''],
          insuranceValidTill: [''],
          roadTaxValidTill: ['']
        }),
        services: this.fb.array([
          this.fb.group({
            id: [''],
            item: [''],
            quantity: [0],
            price: [0],
            total: [0]
          })
        ]),
        tax: this.fb.group({
          unit: [''],
          value: [0]
        }),
        discount: this.fb.group({
          unit: [''],
          value: [0]
        })
      });
    }
    

  ngOnInit(): void {
    
  }
  get services(): FormArray {
    return this.form.get('services') as FormArray;
  }

  addService() {
    this.services.push(this.fb.group({
      id: [''],
      item: [''],
      quantity: [0],
      price: [0],
      total: [0]
    }));
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
  
        // Format the date fields to remove the timestamp
        formData.Date = this.formatDate(formData.Date);
        formData.dueDate = this.formatDate(formData.dueDate);
        formData.nextservicedate = this.formatDate(formData.nextservicedate);
  
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
  }
  backToInvoices() {
    this.router.navigate(['inventory-and-invoice/invoices']);
}
}


 

