import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import { User } from './../_models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  getAllUsers() {
    return this.http.get<any>(`${environment.apiBaseUrl}/user/all`);
    // .pipe(map(res => {
    //   return res.data;
    // }));
  }

  createUser(userData) {
    return this.http.post<any>(`${environment.apiBaseUrl}/user/`, userData);
  }

  deleteUser(id) {
    return this.http.delete<any>(`${environment.apiBaseUrl}/user/${id}`);
  }

  getUserById(id) {
    return this.http.get<any>(`${environment.apiBaseUrl}/user/${id}`);
  }
}
