import { CurrencyPipe, DatePipe, DecimalPipe, NgFor } from "@angular/common";
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
import { AnalyticsService } from "app/modules/admin/dashboards/analytics/analytics.service";
import { ApexOptions, NgApexchartsModule } from "ng-apexcharts";
import { Subject, takeUntil } from "rxjs";
import { FinanceService } from "../finance/finance.service";
import { MatSort } from "@angular/material/sort";
import { MatDividerModule } from "@angular/material/divider";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { InvoicesService } from "../../apps/invoices/invoices.service";
import { IInvoice } from "../../apps/invoices/invoices.types";

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
  ],
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild("recentTransactionsTable", { read: MatSort })
  recentTransactionsTableMatSort: MatSort;

  chartVisitors: ApexOptions;
  chartConversions: ApexOptions;
  chartImpressions: ApexOptions;
  chartVisits: ApexOptions;
  chartVisitorsVsPageViews: ApexOptions;
  chartNewVsReturning: ApexOptions;
  chartGender: ApexOptions;
  chartTopMakes: ApexOptions;
  chartTopServices: ApexOptions;
  chartLanguage: ApexOptions;
  data: any;
  recentTransactionsDataSource: MatTableDataSource<any> =
    new MatTableDataSource();
  recentTransactionsTableColumns: string[] = [
    "transactionId",
    "date",
    "name",
    "amount",
    "status",
  ];
  latestFiveInvoices: IInvoice[] = [];
  totalSalesInvoiceForMonth: number = 0;
  totalServicesInvoiceForMonth: number = 0;
  totalSalesRevenueForMonth: number = 0;
  totalServicesRevenueForMonth: number = 0;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _analyticsService: AnalyticsService,
    private _router: Router,
    private _financeService: FinanceService,
    private _invoiceService: InvoicesService
  ) {}

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
        const getInvoiceMetrics = (invoices: IInvoice[]) => {
          const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
          const currentYear = new Date().getFullYear();

          // Sort invoices by date in descending order and get the latest five
          const latestFiveInvoices = invoices
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5);

          let totalSalesInvoiceForMonth = 0;
          let totalServicesInvoiceForMonth = 0;
          let totalSalesRevenueForMonth = 0;
          let totalServicesRevenueForMonth = 0;

          invoices.forEach((invoice) => {
            const invoiceDate = new Date(invoice.date);
            const invoiceMonth = invoiceDate.getMonth() + 1;
            const invoiceYear = invoiceDate.getFullYear();

            // Check if the invoice is from the current month and year
            if (invoiceMonth === currentMonth && invoiceYear === currentYear) {
              if (invoice.type === "SALE") {
                totalSalesInvoiceForMonth++;
                totalSalesRevenueForMonth += (invoice as any).subtotal;
              } else if (invoice.type === "SERVICE") {
                totalServicesInvoiceForMonth++;
                totalServicesRevenueForMonth += (invoice as any).subtotal;
              }
            }
          });

          return {
            latestFiveInvoices,
            totalSalesInvoiceForMonth,
            totalServicesInvoiceForMonth,
            totalSalesRevenueForMonth,
            totalServicesRevenueForMonth,
          };
        };

        if (data && data.length) {
          const {
            latestFiveInvoices,
            totalSalesInvoiceForMonth,
            totalServicesInvoiceForMonth,
            totalSalesRevenueForMonth,
            totalServicesRevenueForMonth,
          } = getInvoiceMetrics(data);

          this.latestFiveInvoices = latestFiveInvoices;
          this.totalSalesInvoiceForMonth = totalSalesInvoiceForMonth;
          this.totalServicesInvoiceForMonth = totalServicesInvoiceForMonth;
          this.totalSalesRevenueForMonth = totalSalesRevenueForMonth;
          this.totalServicesRevenueForMonth = totalServicesRevenueForMonth;

          console.log(
            {
              latestFiveInvoices,
              totalSalesInvoiceForMonth,
              totalServicesInvoiceForMonth,
              totalSalesRevenueForMonth,
              totalServicesRevenueForMonth,
            },
            "data"
          );
        }
      });

    // Get the data
    this._analyticsService.data$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        // Store the data
        this.data = data;

        // Prepare the chart data
        this._prepareChartData();
      });

    // Get the data
    this._financeService.data$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        console.log(data, "financial data");
        // Store the table data
        this.recentTransactionsDataSource.data = data.recentTransactions;
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
    // Visitors
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
      series: this.data.visitors.series,
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

    // Conversions
    this.chartConversions = {
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
      colors: ["#38BDF8"],
      fill: {
        colors: ["#38BDF8"],
        opacity: 0.5,
      },
      series: this.data.conversions.series,
      stroke: {
        curve: "smooth",
      },
      tooltip: {
        followCursor: true,
        theme: "dark",
      },
      xaxis: {
        type: "category",
        categories: this.data.conversions.labels,
      },
      yaxis: {
        labels: {
          formatter: (val): string => val.toString(),
        },
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

    // New vs. returning
    this.chartNewVsReturning = {
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
      labels: this.data.newVsReturning.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: "70%",
          },
        },
      },
      series: this.data.newVsReturning.series,
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

    // Gender
    this.chartGender = {
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
      labels: this.data.gender.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: "70%",
          },
        },
      },
      series: this.data.gender.series,
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

    // Age
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
      labels: this.data.topMakes.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: "70%",
          },
        },
      },
      series: this.data.topMakes.series,
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

    // Language
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
      labels: this.data.topServices.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: "70%",
          },
        },
      },
      series: this.data.topServices.series,
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
}
