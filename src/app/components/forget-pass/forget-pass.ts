import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ApiUser } from '../../service/api-user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forget-pass',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './forget-pass.html',
  styleUrl: './forget-pass.css',
})
export class ForgetPass {
  ResetPassword: FormGroup
  constructor(private titleService: Title, private _ApiUser: ApiUser) {
    this.ResetPassword = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    })
    this.titleService.setTitle('MarketHub - Reset Password')
  }

  get email() {
    return this.ResetPassword.get('email')
  }

  submitResetPass() {
    if (this.ResetPassword.valid) {
      const { email } = this.ResetPassword.value
      this._ApiUser.GetUsers().subscribe(users => {
        const UserFound = users.find(u => u.email === email)

        if (!UserFound) {
          Swal.fire({
            title: "Error!",
            text: "Email Address does not exist",
            icon: "error",
            confirmButtonText: "Try Again"
          });
          return;
        }

        Swal.fire({
          title: "Verification Sent",
          html: `A verification link has been sent to <strong>${email}</strong>.<br>
               Please check your inbox. Note: Delivery may take a few minutes as this feature is currently under development.`,
          icon: "success",
          confirmButtonText: "OK"
        });
      }
      )
    } else {
      Swal.fire({
        title: "Error!",
        text: "Please fill all fields",
        icon: "warning",
        confirmButtonText: "OK"
      });
    }
  }
}
