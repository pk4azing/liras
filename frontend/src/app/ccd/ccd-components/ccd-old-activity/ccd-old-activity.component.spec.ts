import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdOldActivityComponent } from './ccd-old-activity.component';

describe('CcdOldActivityComponent', () => {
  let component: CcdOldActivityComponent;
  let fixture: ComponentFixture<CcdOldActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdOldActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdOldActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
