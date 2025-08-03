import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdSuccessfulValidationsComponent } from './ccd-successful-validations.component';

describe('CcdSuccessfulValidationsComponent', () => {
  let component: CcdSuccessfulValidationsComponent;
  let fixture: ComponentFixture<CcdSuccessfulValidationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdSuccessfulValidationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdSuccessfulValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
