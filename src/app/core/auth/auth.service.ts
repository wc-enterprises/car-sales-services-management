import { Injectable } from "@angular/core";
import {
  Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
  authState,
} from "@angular/fire/auth";
import { BehaviorSubject, map, Observable, of, throwError } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthService {
  private _authChecked: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public _user: BehaviorSubject<User> = new BehaviorSubject(null);

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      this._user.next(user);
      this._authChecked.next(true); // Auth state has been checked
    });
  }

  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  get authChecked$(): Observable<boolean> {
    return this._authChecked.asObservable();
  }

  isUserLoggedIn() {
    return authState(this.auth).pipe(map((user) => !!user));
  }

  getLoggedInUserDetails() {
    return authState(this.auth).pipe(map((user) => user));
  }

  signIn(email: string, password: string) {
    console.log("Received request to signIn for data: ", email, password);
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("User signIn successful", user);
        return user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("User sign in failed", { errorCode, errorMessage });
        return { errorCode, errorMessage };
      });
  }

  signUp(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.log("User", user);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.log("Error:", errorCode, errorMessage);
      });
  }

  sendPasswordResetEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email)
      .then(() => {
        // Password reset email sent!
        // ..
        console.log("Password reset email send.");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.log("Password reset errored: ", errorCode, errorMessage);
      });
  }

  signOut() {
    signOut(this.auth)
      .then((data) => {
        // Signed up

        console.log("User signout successfull.", data);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.log("Error: User signout errored:", errorCode, errorMessage);
      });
  }
}
