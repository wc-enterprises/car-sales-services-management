import { Injectable } from "@angular/core";
import {
    BehaviorSubject,
    filter,
    map,
    Observable,
    of,
    switchMap,
    take,
    throwError,
} from "rxjs";
import {
    IEstimate,
    TEstimateTimeFilter,
    TEstimateTypeFilter,
} from "./utils/estimates.types";
import {
    child,
    Database,
    get,
    onValue,
    ref,
    set,
    Unsubscribe,
    update,
} from "@angular/fire/database";
import { FuseMockApiUtils } from "@fuse/lib/mock-api";
import { Contact } from "../contacts/contacts.types";
import { ICar } from "../cars/cars.types";
import { getNowAndPastDateBasedOnFilterVal } from "./utils/util";

@Injectable({ providedIn: "root" })
export class EstimateBillingService {
    private _estimate = new BehaviorSubject<IEstimate | null>(null);
    private _estimates = new BehaviorSubject<IEstimate[] | null>(null);
    private _unsubscribers: Unsubscribe[] = [];

    private estimateData: any;
    private nameOfContact: string[] = [];
    private nameOfMake: string[] = [];

    constructor(private db: Database) {
        this.getEstimates("");
    }

    destructor(): void {
        this._unsubscribers.forEach((unsubscribe) => unsubscribe());
    }

    // Accessors
    get estimate$(): Observable<IEstimate> {
        return this._estimate
            .asObservable()
            .pipe(filter((estimate): estimate is IEstimate => estimate !== null));
    }

    get estimates$(): Observable<IEstimate[]> {
        return this._estimates
            .asObservable()
            .pipe(filter((estimates): estimates is IEstimate[] => estimates !== null));
    }

    getEstimateData(): any {
        return this.estimateData;
    }

    setEstimateData(data: any): void {
        this.estimateData = data;
    }

    // Public Methods

    /**
     * Fetch and filter estimates
     */
    getEstimates(
        timeFilter: TEstimateTimeFilter = "all",
        typeFilter: TEstimateTypeFilter = "ALL",
        additionalData?: { dateRange?: { startDate: number; endDate: number } }
    ): void {
        const estimatesRef = ref(this.db, "estimates");
        const unsubsriber = onValue(estimatesRef, (snapshot) => {
            const data = snapshot.val();
            let estimates: IEstimate[] = data ? Object.values(data) : [];

            if (timeFilter !== "all") {
                const { now, pastDate } = getNowAndPastDateBasedOnFilterVal(
                    timeFilter,
                    additionalData
                );
                estimates = estimates.filter(
                    (estimate) => estimate.date >= pastDate && estimate.date <= now
                );
            }

            if (typeFilter !== "ALL") {
                estimates = estimates.filter((estimate) => estimate.type === typeFilter);
            }

            estimates.sort((a, b) => b.date - a.date);
            this._estimates.next(estimates);
        });

        this._unsubscribers.push(unsubsriber);
    }

    /**
     * Count total number of estimates
     */
    async countEstimates(): Promise<number> {
        try {
            const estimatesRef = ref(this.db, "estimates");
            const snapshot = await get(estimatesRef);
            const data = snapshot.val();
            return data ? Object.keys(data).length : 0;
        } catch (err) {
            console.error("Error counting estimates", err);
            return 0;
        }
    }

    /**
     * Fetch estimate by ID
     */
    async getEstimateByIdOnce(id: string): Promise<IEstimate | null> {
        const estimateRef = ref(this.db, `estimates/${id}`);
        const snapshot = await get(estimateRef);
        return snapshot.val();
    }

    getEstimateById(id: string): Observable<IEstimate> {
        return this._estimates.pipe(
            take(1),
            map((estimates) => estimates?.find((item) => item.id === id) || null),
            switchMap((estimate) =>
                estimate ? of(estimate) : throwError(`Estimate with ID ${id} not found!`)
            )
        );
    }

    /**
     * Create a new estimate
     */
    async createEstimate(estimateData: Omit<IEstimate, "id">): Promise<string> {
        const id = FuseMockApiUtils.guid();
        await set(ref(this.db, `estimates/${id}`), { id, ...estimateData });
        return id;
    }

    /**
     * Update an existing estimate
     */
    async updateEstimate(id: string, updatedEstimate: IEstimate): Promise<IEstimate> {
        await set(ref(this.db, `estimates/${id}`), updatedEstimate);
        this._estimate.next(updatedEstimate);
        return updatedEstimate;
    }

    /**
     * Delete an estimate by ID
     */
    async deleteEstimate(id: string): Promise<boolean> {
        try {
            await set(ref(this.db, `estimates/${id}`), null);
            return true;
        } catch (err) {
            console.error("Error deleting estimate", err);
            return false;
        }
    }

    /**
     * Retrieve contacts and make name data
     */
    async getNameOfContacts(): Promise<string[]> {
        const contactsRef = ref(this.db, "contacts");
        const snapshot = await get(contactsRef);
        const data: Record<string, Contact> = snapshot.val();
        this.nameOfContact = data
            ? Object.values(data).map((contact: Contact) => contact.name)
            : [];
        return this.nameOfContact;
    }

    async getNumberOfContacts(): Promise<string[]> {
        const contactsRef = ref(this.db, "contacts");
        const snapshot = await get(contactsRef);
        const data: Record<string, Contact> = snapshot.val();
        return data
            ? Object.values(data).flatMap(
                (contact) =>
                    contact.phoneNumbers?.map((phone) => phone.phoneNumber) ?? []
            )
            : [];
    }

    async getRegNo(): Promise<string[]> {
        const carsRef = ref(this.db, "cars");
        const snapshot = await get(carsRef);
        const data: Record<string, ICar> = snapshot.val();
        return data ? Object.values(data).map((car) => car.regNo) : [];
    }

    async makeName(): Promise<string[]> {
        const makeRef = ref(this.db, "Makes");
        const snapshot = await get(makeRef);
        const data = snapshot.val();
        this.nameOfMake = data ? Object.keys(data) : [];
        return this.nameOfMake;
    }

    async makeMap(): Promise<any> {
        const makeRef = ref(this.db, "Makes");
        const snapshot = await get(makeRef);
        return snapshot.val();
    }

    async mapRegNo(regNo: string): Promise<ICar | null> {
        const carsRef = ref(this.db, "cars");
        const snapshot = await get(carsRef);
        const data: Record<string, ICar> = snapshot.val();
        return data
            ? Object.values(data).find(
                (car) =>
                    car.regNo.replace(/[-\s]+/g, "").toLowerCase() ===
                    regNo.replace(/[-\s]+/g, "").toLowerCase()
            ) || null
            : null;
    }

    async mapName(name: string): Promise<Contact | null> {
        if (!name) return null;
        const contactsRef = ref(this.db, "contacts");
        const snapshot = await get(contactsRef);
        const data: Record<string, Contact> = snapshot.val();
        return data
            ? Object.values(data).find(
                (contact) => contact.name.toLowerCase() === name.toLowerCase()
            ) || null
            : null;
    }

    async incrementTotalEstimatesCreated(): Promise<void> {
        const totalRef = ref(this.db, "totalEstimatesCreatedSoFar");
        const snapshot = await get(totalRef);
        const total = snapshot.val() ? +snapshot.val() + 1 : 1;
        await update(ref(this.db), { totalEstimatesCreatedSoFar: total });
    }

    async totalEstimatesCreatedSoFar(): Promise<number> {
        const totalRef = ref(this.db, "totalEstimatesCreatedSoFar");
        const snapshot = await get(totalRef);
        return parseInt(snapshot.val() || "0", 10);
    }

    async storeTotalEstimateCreatedIfNotPresent(): Promise<void> {
        const totalRef = ref(this.db, "totalEstimatesCreatedSoFar");
        const snapshot = await get(totalRef);
        if (!snapshot.val()) {
            const count = await this.countEstimates();
            await update(ref(this.db), { totalEstimatesCreatedSoFar: count });
        }
    }

    /**
     * Search estimates based on query string
     */
    async searchEstimates(query: string): Promise<boolean> {
        const dbRef = ref(this.db);
        const snapshot = await get(child(dbRef, "estimates"));
        if (snapshot.exists()) {
            const estimates = Object.values(
                snapshot.val() as Record<string, IEstimate>
            ).filter((estimate: IEstimate) => {
                return (
                    (estimate.type === "SALE" &&
                        (estimate.services[0]?.total
                            ?.toString()
                            .toLowerCase()
                            .includes(query.toLowerCase()) ||
                            estimate.services[0]?.id
                                ?.toLowerCase()
                                .includes(query.toLowerCase()) ||
                            estimate.services[0]?.item
                                ?.toLowerCase()
                                .includes(query.toLowerCase()))) ||
                    estimate.carInfo?.regNo
                        ?.replace(/\s/g, "")
                        .toLowerCase()
                        .includes(query.replace(/\s/g, "").toLowerCase()) ||
                    estimate.carInfo?.make?.toLowerCase().includes(query.toLowerCase()) ||
                    estimate.carInfo?.model?.toLowerCase().includes(query.toLowerCase()) ||
                    estimate.billTo?.name
                        ?.replace(/\s/g, "")
                        .toLowerCase()
                        .includes(query.replace(/\s/g, "").toLowerCase())
                );
            });

            this._estimates.next(estimates);
            return true;
        } else {
            console.error("No data found");
            return false;
        }
    }
}
