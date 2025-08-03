import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdViewTicketComponent } from './cd-view-ticket.component';

describe('CdViewTicketComponent', () => {
  let component: CdViewTicketComponent;
  let fixture: ComponentFixture<CdViewTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdViewTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdViewTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
