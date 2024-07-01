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

    constructor(private fb: FormBuilder) {
      this.form = this.fb.group({
        invoiceNumber: ['', Validators.required],
        Date: ['', Validators.required],
        dueDate: ['', Validators.required],
        Name: ['', Validators.required],
        phone: ['', Validators.required],
        Addressline1: ['', Validators.required],
        Addressline2: ['', Validators.required],
        'Town/city': ['', Validators.required],
        country: ['', Validators.required],
        Postcode: ['', Validators.required],
        regno: ['', Validators.required],
        make: ['', Validators.required],
        model: ['', Validators.required],
        color: [''],
        fueltype: [''],
        vin: [''],
        regyear: [''],
        enginetype: [''],
        transmission: [''],
        mileage: [''],
        nextservicedate: [''],
        enterservice: ['', Validators.required],
        rate: ['', Validators.required],
        qty: ['', Validators.required],
        subtotal: ['', Validators.required],
        tax: ['', Validators.required],
        discount: ['', Validators.required],
        total: ['', Validators.required],
       
      });
    }
  
   
    onSave() {
        if (this.form.valid) {
          const formData = this.form.value;
          localStorage.setItem('invoiceData', JSON.stringify(formData));
          console.log('Form data saved:', formData);
          alert('Data saved to local storage');
        } else {
          console.log('Form is invalid:', this.form);
          alert('Please fill in all required fields');
        }
      }
      onPrint() {
        window.print();
      }
}