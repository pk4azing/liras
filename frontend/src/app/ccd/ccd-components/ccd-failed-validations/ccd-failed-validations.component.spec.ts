import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdFailedValidationsComponent } from './ccd-failed-validations.component';

describe('CcdFailedValidationsComponent', () => {
  let component: CcdFailedValidationsComponent;
  let fixture: ComponentFixture<CcdFailedValidationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdFailedValidationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdFailedValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
