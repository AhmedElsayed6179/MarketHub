import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { UserAuth } from '../../service/user-auth';
import { CartService } from '../../service/cart.service';
import { map, Observable, of, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class Navbar {
  IsloggedIn: boolean = false
  username?: string | null;
  cartCount$!: Observable<number>;

  constructor(private _UserAuth: UserAuth, private _CartService: CartService) {
    this._UserAuth.isLoggedIn$.subscribe(status => {
      this.IsloggedIn = status
    })
    this._UserAuth.currentUser$.subscribe(user => {
      this.username = user?.username || '';
    });
  }

  ngOnInit(): void {
    this.cartCount$ = this._UserAuth.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of(0);
        return this._CartService.cartChanges$.pipe(
          switchMap(() => this._CartService.getUserCart(user.id)),
          map(cart => cart.items.reduce((sum, item) => sum + item.quantity, 0))
        );
      })
    );
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;

    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  Logout() {
    this._UserAuth.Logout();
  }
}
