import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdClientActivityUploadComponent } from './cd-client-activity-upload.component';

describe('CdClientActivityUploadComponent', () => {
  let component: CdClientActivityUploadComponent;
  let fixture: ComponentFixture<CdClientActivityUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdClientActivityUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdClientActivityUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
