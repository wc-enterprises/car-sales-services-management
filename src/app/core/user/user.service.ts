import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { User } from "app/core/user/user.types";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Injectable({ providedIn: "root" })
export class UserService {
  private _httpClient = inject(HttpClient);
  private _user: BehaviorSubject<User> = new BehaviorSubject<User>({} as any);

  constructor(private _authService: AuthService) {}
  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for user
   *
   * @param value
   */
  set user(value: User) {
    // Store the value
    this._user.next(value);
  }

  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get the current signed-in user data
   */
  get(): Observable<User> {
    return this._authService._user.pipe(
      tap((user) => {
        this._user.next(user as User);
      })
    ) as Observable<User>;
  }

  /**
   * Update the user
   *
   * @param user
   */
  update(user: User): Observable<any> {
    return this._httpClient.patch<User>("api/common/user", { user }).pipe(
      map((response) => {
        this._user.next(response);
      })
    );
  }
}
