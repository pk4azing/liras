import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdActivityUploadComponent } from './ccd-activity-upload.component';

describe('CcdActivityUploadComponent', () => {
  let component: CcdActivityUploadComponent;
  let fixture: ComponentFixture<CcdActivityUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdActivityUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdActivityUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
