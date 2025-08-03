import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdLogoutComponent } from './ccd-logout.component';

describe('CcdLogoutComponent', () => {
  let component: CcdLogoutComponent;
  let fixture: ComponentFixture<CcdLogoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdLogoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdLogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
