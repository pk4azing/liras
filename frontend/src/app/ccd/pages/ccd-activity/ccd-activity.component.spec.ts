import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdActivityComponent } from './ccd-activity.component';

describe('CcdActivityComponent', () => {
  let component: CcdActivityComponent;
  let fixture: ComponentFixture<CcdActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
