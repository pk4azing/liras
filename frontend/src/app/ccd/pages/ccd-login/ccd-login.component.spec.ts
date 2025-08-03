import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdLoginComponent } from './ccd-login.component';

describe('CcdLoginComponent', () => {
  let component: CcdLoginComponent;
  let fixture: ComponentFixture<CcdLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
