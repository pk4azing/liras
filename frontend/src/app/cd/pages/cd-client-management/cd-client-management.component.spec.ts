import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdClientManagementComponent } from './cd-client-management.component';

describe('CdClientManagementComponent', () => {
  let component: CdClientManagementComponent;
  let fixture: ComponentFixture<CdClientManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdClientManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdClientManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
