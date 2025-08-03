import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdHomeComponent } from './cd-home.component';

describe('CdHomeComponent', () => {
  let component: CdHomeComponent;
  let fixture: ComponentFixture<CdHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
