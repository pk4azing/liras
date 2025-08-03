import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdProfileManagementComponent } from './cd-profile-management.component';

describe('CdProfileManagementComponent', () => {
  let component: CdProfileManagementComponent;
  let fixture: ComponentFixture<CdProfileManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdProfileManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdProfileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
