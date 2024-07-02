import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
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
import { RouterLink } from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { InvoicesService } from '../invoice.service';
@Component({
    selector       : 'invoice',
    templateUrl    : './invoice-form.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [NgIf, MatButtonModule, MatTooltipModule, RouterLink, MatIconModule, NgFor, FormsModule, ReactiveFormsModule, MatRippleModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, NgClass, MatSelectModule, MatOptionModule, MatDatepickerModule, TextFieldModule, FuseFindByKeyPipe, DatePipe],

})
export class InvoiceFormComponent
{
    form: FormGroup;

    constructor(private fb: FormBuilder, private invoiceService: InvoicesService) {
      this.form = this.fb.group({
        invoiceNumber: ['', ],
        Date: ['', ],
        dueDate: ['', ],
        Name: ['', ],
        phone: ['', ],
        Addressline1: ['', ],
        Addressline2: ['', ],
        'Town/city': ['', ],
        country: ['', ],
        Postcode: ['', ],
        regno: ['', ],
        make: ['', ],
        model: ['', ],
        color: [''],
        fueltype: [''],
        vin: [''],
        regyear: [''],
        enginetype: [''],
        transmission: [''],
        mileage: [''],
        nextservicedate: [''],
        enterservice: ['', ],
        rate: ['', ],
        qty: ['', ],
        subtotal: ['', ],
        tax: ['', ],
        discount: ['', ],
        total: ['', ],
      });
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
  
        this.invoiceService.setInvoiceData(formData);
        console.log('Form data saved:', formData);
        alert('Data saved to local storage and shared service');
      } else {
        console.log('Form is invalid:', this.form);
        alert('Please fill in all required fields');
      }
    }
      onPrint() {
        window.print();
      }
}