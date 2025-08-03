import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdLogoutComponent } from './cd-logout.component';

describe('CdLogoutComponent', () => {
  let component: CdLogoutComponent;
  let fixture: ComponentFixture<CdLogoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdLogoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdLogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
