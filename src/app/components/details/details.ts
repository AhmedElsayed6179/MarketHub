import { Component, OnInit } from '@angular/core';
import { Observable, switchMap, take, tap } from 'rxjs';
import { Iproduct } from '../../models/iproduct';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../service/products.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ICartItem } from '../../models/icart';
import { IUser } from '../../models/iuser';
import Swal from 'sweetalert2';
import { CartService } from '../../service/cart.service';
import { UserAuth } from '../../service/user-auth';

@Component({
  selector: 'app-details',
  imports: [FormsModule, CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details implements OnInit {
  product$!: Observable<Iproduct | undefined>;
  idsArr: number[] = [];
  currentId!: number;
  showCheckout = false;
  selectedProduct!: Iproduct;
  checkoutForm: FormGroup

  constructor(private route: ActivatedRoute, private _UserAuth: UserAuth, private _CartService: CartService, private _ProductsService: ProductsService, private _router: Router, private titleService: Title) {
    this.checkoutForm = new FormGroup({
      name: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      paymentMethod: new FormControl('cod', Validators.required),
      // Visa fields
      cardNumber: new FormControl(''),
      cardName: new FormControl(''),
      expiry: new FormControl(''),
      cvv: new FormControl('')
    });
  }

  ngOnInit(): void {
    this._ProductsService.filteredProducts$.subscribe(filtered => {
      this.idsArr = filtered.map(p => p.id);
    });

    this.product$ = this.route.paramMap.pipe(
      switchMap(paramMap => {
        this.currentId = Number(paramMap.get('id'));
        return this._ProductsService.getProductById(this.currentId);
      }),
      tap(product => {
        this.titleService.setTitle(`MarketHub - ${product.title}`);
      })
    );
  }

  next() {
    this.currentId = this.idsArr.findIndex((id) => id == this.currentId)
    if (this.currentId != this.idsArr.length - 1) {
      this._router.navigateByUrl(`/Details/${this.idsArr[this.currentId + 1]}`)
    }
  }

  prev() {
    this.currentId = this.idsArr.findIndex((id) => id == this.currentId)
    if (this.currentId != 0) {
      this._router.navigateByUrl(`/Details/${this.idsArr[this.currentId - 1]}`)
    }
  }

  addToCart(product: Iproduct) {
    this._UserAuth.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        Swal.fire('Login required', 'You must log in first!', 'warning');
        return;
      }

      const item: ICartItem = {
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity: 1
      };

      const cleanUser = { id: user.id } as IUser;

      this._CartService.addProductToUserCart(cleanUser, item).subscribe({
        next: () => {
          Swal.fire({
            title: 'Adding product...',
            html: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Added!',
              text: `${item.title} added to your cart.`,
              timer: 1500,
              showConfirmButton: false
            });
          }, 1000);
        },
        error: err => {
          console.error(err);
          Swal.fire('Error', 'Failed to add product to cart.', 'error');
        }
      });
    });
  }

  get name() { return this.checkoutForm.get('name'); }
  get address() { return this.checkoutForm.get('address'); }
  get phone() { return this.checkoutForm.get('phone'); }
  get paymentMethod() { return this.checkoutForm.get('paymentMethod'); }

  openCheckout(product: Iproduct) {
    this.selectedProduct = product;
    this.showCheckout = true;
  }

  closeCheckout() {
    this.showCheckout = false;
  }

  confirmOrder() {
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

    if (this.checkoutForm.invalid) return;

    this._UserAuth.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        Swal.fire('Login required', 'Please login first', 'warning');
        return;
      }

      const order = {
        userId: user.id,
        name: this.checkoutForm.value.name,
        address: this.checkoutForm.value.address,
        phone: this.checkoutForm.value.phone,
        paymentMethod: this.checkoutForm.value.paymentMethod,
        items: [{
          productId: this.selectedProduct.id,
          title: this.selectedProduct.title,
          image: this.selectedProduct.image,
          price: this.selectedProduct.price,
          quantity: 1
        }],
        total: this.selectedProduct.price,
        createdAt: new Date()
      };

      this._CartService.placeOrder(order).subscribe({
        next: () => {
          Swal.fire('Success', 'Order placed successfully', 'success');
          this.closeCheckout();
          this.checkoutForm.reset({ paymentMethod: 'cod' });
        },
        error: () => Swal.fire('Error', 'Something went wrong', 'error')
      });
    });
  }
}
