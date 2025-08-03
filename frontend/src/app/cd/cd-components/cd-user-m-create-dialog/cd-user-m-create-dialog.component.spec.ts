import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdUserMCreateDialogComponent } from './cd-user-m-create-dialog.component';

describe('CdUserMCreateDialogComponent', () => {
  let component: CdUserMCreateDialogComponent;
  let fixture: ComponentFixture<CdUserMCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdUserMCreateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdUserMCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
