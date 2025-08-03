import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdTicketTableComponentComponent } from './cd-ticket-table-component.component';

describe('CdTicketTableComponentComponent', () => {
  let component: CdTicketTableComponentComponent;
  let fixture: ComponentFixture<CdTicketTableComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdTicketTableComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdTicketTableComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
