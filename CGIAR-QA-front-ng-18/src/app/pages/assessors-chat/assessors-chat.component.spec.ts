import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessorsChatComponent } from './assessors-chat.component';

describe('AssessorsChatComponent', () => {
  let component: AssessorsChatComponent;
  let fixture: ComponentFixture<AssessorsChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessorsChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessorsChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
