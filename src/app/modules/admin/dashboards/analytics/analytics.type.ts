export type TTimeFilter = "1m" | "3m" | "6m" | "9m" | "";

export interface DailySalesAnalytics {
  series: {
    "this-week": [
      {
        name: "Revenue";
        data: { x: Date; y: number }[];
      }
    ];
    "this-month": [
      {
        name: "Revenue";
        data: { x: Date; y: number }[];
      }
    ];
  };
}
