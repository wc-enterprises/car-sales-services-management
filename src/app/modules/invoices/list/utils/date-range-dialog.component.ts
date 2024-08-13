import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-date-range-dialog",
  template: `
    <h1 mat-dialog-title>Select Date Range</h1>
    <div mat-dialog-content>
      <mat-form-field class="w-full">
        <mat-label>Start Date</mat-label>
        <input
          matInput
          [matDatepicker]="startPicker"
          [(ngModel)]="data.startDate"
        />
        <mat-datepicker-toggle
          matSuffix
          [for]="startPicker"
        ></mat-datepicker-toggle>
        <mat-datepicker #startPicker></mat-datepicker>
      </mat-form-field>
      <mat-form-field class="w-full">
        <mat-label>End Date</mat-label>
        <input
          matInput
          [matDatepicker]="endPicker"
          [(ngModel)]="data.endDate"
        />
        <mat-datepicker-toggle
          matSuffix
          [for]="endPicker"
        ></mat-datepicker-toggle>
        <mat-datepicker #endPicker></mat-datepicker>
      </mat-form-field>
    </div>
    <div class="flex flex-row justify-between">
      <button mat-flat-button [color]="'warn'" (click)="onCancel()">
        Cancel
      </button>
      <button mat-flat-button [color]="'primary'" (click)="onConfirm()">
        Confirm
      </button>
    </div>
  `,
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
})
export class DateRangeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DateRangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { startDate: Date; endDate: Date }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.data);
  }
}
