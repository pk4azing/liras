import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdSettingsComponent } from './ccd-settings.component';

describe('CcdSettingsComponent', () => {
  let component: CcdSettingsComponent;
  let fixture: ComponentFixture<CcdSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
