import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdHelpComponent } from './ccd-help.component';

describe('CcdHelpComponent', () => {
  let component: CcdHelpComponent;
  let fixture: ComponentFixture<CcdHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
