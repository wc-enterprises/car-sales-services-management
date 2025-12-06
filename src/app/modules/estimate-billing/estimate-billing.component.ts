import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'estimate-billing',
    templateUrl: './estimate-billing.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterOutlet],
})
export class EstimateBillingComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}
