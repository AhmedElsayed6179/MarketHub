import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { IUser } from '../models/iuser';
import { ApiUser } from './api-user';

@Injectable({
  providedIn: 'root',
})
export class UserAuth {
  public authSubject = new BehaviorSubject<boolean>(false);
  public currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public tokenSubject = new BehaviorSubject<string | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  isLoggedIn$ = this.authSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private router: Router, private apiUser: ApiUser) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.tokenSubject.next(token);
      this.authSubject.next(true);
      this.loadCurrentUserFromAPI().subscribe(); // تحميل البيانات فوراً
    }
  }

  /** تسجيل الدخول */
  Login(username: string, password: string) {
    this.loadingSubject.next(true);

    this.apiUser.GetUserByUsernamePassword(username, password).subscribe({
      next: user => {
        if (!user) {
          Swal.fire('Error', 'Invalid credentials', 'error');
          this.loadingSubject.next(false);
          return;
        }

        const token = btoa(user.id + ':' + Date.now());
        localStorage.setItem('authToken', token);
        this.tokenSubject.next(token);
        this.authSubject.next(true);
        this.currentUserSubject.next(user);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.loadingSubject.next(false);
        Swal.fire('Error', 'Login failed', 'error');
      }
    });
  }

  /** تسجيل الخروج */
  Logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem('authToken');
        this.tokenSubject.next(null);
        this.authSubject.next(false);
        this.currentUserSubject.next(null);
        this.router.navigateByUrl('/Home');
        Swal.fire('Logged Out!', 'You have been logged out successfully.', 'success');
      }
    });
  }

  /** تحقق سريع إذا كان المستخدم مسجل دخول */
  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  /** الحصول على التوكن الحالي */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /** القيمة الحالية للمستخدم فوراً */
  currentUserValue(): IUser | null {
    return this.currentUserSubject.value;
  }

  /** تعيين المستخدم في state */
  setCurrentUser(user: IUser | null) {
    this.currentUserSubject.next(user);
  }

  /** جلب المستخدم من API بناءً على التوكن */
  loadCurrentUserFromAPI(): Observable<IUser | null> {
    const token = this.tokenSubject.value;
    if (!token) return of(null);

    const userId = Number(atob(token).split(':')[0]);
    if (!userId) return of(null);

    this.loadingSubject.next(true);

    return this.apiUser.GetUserById(userId).pipe(
      tap(user => this.currentUserSubject.next(user)),
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }

  /** الحصول على المستخدم فوراً أو من API */
  getCurrentUser(): Observable<IUser | null> {
    const user = this.currentUserSubject.value;
    if (user) return of(user);

    return this.loadCurrentUserFromAPI();
  }
}

