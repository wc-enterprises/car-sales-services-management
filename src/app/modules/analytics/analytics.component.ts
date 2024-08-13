import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  NgFor,
  NgIf,
} from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Router } from "@angular/router";

import { ApexOptions, NgApexchartsModule } from "ng-apexcharts";
import { Subject, takeUntil } from "rxjs";

import { MatSort } from "@angular/material/sort";
import { MatDividerModule } from "@angular/material/divider";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import { DailySalesAnalytics, TTimeFilter } from "./analytics.type";
import { DateTime } from "luxon";
import { CarsService } from "../cars/cars.service";
import { ContactsService } from "../contacts/contacts.service";
import { InvoicesService } from "../invoices/invoices.service";
import { IInvoice, IInvoiceType } from "../invoices/invoices.types";
import { AnalyticsService } from "./analytics.service";

export interface IChartData {
  total: number;
  percentSplits: number[];
  labels: string[];
}

@Component({
  selector: "analytics",
  templateUrl: "./analytics.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonToggleModule,
    NgApexchartsModule,
    MatTooltipModule,
    NgFor,
    DecimalPipe,
    MatTableModule,
    MatDividerModule,
    MatProgressBarModule,
    CurrencyPipe,
    DatePipe,
    NgIf,
  ],
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild("recentTransactionsTable", { read: MatSort })
  recentTransactionsTableMatSort: MatSort;
  now = DateTime.local();

  chartVisitors: ApexOptions;

  chartServicesBills: ApexOptions;
  chartSalesBills: ApexOptions;
  /**
   * Weekly no of service customers served for a month.
   */
  serviceBillsStats = {
    series: [
      {
        name: "Service bills",
        data: [0, 0, 0, 0],
      },
    ],
    labels: [],
  };
  /**
   * Weekly no of sales customers served for a month.
   */
  salesBillsStats = {
    series: [
      {
        name: "Sales bills",
        data: [0, 0, 0, 0],
      },
    ],
    labels: [],
  };
  totalNoOfInvoicesFilter: TTimeFilter = "1m";
  totalNoOfSalesInvoice: number = 0;
  totalNoOfServicesInvoice: number = 0;

  chartImpressions: ApexOptions;
  chartVisits: ApexOptions;
  chartVisitorsVsPageViews: ApexOptions;

  chartServiceCustomersNewVsReturning: ApexOptions;
  serviceCustomersNewVsReturningData: IChartData;
  serviceCustomerNewVsReturningFilter: TTimeFilter = "1m";

  chartSalesCustomersNewVsReturning: ApexOptions;
  saleCustomersNewVsReturningData: IChartData;
  salesCustomerNewVsReturningFilter: TTimeFilter = "1m";

  chartTopMakes: ApexOptions;
  topMakesData: IChartData;
  topMakeFilter: TTimeFilter = "1m";

  chartTopServices: ApexOptions;
  topServicesData: IChartData;
  topServiceFilter: TTimeFilter = "1m";

  dailySalesData: DailySalesAnalytics = {
    series: {
      "this-week": [
        {
          name: "Revenue",
          data: [],
        },
      ],
      "this-month": [
        {
          name: "Revenue",
          data: [],
        },
      ],
    },
  };

  invoicesData: IInvoice[];

  chartLanguage: ApexOptions;
  data: any;
  recentTransactionsDataSource: MatTableDataSource<any> =
    new MatTableDataSource();
  recentTransactionsTableColumns: string[] = [
    "invoiceId",
    "date",
    "type",
    "customerName",
    "amount",
  ];
  latestFiveInvoices: IInvoice[] = [];
  totalSalesRevenueForMonth: number = 0;
  totalServicesRevenueForMonth: number = 0;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _analyticsService: AnalyticsService,
    private _router: Router,
    private _invoiceService: InvoicesService,
    private _contactService: ContactsService,
    private _carsService: CarsService
  ) {
    this.checkIfDefaultDataPresent();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Get the invoices
    this._invoiceService.invoices$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        console.log("Invoice Data", data);
        this.invoicesData = data;

        this.getCustomersNewVsReturningNumbers("1m", "SERVICE");
        this.getCustomersNewVsReturningNumbers("1m", "SALE");
        this.getTopMakeOrService("1m", "make");
        this.getTopMakeOrService("1m", "service");
        this.getRevenuePerDayForThisMonthAndWeek();
        this.totalInvoicesAndWeeklyNumbersBasedOnType(
          this.totalNoOfInvoicesFilter
        );

        const getInvoiceMetrics = (invoices: IInvoice[]) => {
          const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
          const currentYear = new Date().getFullYear();

          // Sort invoices by date in descending order and get the latest five
          const latestFiveInvoices = invoices
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5);

          let totalSalesRevenueForMonth = 0;
          let totalServicesRevenueForMonth = 0;

          invoices.forEach((invoice) => {
            const invoiceDate = new Date(invoice.date);
            const invoiceMonth = invoiceDate.getMonth() + 1;
            const invoiceYear = invoiceDate.getFullYear();

            // Check if the invoice is from the current month and year
            if (invoiceMonth === currentMonth && invoiceYear === currentYear) {
              if (invoice.type === "SALE") {
                totalSalesRevenueForMonth += (invoice as any).total;
              } else if (invoice.type === "SERVICE") {
                totalServicesRevenueForMonth += (invoice as any).total;
              }
            }
          });

          return {
            latestFiveInvoices,
            totalSalesRevenueForMonth,
            totalServicesRevenueForMonth,
          };
        };

        if (data && data.length) {
          const {
            latestFiveInvoices,
            totalSalesRevenueForMonth,
            totalServicesRevenueForMonth,
          } = getInvoiceMetrics(data);

          this.latestFiveInvoices = latestFiveInvoices;
          this.totalSalesRevenueForMonth = totalSalesRevenueForMonth;
          this.totalServicesRevenueForMonth = totalServicesRevenueForMonth;
          this.recentTransactionsDataSource.data = latestFiveInvoices;

          console.log(
            {
              latestFiveInvoices,
              totalSalesRevenueForMonth,
              totalServicesRevenueForMonth,
            },
            "data"
          );
        }

        // Get the data
        this._analyticsService.data$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data) => {
            // Store the data
            this.data = data;
            console.log("visitor data from api", this.data.visitors);

            // Prepare the chart data
            this._prepareChartData();
          });
      });

    // Attach SVG fill fixer to all ApexCharts
    window["Apex"] = {
      chart: {
        events: {
          mounted: (chart: any, options?: any): void => {
            this._fixSvgFill(chart.el);
          },
          updated: (chart: any, options?: any): void => {
            this._fixSvgFill(chart.el);
          },
        },
      },
    };
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // Make the data source sortable
    this.recentTransactionsDataSource.sort =
      this.recentTransactionsTableMatSort;
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  getTotalRevenueOfMonth() {
    return this.totalSalesRevenueForMonth + this.totalServicesRevenueForMonth;
  }

  routeToInvoiceListPage() {
    this._router.navigate(["/inventory-and-invoice/invoices"]);
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

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Fix the SVG fill references. This fix must be applied to all ApexCharts
   * charts in order to fix 'black color on gradient fills on certain browsers'
   * issue caused by the '<base>' tag.
   *
   * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
   *
   * @param element
   * @private
   */
  private _fixSvgFill(element: Element): void {
    // Current URL
    const currentURL = this._router.url;

    // 1. Find all elements with 'fill' attribute within the element
    // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
    // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
    Array.from(element.querySelectorAll("*[fill]"))
      .filter((el) => el.getAttribute("fill").indexOf("url(") !== -1)
      .forEach((el) => {
        const attrVal = el.getAttribute("fill");
        el.setAttribute(
          "fill",
          `url(${currentURL}${attrVal.slice(attrVal.indexOf("#"))}`
        );
      });
  }

  /**
   * Prepare the chart data from the data
   *
   * @private
   */
  private _prepareChartData(): void {
    // Total Revenue
    this.chartVisitors = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        width: "100%",
        height: "100%",
        type: "area",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ["#818CF8"],
      dataLabels: {
        enabled: false,
      },
      fill: {
        colors: ["#312E81"],
      },
      grid: {
        show: true,
        borderColor: "#334155",
        padding: {
          top: 10,
          bottom: -40,
          left: 0,
          right: 0,
        },
        position: "back",
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      series: this.dailySalesData.series as any,
      stroke: {
        width: 2,
      },
      tooltip: {
        followCursor: true,
        theme: "dark",
        x: {
          format: "MMM dd, yyyy",
        },
        y: {
          formatter: (value: number): string => `${value}`,
        },
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          stroke: {
            color: "#475569",
            dashArray: 0,
            width: 2,
          },
        },
        labels: {
          offsetY: -20,
          style: {
            colors: "#CBD5E1",
          },
        },
        tickAmount: 20,
        tooltip: {
          enabled: false,
        },
        type: "datetime",
      },
      yaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        min: (min): number => min - 750,
        max: (max): number => max + 250,
        tickAmount: 5,
        show: false,
      },
    };

    // Impressions
    this.chartImpressions = {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        height: "100%",
        type: "area",
        sparkline: {
          enabled: true,
        },
      },
      colors: ["#34D399"],
      fill: {
        colors: ["#34D399"],
        opacity: 0.5,
      },
      series: this.data.impressions.series,
      stroke: {
        curve: "smooth",
      },
      tooltip: {
        followCursor: true,
        theme: "dark",
      },
      xaxis: {
        type: "category",
        categories: this.data.impressions.labels,
      },
      yaxis: {
        labels: {
          formatter: (val): string => val.toString(),
        },
      },
    };

    // Visits
    this.chartVisits = {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        height: "100%",
        type: "area",
        sparkline: {
          enabled: true,
        },
      },
      colors: ["#FB7185"],
      fill: {
        colors: ["#FB7185"],
        opacity: 0.5,
      },
      series: this.data.visits.series,
      stroke: {
        curve: "smooth",
      },
      tooltip: {
        followCursor: true,
        theme: "dark",
      },
      xaxis: {
        type: "category",
        categories: this.data.visits.labels,
      },
      yaxis: {
        labels: {
          formatter: (val): string => val.toString(),
        },
      },
    };

    // Visitors vs Page Views
    this.chartVisitorsVsPageViews = {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        height: "100%",
        type: "area",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ["#64748B", "#94A3B8"],
      dataLabels: {
        enabled: false,
      },
      fill: {
        colors: ["#64748B", "#94A3B8"],
        opacity: 0.5,
      },
      grid: {
        show: false,
        padding: {
          bottom: -40,
          left: 0,
          right: 0,
        },
      },
      legend: {
        show: false,
      },
      series: this.data.visitorsVsPageViews.series,
      stroke: {
        curve: "smooth",
        width: 2,
      },
      tooltip: {
        followCursor: true,
        theme: "dark",
        x: {
          format: "MMM dd, yyyy",
        },
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        labels: {
          offsetY: -20,
          rotate: 0,
          style: {
            colors: "var(--fuse-text-secondary)",
          },
        },
        tickAmount: 3,
        tooltip: {
          enabled: false,
        },
        type: "datetime",
      },
      yaxis: {
        labels: {
          style: {
            colors: "var(--fuse-text-secondary)",
          },
        },
        max: (max): number => max + 250,
        min: (min): number => min - 250,
        show: false,
        tickAmount: 5,
      },
    };

    // Services New vs. returning
    this.chartServiceCustomersNewVsReturning = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        height: "100%",
        type: "donut",
        sparkline: {
          enabled: true,
        },
      },
      colors: ["#3182CE", "#63B3ED"],
      labels: this.serviceCustomersNewVsReturningData.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: "70%",
          },
        },
      },
      series: this.serviceCustomersNewVsReturningData.percentSplits,
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          filter: {
            type: "none",
          },
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: "dark",
        custom: ({
          seriesIndex,
          w,
        }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
      },
    };

    // Sales New vs. returning
    this.chartSalesCustomersNewVsReturning = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        height: "100%",
        type: "donut",
        sparkline: {
          enabled: true,
        },
      },
      colors: ["#319795", "#4FD1C5"],
      labels: this.saleCustomersNewVsReturningData.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: "70%",
          },
        },
      },
      series: this.saleCustomersNewVsReturningData.percentSplits,
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          filter: {
            type: "none",
          },
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: "dark",
        custom: ({
          seriesIndex,
          w,
        }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                     <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                     <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                     <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                 </div>`,
      },
    };

    // Top Makes
    this.chartTopMakes = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        height: "100%",
        type: "donut",
        sparkline: {
          enabled: true,
        },
      },
      colors: ["#DD6B20", "#F6AD55", "#dd3f20", "#dd9b20"],
      labels: this.topMakesData.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: "70%",
          },
        },
      },
      series: this.topMakesData.percentSplits,
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          filter: {
            type: "none",
          },
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: "dark",
        custom: ({
          seriesIndex,
          w,
        }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
      },
    };

    // Top Services
    this.chartTopServices = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        height: "100%",
        type: "donut",
        sparkline: {
          enabled: true,
        },
      },
      colors: ["#805AD5", "#B794F4", "#ba5ad5", "#3f3ac9"],
      labels: this.topServicesData.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: "70%",
          },
        },
      },
      series: this.topServicesData.percentSplits,
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          filter: {
            type: "none",
          },
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: "dark",
        custom: ({
          seriesIndex,
          w,
        }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
      },
    };
  }

  getRevenuePerDayForThisMonthAndWeek() {
    const now = DateTime.local();
    const startOfMonth = now.startOf("month");
    const endOfMonth = now.endOf("month");

    // Filter invoices from the current month
    const invoicesThisMonth = this.invoicesData
      ? this.invoicesData.filter((invoice) => {
          const invoiceDate = DateTime.fromMillis(invoice.date);
          return invoiceDate >= startOfMonth && invoiceDate <= endOfMonth;
        })
      : [];

    // Calculate total sales for each day of the current month
    const salesData: { [key: string]: number } = {};

    for (
      let day = startOfMonth;
      day <= endOfMonth;
      day = day.plus({ days: 1 })
    ) {
      const dateString = day.toISODate();
      salesData[dateString] = 0; // Initialize sales count for each day
    }

    invoicesThisMonth.forEach((invoice) => {
      const invoiceDate = DateTime.fromMillis(invoice.date).toISODate();
      if (salesData[invoiceDate] !== undefined) {
        salesData[invoiceDate] += invoice.services.reduce(
          (sum, service) => sum + service.price * service.quantity,
          0
        );
      }
    });

    // Format data for "this-month"
    const thisMonthData = Object.keys(salesData).map((date) => ({
      x: DateTime.fromISO(date).toJSDate(),
      y: salesData[date],
    }));

    this.dailySalesData.series["this-month"][0].data = thisMonthData;

    // Calculate weekly numbers as well
    const startOfWeek = now.startOf("week");
    const endOfWeek = now.endOf("week");

    const invoicesThisWeek = invoicesThisMonth.filter((invoice) => {
      const invoiceDate = DateTime.fromMillis(invoice.date);
      return invoiceDate >= startOfWeek && invoiceDate <= endOfWeek;
    });

    const weeklySalesData: { [key: string]: number } = {};

    for (let day = startOfWeek; day <= endOfWeek; day = day.plus({ days: 1 })) {
      const dateString = day.toISODate();
      weeklySalesData[dateString] = 0; // Initialize sales count for each day
    }

    invoicesThisWeek.forEach((invoice) => {
      const invoiceDate = DateTime.fromMillis(invoice.date).toISODate();
      if (weeklySalesData[invoiceDate] !== undefined) {
        weeklySalesData[invoiceDate] += invoice.services.reduce(
          (sum, service) => sum + service.price * service.quantity,
          0
        );
      }
    });

    const thisWeekData = Object.keys(weeklySalesData).map((date) => ({
      x: DateTime.fromISO(date).toJSDate(),
      y: weeklySalesData[date],
    }));

    this.dailySalesData.series["this-week"][0].data = thisWeekData;

    console.log("new daily sales per month", this.dailySalesData);
  }

  private filterInvoicesByTime(
    currentTime: number,
    months: number
  ): IInvoice[] {
    const pastDate = new Date(currentTime).setMonth(
      new Date(currentTime).getMonth() - months
    );
    if (!this.invoicesData?.length) return [];
    return this.invoicesData.filter((invoice) => {
      const invoiceDate = invoice.date;
      return invoiceDate >= pastDate && invoiceDate <= currentTime;
    });
  }

  getCustomersNewVsReturningNumbers(
    filterValue: TTimeFilter,
    invoiceType: IInvoiceType
  ) {
    console.log(
      "Received request to getCustomersNewVsReturningNumbers for : ",
      { filterValue, invoiceType }
    );
    let timeFilteredServiceInvoices: IInvoice[] = [];
    const now = Date.now();

    switch (filterValue) {
      case "1m":
        timeFilteredServiceInvoices = this.filterInvoicesByTime(now, 1);
        break;

      case "3m":
        timeFilteredServiceInvoices = this.filterInvoicesByTime(now, 1);
        break;

      case "9m":
        timeFilteredServiceInvoices = this.filterInvoicesByTime(now, 1);
        break;
    }

    const serviceInvoices = timeFilteredServiceInvoices.filter(
      (item) => item.type === invoiceType
    );

    // Get customer info
    let newCustomers = 0;
    let returningCustomers = 0;

    serviceInvoices.forEach((invoice) => {
      if (invoice.date === invoice.billTo.createdDate) newCustomers++;
      else returningCustomers++;
    });

    const percentOfNewCustomer = serviceInvoices.length
      ? Math.round((newCustomers / serviceInvoices.length) * 100)
      : 0;
    const percentOfReturningCustomer = serviceInvoices.length
      ? Math.round((returningCustomers / serviceInvoices.length) * 100)
      : 0;

    console.log("sericeCustomerData", {
      newCustomers,
      returningCustomers,
      total: serviceInvoices.length,
      percentOfNewCustomer,
      percentOfReturningCustomer,
    });

    if (invoiceType === "SERVICE")
      this.serviceCustomersNewVsReturningData = {
        total: serviceInvoices.length,
        percentSplits: [percentOfNewCustomer, percentOfReturningCustomer],
        labels: ["New", "Returning"],
      };
    else if (invoiceType === "SALE")
      this.saleCustomersNewVsReturningData = {
        total: serviceInvoices.length,
        percentSplits: [percentOfNewCustomer, percentOfReturningCustomer],
        labels: ["New", "Returning"],
      };
  }

  getTopMakeOrService(
    filterValue: TTimeFilter,
    dataToCollect: "make" | "service"
  ) {
    console.log("Received request to get top make or service for : ", {
      filterValue,
      dataToCollect,
    });
    let timeFilteredServiceInvoices: IInvoice[] = [];
    const now = Date.now();

    switch (filterValue) {
      case "1m":
        timeFilteredServiceInvoices = this.filterInvoicesByTime(now, 1);
        break;

      case "3m":
        timeFilteredServiceInvoices = this.filterInvoicesByTime(now, 1);
        break;

      case "9m":
        timeFilteredServiceInvoices = this.filterInvoicesByTime(now, 1);
        break;
    }

    const serviceInvoices = timeFilteredServiceInvoices.filter(
      (item) => item.type === "SERVICE"
    );

    if (dataToCollect === "make") {
      const totalMakesServiced = serviceInvoices.map(
        (invoice) => invoice.carInfo.make
      );

      const makeCounts = this.countOccurrences(totalMakesServiced);
      const topMakes = this.getTopItems(makeCounts);

      this.topMakesData = {
        total: serviceInvoices.length,
        percentSplits: topMakes.percentSplits, // Eg: 30, 20, 10, 40
        labels: topMakes.labels, // Eg: "Tesla", "Nissan", "Toyota", "Honda"
      };
      console.log("this.topMakesDAta", this.topMakesData);
    } else if (dataToCollect === "service") {
      const totalServices = serviceInvoices
        .map((invoice) => invoice.services.map((service) => service.item))
        .flat();

      const serviceCounts = this.countOccurrences(totalServices);
      const topServices = this.getTopItems(serviceCounts);

      this.topServicesData = {
        total: serviceInvoices.length,
        percentSplits: topServices.percentSplits,
        labels: topServices.labels,
      };
      console.log("Total services data", this.topServicesData);
    }
  }

  private countOccurrences(items: string[]): { [key: string]: number } {
    return items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }

  private getTopItems(counts: { [key: string]: number }): {
    labels: string[];
    percentSplits: number[];
  } {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const topItems = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 3);
    const labels = [...topItems, "Others"];
    const percentSplits = topItems.map((item) =>
      Math.round((counts[item] / total) * 100)
    );
    /**
     * Calculate the 'Others' percentage
     */
    percentSplits.push(
      100 - percentSplits.reduce((sum, count) => sum + count, 0)
    );

    return { labels, percentSplits };
  }

  updateFilter(
    value: TTimeFilter,
    filterToUpdate:
      | "serviceCustomer"
      | "saleCustomer"
      | "topMake"
      | "topService"
      | "totalNoOfInvoices"
  ) {
    switch (filterToUpdate) {
      case "serviceCustomer":
        this.serviceCustomerNewVsReturningFilter = value;
        this.getCustomersNewVsReturningNumbers(value, "SERVICE");
        break;

      case "saleCustomer":
        this.salesCustomerNewVsReturningFilter = value;
        this.getCustomersNewVsReturningNumbers(value, "SALE");
        break;

      case "topMake":
        this.topMakeFilter = value;
        this.getTopMakeOrService(value, "make");
        break;

      case "topService":
        this.topServiceFilter = value;
        this.getTopMakeOrService(value, "service");
        break;

      case "totalNoOfInvoices":
        this.totalNoOfInvoicesFilter = value;
        this.totalInvoicesAndWeeklyNumbersBasedOnType(value);
        break;
    }
  }

  getDisplayValueForFilter(timeFilter: TTimeFilter) {
    switch (timeFilter) {
      case "1m":
        return "30 days";
      case "3m":
        return "3 months";
      case "6m":
        return "6 months";
      case "9m":
        return "9 months";
    }
  }

  checkIfDefaultDataPresent() {
    /** Check if default countries list present in db, else populate */
    this._contactService.addCountriesIfNotAlreadyPresent();
    this._carsService.addMakesIfNotPresent();
  }

  /**
   * Total number of service and sales invoices
   */
  totalInvoicesAndWeeklyNumbersBasedOnType(timeFilter: TTimeFilter) {
    console.log(
      "Received request to calc total invoices and weekly numbers based on type for time: ",
      timeFilter
    );
    // Get all invoices data
    const invoiceData = this.invoicesData;

    // Define how many weeks to consider based on the time filter
    const weeksToConsider =
      timeFilter === "1m"
        ? 4
        : timeFilter === "3m"
        ? 12
        : timeFilter === "6m"
        ? 24
        : 4;
    console.log("weeksToConsider: ", weeksToConsider);

    // Initialize the stats objects
    const serviceBillsStats = {
      series: [{ name: "Service bills", data: [] }],
      labels: [],
    };
    const salesBillsStats = {
      series: [{ name: "Sales bills", data: [] }],
      labels: [],
    };

    // Calculate the starting point, aligning with the last full week
    const now = this.now;
    const startOfWeek = now.startOf("week");
    const startDate = startOfWeek.minus({ weeks: weeksToConsider - 1 });
    this.totalNoOfServicesInvoice = 0;
    this.totalNoOfSalesInvoice = 0;

    // Iterate through each week, counting invoices
    for (let i = 0; i < weeksToConsider; i++) {
      const weekStart = startDate.plus({ weeks: i });
      const weekEnd = weekStart.endOf("week");

      // Filter invoices for this week
      const serviceInvoicesThisWeek = invoiceData.filter(
        (invoice) =>
          DateTime.fromMillis(invoice.date) >= weekStart &&
          DateTime.fromMillis(invoice.date) <= weekEnd &&
          invoice.type === "SERVICE"
      );

      const salesInvoicesThisWeek = invoiceData.filter(
        (invoice) =>
          DateTime.fromMillis(invoice.date) >= weekStart &&
          DateTime.fromMillis(invoice.date) <= weekEnd &&
          invoice.type === "SALE"
      );

      // Push the counts and labels into the respective arrays
      serviceBillsStats.series[0].data.push(serviceInvoicesThisWeek.length);
      this.totalNoOfServicesInvoice += serviceInvoicesThisWeek.length;
      this.totalNoOfSalesInvoice += salesInvoicesThisWeek.length;
      salesBillsStats.series[0].data.push(salesInvoicesThisWeek.length);

      // Format and push the label (e.g., "01 Jan - 07 Jan")
      serviceBillsStats.labels.push(
        weekStart.toFormat("dd MMM") + " - " + weekEnd.toFormat("dd MMM")
      );
      salesBillsStats.labels.push(
        weekStart.toFormat("dd MMM") + " - " + weekEnd.toFormat("dd MMM")
      );
    }

    console.log("serviceBillsStatus", serviceBillsStats);
    console.log("salesBillsStats", salesBillsStats);

    // Assign the computed stats to the class properties
    this.serviceBillsStats = serviceBillsStats;
    this.salesBillsStats = salesBillsStats;
    this._prepareTotalCustomersCharts();
  }

  _prepareTotalCustomersCharts() {
    // Service Bills
    this.chartServicesBills = {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        height: "100%",
        type: "line",
        sparkline: {
          enabled: true,
        },
      },
      colors: ["#38BDF8"],
      fill: {
        colors: ["#ffffff"],
        opacity: 1,
      },
      series: this.serviceBillsStats.series,
      stroke: {
        curve: "smooth",
      },
      tooltip: {
        followCursor: true,
        theme: "dark",
      },
      xaxis: {
        type: "category",
        categories: this.serviceBillsStats.labels,
      },
      yaxis: {
        labels: {
          formatter: (val): string => val.toString(),
        },
      },
    };

    // Sales Bills
    this.chartSalesBills = {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: "inherit",
        foreColor: "inherit",
        height: "100%",
        type: "line",
        sparkline: {
          enabled: true,
        },
      },
      colors: ["#70FFE3"],
      fill: {
        colors: ["#ffffff"],
        opacity: 1,
      },
      series: this.salesBillsStats.series,
      stroke: {
        curve: "smooth",
      },
      tooltip: {
        followCursor: true,
        theme: "dark",
      },
      xaxis: {
        type: "category",
        categories: this.salesBillsStats.labels,
      },
      yaxis: {
        labels: {
          formatter: (val): string => val.toString(),
        },
      },
    };
  }
}
