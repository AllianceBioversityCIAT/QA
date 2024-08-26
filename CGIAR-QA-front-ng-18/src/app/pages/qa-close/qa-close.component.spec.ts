import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QaCloseComponent } from './qa-close.component';

describe('QaCloseComponent', () => {
  let component: QaCloseComponent;
  let fixture: ComponentFixture<QaCloseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QaCloseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QaCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
