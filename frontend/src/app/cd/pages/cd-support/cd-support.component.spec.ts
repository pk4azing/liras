import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdSupportComponent } from './cd-support.component';

describe('CdSupportComponent', () => {
  let component: CdSupportComponent;
  let fixture: ComponentFixture<CdSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdSupportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
