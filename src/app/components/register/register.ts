import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { ApiUser } from '../../service/api-user';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})

export class Register {
  ShowPass: boolean = false
  ShowConfPass: boolean = false
  iti: any
  userRegisterForm: FormGroup
  constructor(private _apiUser: ApiUser, private _Router: Router, private titleService: Title) {
    this.userRegisterForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9]{4,20}$')]),
      name: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z ]{4,25}$')]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com)$/)
      ]),
      password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)[A-Za-z0-9]{8,25}$/)]),
      confirm_password: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, this.phoneValidator.bind(this)]),
      terms: new FormControl(false, Validators.requiredTrue)
    }, { validators: this.MatchPassword })
    this.titleService.setTitle("MarketHub - Register")
  }

  phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.toString().trim();
    if (!value) return { required: true };

    // أرقام فقط
    if (!/^\+?\d+$/.test(value)) {
      return { invalidPhone: true };
    }

    const isEgypt =
      value.startsWith('01') ||
      value.startsWith('+201');

    // 🇪🇬 رقم مصري فقط (11 رقم محلي)
    const egyptPattern = /^(?:\+20|0)?1[0125][0-9]{8}$/;

    // 🌍 رقم دولي
    const generalPattern = /^\+?[1-9][0-9]{7,14}$/;

    if (isEgypt) {
      return egyptPattern.test(value) ? null : { invalidPhone: true };
    }

    return generalPattern.test(value) ? null : { invalidPhone: true };
  }

  MatchPassword(control: AbstractControl) {
    const form = control as FormGroup
    const pass = form.get("password")?.value
    const confirmpass = form.get("confirm_password")?.value
    return pass === confirmpass ? null : { notMatching: true }
  }

  get username() {
    return this.userRegisterForm.get('username')
  }

  get name() {
    return this.userRegisterForm.get('name')
  }

  get email() {
    return this.userRegisterForm.get('email')
  }

  get password() {
    return this.userRegisterForm.get('password')
  }

  get confirm_password() {
    return this.userRegisterForm.get('confirm_password')
  }

  get phone() {
    return this.userRegisterForm.get('phone')
  }

  get terms() {
    return this.userRegisterForm.get('terms')
  }

  TogglePass() {
    this.ShowPass = !this.ShowPass
  }

  ToggleConfPass() {
    this.ShowConfPass = !this.ShowConfPass
  }

  Register() {
    if (this.userRegisterForm.valid) {
      const { confirm_password, ...userTosend } = this.userRegisterForm.value
      this._apiUser.GetUsers().subscribe(users => {
        // 1) تأكد إن مفيش Username أو Email او Phone متكرر
        const Exists = users.some(u => u.username === userTosend.username || u.email === userTosend.username)
        if (Exists) {
          Swal.fire({
            title: "Error!",
            text: "Username or Email already exists!",
            icon: "error",
            confirmButtonText: "OK"
          })
          return;
        }

        const ExistPhone = users.some(u => u.phone === userTosend.phone)
        if (ExistPhone) {
          Swal.fire({
            title: "Error!",
            text: "Phone Number already exists!",
            icon: "error",
            confirmButtonText: "OK"
          })
          return;
        }

        // 2) لو مفيش تكرار → اعمل ID جديد
        const Lastid = users.length ? Math.max(...users.map(u => u.id)) : 0
        const userWithid = { id: Lastid + 1, ...userTosend }
        this._apiUser.SignUpUser(userWithid).subscribe({
          next: () => {
            Swal.fire({
              title: "Success!",
              text: "Account Has been Created Successfully",
              icon: "success",
              cancelButtonText: "OK",
            })
            this._Router.navigateByUrl("/Login")
          },
          error: () => {
            Swal.fire({
              title: "Erorr!",
              text: "Something went wrong. Please try again",
              icon: "error",
              cancelButtonText: "OK",
            })
          }
        })
      })
      this.userRegisterForm.reset();
    } else {
      Swal.fire({
        title: 'Invalid Form',
        text: 'Please fill out all fields correctly.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }
}
