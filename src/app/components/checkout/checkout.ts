import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CartService } from '../../service/cart.service';
import { UserAuth } from '../../service/user-auth';
import { CartViewItem, ICartItem } from '../../models/icart';
import { PlaceOrder } from '../../models/place-order';
import { map, Observable, switchMap } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ApiProducts } from '../../service/api-products';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})

export class Checkout implements OnInit {
  checkoutForm: FormGroup;
  cartItems: ICartItem[] = [];
  totalPrice: number = 0;
  userId!: number;
  cartItems$!: Observable<CartViewItem[]>;

  constructor(private _CartService: CartService, private _UserAuth: UserAuth, private _ApiProducts: ApiProducts, private titleService: Title) {
    this.checkoutForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
      paymentMethod: new FormControl('cod', [Validators.required]), // default cash on delivery
      // Visa fields
      cardNumber: new FormControl(''),
      cardName: new FormControl(''),
      expiry: new FormControl(''),
      cvv: new FormControl('')
    });
    this.titleService.setTitle("MarketHub - Checkout")
  }

  ngOnInit(): void {
    this._UserAuth.currentUser$.subscribe(user => {
      if (!user) return;
      this.userId = user.id;

      this.cartItems$ = this._CartService.getUserCart(this.userId).pipe(
        switchMap(cart =>
          this._ApiProducts.getallProducts().pipe(
            map(products => {
              const items = cart.items.map(item => {
                const product = products.find(p => p.id === item.productId)!;
                return {
                  productId: item.productId,
                  title: product.title,
                  image: product.image,
                  price: product.price,
                  quantity: item.quantity
                };
              });

              this.totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

              // تحديث المتغير المحلي
              this.cartItems = items;

              return items;
            })
          )
        )
      );
    });
  }

  get name() { return this.checkoutForm.get('name'); }
  get address() { return this.checkoutForm.get('address'); }
  get phone() { return this.checkoutForm.get('phone'); }
  get paymentMethod() { return this.checkoutForm.get('paymentMethod'); }

  checkout() {
    if (this.cartItems.length === 0) {
      Swal.fire('Error', 'Please make sure your cart is not empty', 'error');
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      Swal.fire(
        'Incomplete Data',
        'Please fill in all required fields',
        'warning'
      );
      return;
    }

    // لو Visa ومعلومات الكارت ناقصة
    if (this.checkoutForm.value.paymentMethod === 'visa') {
      const { cardNumber, expiry, cvv } = this.checkoutForm.value;

      if (!cardNumber || !expiry || !cvv) {
        Swal.fire(
          'Missing Card Info',
          'Please complete Visa card details',
          'error'
        );
        return;
      }
    }

    const order: PlaceOrder = {
      userId: this.userId,
      name: this.name?.value,
      address: this.address?.value,
      phone: this.phone?.value,
      paymentMethod: this.paymentMethod?.value,
      items: this.cartItems,
      total: this.totalPrice,
      createdAt: new Date()
    };

    this._CartService.placeOrder(order).subscribe({
      next: () => {
        Swal.fire('Success', 'Your order has been placed!', 'success');
        this.cartItems = [];
        this.totalPrice = 0;
        this.checkoutForm.reset({ paymentMethod: 'cod' });
      },
      error: () => Swal.fire('Error', 'Something went wrong. Please try again.', 'error')
    });
  }
}
