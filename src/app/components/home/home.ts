import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { UserAuth } from '../../service/user-auth';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiContact } from '../../service/api-contact';
import { ContactForm } from '../../models/contact-form';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  isLoggedIn: boolean = false
  username?: string | null;
  contactForm: FormGroup;

  constructor(private _UserAuth: UserAuth, private titleService: Title, private apiContact: ApiContact) {
    this._UserAuth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status
    })
    this._UserAuth.currentUser$.subscribe(user => {
      this.username = user?.username || '';
    });
    this.titleService.setTitle("MarketHub - Home")
    this.contactForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', Validators.required)
    });
  }

  get name() {
    return this.contactForm.get('name')
  }

  get email() {
    return this.contactForm.get('email')
  }

  get message() {
    return this.contactForm.get('message')
  }

  submitForm() {
    if (this.contactForm.invalid) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }
    const formData: ContactForm = this.contactForm.value;

    this.apiContact.sendContactForm(formData).subscribe({
      next: () => {
        Swal.fire('Success', 'Your message has been sent!', 'success');
        this.contactForm.reset();
      },
      error: () => Swal.fire('Error', 'Something went wrong', 'error')
    });
  }

  Logout() {
    this._UserAuth.Logout();
  }
}
