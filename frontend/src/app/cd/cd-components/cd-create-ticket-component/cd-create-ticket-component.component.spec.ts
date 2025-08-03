import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdCreateTicketComponentComponent } from './cd-create-ticket-component.component';

describe('CdCreateTicketComponentComponent', () => {
  let component: CdCreateTicketComponentComponent;
  let fixture: ComponentFixture<CdCreateTicketComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdCreateTicketComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdCreateTicketComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
