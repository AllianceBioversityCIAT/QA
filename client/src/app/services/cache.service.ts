import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  currentRole = JSON.parse(localStorage.getItem('currentUser') || '{}')?.roles?.[0]?.id || null;
  constructor() {}
}
