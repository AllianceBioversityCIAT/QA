import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'alert.component.html'
})
export class AlertComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  message: any;

  constructor(private readonly alertService: AlertService) {}

  ngOnInit() {
    this.subscription = this.alertService.getAlert().subscribe(message => {
      console.log('message', message);
      switch (message?.type) {
        case 'success':
          message.cssClass = 'alert sticky alert-success';
          break;
        case 'error':
          message.cssClass = 'alert sticky alert-danger';
          break;
      }

      this.message = message;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
