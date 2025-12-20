import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiUser } from '../../service/api-user';
import { IUser } from '../../models/iuser';
import { UserAuth } from '../../service/user-auth';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  userId!: number;
  ShowPass: boolean = false
  guestname?: string | null;
  showForm = false;
  ShowConfPass: boolean = false

  profileForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9]{4,20}$')]),
    name: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z ]{4,25}$')]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com)$/)
    ]),
    phone: new FormControl('', [Validators.required, this.phoneValidator.bind(this)]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)[A-Za-z0-9]{8,25}$/)
    ]),
    confirm_password: new FormControl('', [Validators.required]),
  }, { validators: this.MatchPassword });

  constructor(private _ApiUser: ApiUser, private _UserAuth: UserAuth, private Title: Title, private _router: Router) {
    this._UserAuth.currentUser$.subscribe(user => {
      this.guestname = user?.username || '';
      this.Title.setTitle(`MarketHub - ${this.guestname}`)
    });
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

  ngOnInit(): void {
    this._UserAuth.currentUser$.subscribe(user => {
      if (!user) return;
      this.userId = user.id!;
      this.profileForm.patchValue({
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      const user = this._UserAuth.currentUserValue();
      if (user) {
        this.profileForm.reset({
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
        });
      }
    }
  }

  MatchPassword(control: AbstractControl) {
    const form = control as FormGroup
    const pass = form.get("password")?.value
    const confirmpass = form.get("confirm_password")?.value
    return pass === confirmpass ? null : { notMatching: true }
  }

  get username() {
    return this.profileForm.get('username')
  }

  get name() {
    return this.profileForm.get('name')
  }

  get email() {
    return this.profileForm.get('email')
  }

  get password() {
    return this.profileForm.get('password')
  }

  get confirm_password() {
    return this.profileForm.get('confirm_password')
  }

  get phone() {
    return this.profileForm.get('phone')
  }

  TogglePass() {
    this.ShowPass = !this.ShowPass
  }

  ToggleConfPass() {
    this.ShowConfPass = !this.ShowConfPass
  }

  updateProfile() {
    const currentUser = this._UserAuth.currentUserValue();
    if (!currentUser) return;

    const formValue = this.profileForm.value;
    const optionalFields = ['password', 'confirm_password'];

    // التحقق من الحقول الفارغة (باستثناء الحقول الاختيارية)
    const emptyFields = Object.keys(this.profileForm.controls)
      .filter(field => {
        const value = this.profileForm.get(field)?.value;
        return (!optionalFields.includes(field)) && (!value || value.toString().trim() === '');
      })
      .map(field => field.charAt(0).toUpperCase() + field.slice(1));

    if (emptyFields.length > 0) {
      Swal.fire('Error', `The following fields are empty: ${emptyFields.join(', ')}`, 'error');
      return;
    }

    // التحقق من صلاحية الفورم بشكل عام للحقول المعبّية فقط
    const invalidFields = Object.keys(this.profileForm.controls)
      .filter(field => {
        const control = this.profileForm.get(field);
        return (control?.value && control.invalid);
      })
      .map(field => field.charAt(0).toUpperCase() + field.slice(1));

    if (invalidFields.length > 0) {
      Swal.fire('Error', `Please correct the following fields: ${invalidFields.join(', ')}`, 'error');
      return;
    }

    // التحقق من مطابقة كلمة المرور إذا تم إدخالها
    if (formValue.password || formValue.confirm_password) {
      if (formValue.password !== formValue.confirm_password) {
        Swal.fire('Error', 'Passwords do not match', 'error');
        return;
      }
      if (formValue.password === currentUser.password) {
        Swal.fire('Error', 'New password cannot be the same as the current password', 'error');
        return;
      }
    }

    // جلب كل المستخدمين للتحقق من التكرار
    this._ApiUser.GetUsers().subscribe(users => {
      const usernameTaken = users.some(
        user => user.username === formValue.username && user.id !== currentUser.id
      );

      const emailTaken = users.some(
        user => user.email === formValue.email && user.id !== currentUser.id
      );

      const phoneTaken = users.some(
        user => user.phone === formValue.phone && user.id !== currentUser.id
      );

      if (usernameTaken) {
        Swal.fire('Error', 'This username is already taken by another user', 'error');
        return;
      }

      if (emailTaken) {
        Swal.fire('Error', 'This email is already used by another user', 'error');
        return;
      }

      if (phoneTaken) {
        Swal.fire('Error', 'This Phone Number is already used by another user', 'error');
        return;
      }

      const updatedUser: IUser = {
        id: currentUser.id,
        username: formValue.username ?? currentUser.username,
        name: formValue.name ?? currentUser.name,
        email: formValue.email ?? currentUser.email,
        phone: formValue.phone ?? currentUser.phone,
        password: formValue.password ? formValue.password : currentUser.password, // ترسل فقط لو تغيّرت
      };

      const isUnchanged =
        updatedUser.username === currentUser.username &&
        updatedUser.name === currentUser.name &&
        updatedUser.email === currentUser.email &&
        updatedUser.phone === currentUser.phone &&
        updatedUser.password === currentUser.password;

      if (isUnchanged) {
        Swal.fire('Info', 'No changes detected', 'info');
        return;
      }

      Swal.fire({
        title: 'Updating profile...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      this._ApiUser.UpdateUser(this.userId, updatedUser).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Profile updated successfully',
            showConfirmButton: true,
            timer: 2000
          });
          this._UserAuth.setCurrentUser(updatedUser);
        },
        error: () => {
          Swal.fire('Error', 'Failed to update profile. Please try again.', 'error');
        }
      });
    });
  }

  deleteAccount() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'To permanently delete your account, type your username below:',
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Enter your username',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete Account'
    }).then(result => {
      const currentUser = this._UserAuth.currentUserValue();
      if (result.isConfirmed) {
        // تحقق من كتابة الاسم الصحيح
        if (result.value !== currentUser?.username) {
          Swal.fire('Error', 'Username does not match. Account not deleted.', 'error');
          return;
        }

        // حذف الحساب
        this._ApiUser.DeleteUser(this.userId).subscribe(() => {
          Swal.fire('Deleted!', 'Your account has been permanently deleted.', 'success').then(() => {
            this._UserAuth.setCurrentUser(null);
            this._router.navigate(['/Login']);
          });
        });
      }
    });
  }
}
