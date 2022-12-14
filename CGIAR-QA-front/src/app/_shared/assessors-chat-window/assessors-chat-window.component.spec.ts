import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssessorsChatWindowComponent } from './assessors-chat-window.component';

describe('AssessorsChatWindowComponent', () => {
  let component: AssessorsChatWindowComponent;
  let fixture: ComponentFixture<AssessorsChatWindowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessorsChatWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessorsChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
