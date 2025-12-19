import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import Swal from 'sweetalert2';
import { ApiUser } from '../../service/api-user';
import { UserAuth } from '../../service/user-auth';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login implements OnInit {
  showPass: boolean = false
  userLogin: FormGroup
  constructor(private _ApiUser: ApiUser, private _Router: Router, private _UserAuth: UserAuth, private titleService: Title) {
    this.userLogin = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      RememberMe: new FormControl(false)
    })
    this.titleService.setTitle('MarketHub - Login')
  }

  get username() {
    return this.userLogin.get('username')
  }

  get password() {
    return this.userLogin.get('password')
  }

  get RememberMe() {
    return this.userLogin.get('RememberMe')
  }

  TogglePass() {
    this.showPass = !this.showPass
  }

  ngOnInit() {
    const SavedUserName = localStorage.getItem("SavedUserName")
    const SavedPassword = localStorage.getItem("SavedPassword")
    if (SavedUserName && SavedPassword) {
      this.userLogin.patchValue({
        username: SavedUserName,
        password: SavedPassword,
        RememberMe: true
      })
    }
  }

  login() {
    if (this.userLogin.valid) {
      const { username, password } = this.userLogin.value
      this._ApiUser.GetUsers().subscribe(users => {
        // أول خطوة: هل اليوزر موجود أصلاً؟
        const UserFound = users.find(u => u.username === username || u.email === username)

        // لو اليوزر مش موجود → الخطأ في اليوزر أو الإيميل
        if (!UserFound) {
          Swal.fire({
            title: "Error!",
            text: "Username or Email does not exist",
            icon: "error",
            confirmButtonText: "Try Again"
          });
          return;
        }

        // نكمل بالكود بتاعك بالظبط ↓↓↓
        const FindUser = users.find(u => (u.username === username || u.email === username) && u.password === password)

        if (FindUser) {
          this._UserAuth.Login(FindUser.username, FindUser.password);

          Swal.fire({
            title: `Welcome, ${FindUser.username}!`,
            html: 'You have successfully logged in.<br>Redirecting to Home...',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
            },
            willClose: () => {
              this._Router.navigateByUrl("/Home", { replaceUrl: true });
            }
          });

          if (this.RememberMe?.value) {
            localStorage.setItem("SavedUserName", username)
            localStorage.setItem("SavedPassword", password)
          } else {
            localStorage.removeItem("SavedUserName")
            localStorage.removeItem("SavedPassword")
          }

        } else {
          Swal.fire({
            title: "Error!",
            text: "Incorrect Password",
            icon: "error",
            confirmButtonText: "Try Again"
          });
        }
      })

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
