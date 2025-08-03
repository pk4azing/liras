import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdEditTicketDialogComponent } from './cd-edit-ticket-dialog.component';

describe('CdEditTicketDialogComponent', () => {
  let component: CdEditTicketDialogComponent;
  let fixture: ComponentFixture<CdEditTicketDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdEditTicketDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdEditTicketDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
