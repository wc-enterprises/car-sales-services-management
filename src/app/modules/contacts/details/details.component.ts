import { OverlayRef } from "@angular/cdk/overlay";
import { TextFieldModule } from "@angular/cdk/text-field";
import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatOptionModule, MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDrawerToggleResult } from "@angular/material/sidenav";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { FuseFindByKeyPipe } from "@fuse/pipes/find-by-key/find-by-key.pipe";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { Subject, takeUntil } from "rxjs";
import { ContactsService } from "../contacts.service";
import { Contact, Country, IAddress } from "../contacts.types";
import { ContactsListComponent } from "../list/list.component";

@Component({
  selector: "contacts-details",
  templateUrl: "./details.component.html",
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
export class ContactsDetailsComponent
  implements AfterViewInit, OnInit, OnDestroy
{
  @ViewChild("avatarFileInput") private _avatarFileInput: ElementRef;
  @ViewChild("backgroundImage") backgroundImage: ElementRef<HTMLImageElement>;

  iconColor: string = "text-black";
  editMode: boolean = false;
  contact: Contact;
  contactForm: UntypedFormGroup;
  contacts: Contact[];
  countries: Country[];
  private _tagsPanelOverlayRef: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  /**
   * Constructor
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _contactsListComponent: ContactsListComponent,
    private _contactsService: ContactsService,
    private _formBuilder: UntypedFormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private _router: Router,
    private _el: ElementRef
  ) {
    // Create and configure the reusable canvas element
    this._canvas = document.createElement("canvas");
    this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  ngAfterViewInit(): void {
    this.checkBackgroundColor();
  }

  @HostListener("window:resize")
  onWindowResize() {
    this.checkBackgroundColor();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Open the drawer
    this._contactsListComponent.matDrawer.open();

    // Create the contact form
    this.contactForm = this._formBuilder.group({
      id: [""],
      avatar: [null],
      name: ["", [Validators.required]],
      emails: this._formBuilder.array([]),
      phoneNumbers: this._formBuilder.array([]),
      address: this._formBuilder.group({
        addressLine1: ["", Validators.required],
        addressLine2: [""],
        city: ["", Validators.required],
        country: ["", Validators.required],
        postalCode: ["", Validators.required],
      }),
      notes: [null],
    });

    // Get the contacts
    this._contactsService.contacts$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((contacts: Contact[]) => {
        this.contacts = contacts;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    // Get the contact
    this._contactsService.contact$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((contact: Contact) => {
        // Open the drawer in case it is closed
        this._contactsListComponent.matDrawer.open();

        // Get the contact
        this.contact = contact;

        // Clear the emails and phoneNumbers form arrays
        (this.contactForm.get("emails") as UntypedFormArray).clear();
        (this.contactForm.get("phoneNumbers") as UntypedFormArray).clear();

        // Patch values to the form
        this.contactForm.patchValue(contact);

        // Setup the emails form array
        const emailFormGroups = [];

        if (contact.emails && contact.emails.length > 0) {
          // Iterate through them
          contact.emails.forEach((email) => {
            // Create an email form group
            emailFormGroups.push(
              this._formBuilder.group({
                email: [email.email],
                label: [email.label],
              })
            );
          });
        } else {
          // Create an email form group
          emailFormGroups.push(
            this._formBuilder.group({
              email: [""],
              label: [""],
            })
          );
        }

        // Add the email form groups to the emails form array
        emailFormGroups.forEach((emailFormGroup) => {
          (this.contactForm.get("emails") as UntypedFormArray).push(
            emailFormGroup
          );
        });

        // Setup the phone numbers form array
        const phoneNumbersFormGroups = [];

        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          // Iterate through them
          contact.phoneNumbers.forEach((phoneNumber) => {
            // Create an email form group
            phoneNumbersFormGroups.push(
              this._formBuilder.group({
                country: [phoneNumber.country],
                phoneNumber: [phoneNumber.phoneNumber],
                label: [phoneNumber.label],
              })
            );
          });
        } else {
          // Create a phone number form group
          phoneNumbersFormGroups.push(
            this._formBuilder.group({
              country: ["us"],
              phoneNumber: [""],
              label: [""],
            })
          );
        }

        // Add the phone numbers form groups to the phone numbers form array
        phoneNumbersFormGroups.forEach((phoneNumbersFormGroup) => {
          (this.contactForm.get("phoneNumbers") as UntypedFormArray).push(
            phoneNumbersFormGroup
          );
        });

        if (contact.name === "New Contact") this.toggleEditMode(true);
        // Toggle the edit mode off
        else this.toggleEditMode(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    // Get the country telephone codes
    this._contactsService.countries$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((codes: Country[]) => {
        this.countries = codes;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    this.checkBackgroundColor();
  }

  frameAddress(address: IAddress) {
    return Object.values(address).filter(Boolean).join(", ");
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();

    // Dispose the overlays if they are still on the DOM
    if (this._tagsPanelOverlayRef) {
      this._tagsPanelOverlayRef.dispose();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Close the drawer
   */
  closeDrawer(): Promise<MatDrawerToggleResult> {
    return this._contactsListComponent.matDrawer.close();
  }

  /**
   * Toggle edit mode
   *
   * @param editMode
   */
  toggleEditMode(editMode: boolean | null = null): void {
    if (editMode === null) {
      this.editMode = !this.editMode;
    } else {
      this.editMode = editMode;
    }

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Update the contact
   */
  updateContact(): void {
    // Get the contact object
    const contact: Contact = this.contactForm.getRawValue();

    // Go through the contact object and clear empty values
    contact.emails = contact.emails
      ? contact.emails.filter((email) => email.email)
      : [];

    contact.phoneNumbers = contact.phoneNumbers
      ? contact.phoneNumbers.filter((phoneNumber) => phoneNumber.phoneNumber)
      : [];

    // Update the contact on the server
    this._contactsService.updateContact(contact.id, contact).then(() => {
      // Toggle the edit mode off
      this.toggleEditMode(false);
    });
  }

  /**
   * Delete the contact
   */
  deleteContact(): void {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete contact",
      message:
        "Are you sure you want to delete this contact? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {
      // If the confirm button pressed...
      if (result === "confirmed") {
        console.log("Contact to be deleted", this.contact);
        // Get the current contact's id
        const id = this.contact.id;

        // Get the next/previous contact's id
        const currentContactIndex = this.contacts.findIndex(
          (item) => item.id === id
        );
        const nextContactIndex =
          currentContactIndex +
          (currentContactIndex === this.contacts.length - 1 ? -1 : 1);
        const nextContactId =
          this.contacts.length === 1 && this.contacts[0].id === id
            ? null
            : this.contacts[nextContactIndex].id;

        // Delete the contact
        this._contactsService.deleteContact(id).then((isDeleted) => {
          // Return if the contact wasn't deleted...
          if (!isDeleted) {
            return;
          }

          // Navigate to the next contact if available
          if (nextContactId) {
            this._router.navigate(["../", nextContactId], {
              relativeTo: this._activatedRoute,
            });
          }
          // Otherwise, navigate to the parent
          else {
            this._router.navigate(["../"], {
              relativeTo: this._activatedRoute,
            });
          }

          // Toggle the edit mode off
          this.toggleEditMode(false);
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  /**
   * Upload avatar
   *
   * @param fileList
   */
  uploadAvatar(fileList: FileList): void {
    // Return if canceled
    if (!fileList.length) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    const file = fileList[0];

    // Return if the file is not allowed
    if (!allowedTypes.includes(file.type)) {
      return;
    }

    // Upload the avatar
    // this._contactsService.uploadAvatar(this.contact.id, file).subscribe();
  }

  /**
   * Remove the avatar
   */
  removeAvatar(): void {
    // Get the form control for 'avatar'
    const avatarFormControl = this.contactForm.get("avatar");

    // Set the avatar as null
    avatarFormControl?.setValue(null);

    // Set the file input value as null
    this._avatarFileInput.nativeElement.value = null;

    // Update the contact
    this.contact.avatar = null;
  }

  /**
   * Add the email field
   */
  addEmailField(): void {
    // Create an empty email form group
    const emailFormGroup = this._formBuilder.group({
      email: [""],
      label: [""],
    });

    // Add the email form group to the emails form array
    (this.contactForm.get("emails") as UntypedFormArray).push(emailFormGroup);

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Remove the email field
   *
   * @param index
   */
  removeEmailField(index: number): void {
    // Get form array for emails
    const emailsFormArray = this.contactForm.get("emails") as UntypedFormArray;

    // Remove the email field
    emailsFormArray.removeAt(index);

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Add an empty phone number field
   */
  addPhoneNumberField(): void {
    // Create an empty phone number form group
    const phoneNumberFormGroup = this._formBuilder.group({
      country: ["us"],
      phoneNumber: [""],
      label: [""],
    });

    // Add the phone number form group to the phoneNumbers form array
    (this.contactForm.get("phoneNumbers") as UntypedFormArray).push(
      phoneNumberFormGroup
    );

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Remove the phone number field
   *
   * @param index
   */
  removePhoneNumberField(index: number): void {
    // Get form array for phone numbers
    const phoneNumbersFormArray = this.contactForm.get(
      "phoneNumbers"
    ) as UntypedFormArray;

    // Remove the phone number field
    phoneNumbersFormArray.removeAt(index);

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get country info by iso code
   *
   * @param iso
   */
  getCountryByIso(iso: string): Country {
    const countryFound = this.countries.find((country) => country.iso === iso);
    return countryFound as Country;
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  checkBackgroundColor(): void {
    if (!this.backgroundImage) return;
    const img = this.backgroundImage.nativeElement;

    if (this._ctx && img.complete) {
      this._canvas.width = img.width;
      this._canvas.height = img.height;
      this._ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = this._ctx.getImageData(0, 0, img.width, img.height);

      const data = imageData.data;
      let r, g, b, avg;
      let colorSum = 0;

      for (let x = 0, len = data.length; x < len; x += 4) {
        r = data[x];
        g = data[x + 1];
        b = data[x + 2];

        avg = Math.floor((r + g + b) / 3);
        colorSum += avg;
      }

      const brightness = Math.floor(colorSum / (img.width * img.height));
      this.iconColor = brightness > 125 ? "text-black" : "text-white";
    }
  }
}
