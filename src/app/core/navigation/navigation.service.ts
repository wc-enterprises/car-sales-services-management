import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Navigation } from "app/core/navigation/navigation.types";
import { Observable, of, ReplaySubject, tap } from "rxjs";
import { defaultNavigation } from "./utils";

@Injectable({ providedIn: "root" })
export class NavigationService {
  private _httpClient = inject(HttpClient);
  private _navigation: ReplaySubject<Navigation> =
    new ReplaySubject<Navigation>(1);

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for navigation
   */
  get navigation$(): Observable<Navigation> {
    return this._navigation.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all navigation data
   */
  get(): Observable<Navigation> {
    const navigation: Navigation = {
      default: defaultNavigation,
    };
    this._navigation.next(navigation);
    return of(navigation);
  }
}
