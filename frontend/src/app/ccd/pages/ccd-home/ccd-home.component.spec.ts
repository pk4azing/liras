import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdHomeComponent } from './ccd-home.component';

describe('CcdHomeComponent', () => {
  let component: CcdHomeComponent;
  let fixture: ComponentFixture<CcdHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcdHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
