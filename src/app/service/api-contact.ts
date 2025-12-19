import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContactForm } from '../models/contact-form';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ApiContact {
  constructor(private http: HttpClient) { }

  sendContactForm(data: ContactForm): Observable<ContactForm> {
    return this.http.post<ContactForm>(`${environment.contactUrl}`, data);
  }
}
