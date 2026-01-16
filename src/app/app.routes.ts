import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Products } from './components/products/products';
import { Register } from './components/register/register';
import { Notfound } from './components/notfound/notfound';
import { Details } from './components/details/details';
import { AuthGuard } from './guards/auth-guard';
import { LoggedInGuard } from './guards/logged-in-guard-guard';
import { Cart } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { Terms } from './components/terms/terms';
import { ForgetPass } from './components/forget-pass/forget-pass';
import { Profile } from './components/profile/profile';
import { UserResolver } from './service/user-resolver';

export const routes: Routes = [
  { path: '', component: Home, resolve: { currentUser: UserResolver } },
  { path: "Home", redirectTo: '', pathMatch: 'full' },
  { path: "Login", component: Login, canActivate: [LoggedInGuard] },
  { path: "Products", component: Products, resolve: { currentUser: UserResolver } },
  { path: "Terms", component: Terms },
  { path: "Profile", component: Profile, canActivate: [AuthGuard], resolve: { currentUser: UserResolver } },
  { path: "ForgotPassword", component: ForgetPass, canActivate: [LoggedInGuard] },
  { path: "Checkout", component: Checkout, canActivate: [AuthGuard], resolve: { currentUser: UserResolver } },
  { path: "Register", component: Register, canActivate: [LoggedInGuard] },
  { path: "Details/:id", component: Details, canActivate: [AuthGuard], resolve: { currentUser: UserResolver } },
  { path: "Cart", component: Cart, canActivate: [AuthGuard], resolve: { currentUser: UserResolver } },
  { path: "**", component: Notfound },
];
