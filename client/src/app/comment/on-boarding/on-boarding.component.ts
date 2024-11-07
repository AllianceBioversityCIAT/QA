import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-on-boarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.scss']
})
export class OnBoardingComponent implements OnInit {
  onboarding = true;

  constructor() {}

  ngOnInit() {}

  toggleOnBoarding() {
    this.onboarding = false;
  }
}
