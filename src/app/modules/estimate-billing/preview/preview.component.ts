import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import { TextFieldModule } from "@angular/cdk/text-field";
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
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
import { EstimateBillingService } from "../estimate-billing.service";
import { countries, formatDate } from "../../utils/util";
import { IEstimate } from "../utils/estimates.types";
import { MatMenuModule } from "@angular/material/menu";
import { sendMail } from "app/services";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FuseConfirmationService } from "@fuse/services/confirmation";

@Component({
    selector: "estimate-preview",
    templateUrl: "./preview.component.html",
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
        `
      .include-color {
        print-color-adjust: exact;
      }
    `,
        `
      .include-color-head {
        print-color-adjust: exact;
        padding-top: 18px;
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
        CurrencyPipe,
        MatMenuModule,
        MatTooltipModule,
    ],
})
export class EstimatePreviewComponent {
    estimateId: string;
    estimateData: IEstimate;
    @ViewChild("estimate") estimateElement: ElementRef;

    constructor(
        private estimateService: EstimateBillingService,
        private router: Router,
        private route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef
    ) { }

    async ngOnInit() {
        this.route.params.subscribe(async (params) => {
            this.estimateId = params["id"];
            this.estimateData = (await this.estimateService.getEstimateByIdOnce(
                this.estimateId
            )) as IEstimate;

            if (!this.estimateData) {
                // Handle the case where estimateData is not available
                console.error("No estimate data available");
                return;
            }
            this._changeDetectorRef.detectChanges();
        });
    }

    sendEstimateAsEmail() {
        setTimeout(() => {
            const emailableArea = document.getElementById(
                "emailable-area"
            ) as HTMLElement;

            html2canvas(emailableArea, {
                scrollX: 0,
                scrollY: 0,
                windowWidth: emailableArea.scrollWidth,
                windowHeight: emailableArea.scrollHeight,
            })
                .then((canvas) => {
                    const pdf = new jsPDF("p", "pt", "a4");
                    const imgData = canvas.toDataURL("image/png");

                    // Calculate the number of PDF pages
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imageWidth = canvas.width;
                    const imageHeight = canvas.height;
                    const ratio = imageWidth / imageHeight;
                    const pdfImageHeight = pdfWidth / ratio;

                    // Add image to PDF, break into multiple pages if necessary
                    let position = 0;
                    while (position < imageHeight) {
                        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfImageHeight);
                        position += pdfHeight;
                        if (position < imageHeight) pdf.addPage();
                    }

                    //Save the pdf as a blob
                    const pdfBlob = pdf.output("blob");
                    console.log("Blob generated", pdfBlob);
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(pdfBlob);
                    link.download = `Estimate_Report_.pdf`;
                    link.click();

                    // sendMail({
                    //   to: "abinpaul5598@gmail.com",
                    //   subject: "Estimate",
                    //   text: "Hello",
                    //   attachments: [pdfBlob],
                    // });
                })
                .catch((err) => {
                    console.log("Errored while sending estimate as email", err);
                    console.log(err.message);
                });
        }, 2000);
    }

    formatDate(timestamp: number) {
        return formatDate(timestamp);
    }

    formatAddress(
        l1: string,
        l2: string | undefined,
        ci: string,
        c: string,
        p: string
    ) {
        return [l1, l2, ci, c, p].filter(Boolean).join(", ");
    }

    formatNumber(p: { code: string; number: string }) {
        const code = countries.find((item) => item.iso === p.code)?.code;
        return `${code} ${p.number}`;
    }

    getTotalPerItem(price: number, quantity: string) {
        return price * parseInt(quantity);
    }

    exportEstimate() {
        document.title = "Estimate -" + this.estimateData.estimateNumber;
        window.print();
    }

    onEdit(): void {
        // Navigate to edit form if needed, though standard flow might replace the add form or use a separate edit route
        // Assuming edit is not explicitly requested in detail but we can keep the hook
    }

    getTotalCostOfItem(price: number, quantity: string) {
        return price * parseInt(quantity);
    }

    /**
     * Delete estimate
     */
    deleteEstimate(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: "Delete estimate",
            message:
                "Are you sure you want to delete this estimate? This action cannot be undone!",
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
                console.log("Estimate to be deleted", this.estimateData);
                // Get the current cotact's id
                const id = this.estimateData.id;

                // Delete the contact
                this.estimateService.deleteEstimate(id).then((isDeleted) => {
                    // Return if the contact wasn't deleted...
                    if (!isDeleted) {
                        return;
                    }

                    // Otherwise, navigate to the parent

                    this.router.navigate(["../../"], {
                        relativeTo: this.route,
                    });
                });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }
}
