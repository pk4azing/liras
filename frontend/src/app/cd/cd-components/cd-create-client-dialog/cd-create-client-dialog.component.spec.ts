import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdCreateClientDialogComponent } from './cd-create-client-dialog.component';

describe('CdCreateClientDialogComponent', () => {
  let component: CdCreateClientDialogComponent;
  let fixture: ComponentFixture<CdCreateClientDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdCreateClientDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdCreateClientDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
