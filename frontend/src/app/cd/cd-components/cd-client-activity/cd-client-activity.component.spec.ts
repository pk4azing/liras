import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdClientActivityComponent } from './cd-client-activity.component';

describe('CdClientActivityComponent', () => {
  let component: CdClientActivityComponent;
  let fixture: ComponentFixture<CdClientActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdClientActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdClientActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
