import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRoleCreationDialogComponent } from './cd-role-creation-dialog.component';

describe('CdRoleCreationDialogComponent', () => {
  let component: CdRoleCreationDialogComponent;
  let fixture: ComponentFixture<CdRoleCreationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdRoleCreationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdRoleCreationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
