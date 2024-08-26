import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrpComponent } from './crp.component';

describe('CrpComponent', () => {
  let component: CrpComponent;
  let fixture: ComponentFixture<CrpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
