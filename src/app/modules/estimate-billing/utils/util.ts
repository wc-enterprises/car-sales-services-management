import { TEstimateTimeFilter } from "./estimates.types";

export function getNowAndPastDateBasedOnFilterVal(
    filter: TEstimateTimeFilter,
    additionalData?: { dateRange?: { startDate: number; endDate: number } }
): {
    now: number;
    pastDate: number;
} {
    let now = Date.now();
    let pastDate: number;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    switch (filter) {
        case "1m":
            pastDate = new Date(
                currentDate.setMonth(currentDate.getMonth() - 1)
            ).getTime();
            return { now, pastDate };

        case "3m":
            pastDate = new Date(
                currentDate.setMonth(currentDate.getMonth() - 3)
            ).getTime();
            return { now, pastDate };

        case "6m":
            pastDate = new Date(
                currentDate.setMonth(currentDate.getMonth() - 6)
            ).getTime();
            return { now, pastDate };

        case "cfy":
            if (currentMonth >= 3) {
                // April is month 3 in JS Date
                pastDate = new Date(currentYear, 3, 1).getTime(); // April 1st of current year
            } else {
                pastDate = new Date(currentYear - 1, 3, 1).getTime(); // April 1st of last year
            }
            return { now, pastDate };

        case "lfy":
            if (currentMonth >= 3) {
                now = new Date(currentYear, 2, 31, 23, 59, 59).getTime(); // March 31st of this year
                pastDate = new Date(currentYear - 1, 3, 1).getTime(); // April 1st of last year
            } else {
                now = new Date(currentYear - 1, 2, 31, 23, 59, 59).getTime(); // March 31st of last year
                pastDate = new Date(currentYear - 2, 3, 1).getTime(); // April 1st of two years ago
            }
            return { now, pastDate };

        case "dr":
            now = additionalData?.dateRange?.endDate || now;
            pastDate = additionalData?.dateRange?.startDate || now;
            return { now, pastDate };

        default:
            return { now, pastDate: now };
    }
}
