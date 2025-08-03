import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdUserMEditDialogComponent } from './cd-user-m-edit-dialog.component';

describe('CdUserMEditDialogComponent', () => {
  let component: CdUserMEditDialogComponent;
  let fixture: ComponentFixture<CdUserMEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdUserMEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdUserMEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
