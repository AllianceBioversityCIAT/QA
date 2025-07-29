import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import AuthCognitoComponent from './auth-cognito.component';

describe('AuthCognitoComponent', () => {
  let component: AuthCognitoComponent;
  let fixture: ComponentFixture<AuthCognitoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AuthCognitoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthCognitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
