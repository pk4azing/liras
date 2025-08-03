import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdLoginComponent } from './cd-login.component';

describe('CdLoginComponent', () => {
  let component: CdLoginComponent;
  let fixture: ComponentFixture<CdLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
