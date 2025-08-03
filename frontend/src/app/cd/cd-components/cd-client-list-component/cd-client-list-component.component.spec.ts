import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdClientListComponentComponent } from './cd-client-list-component.component';

describe('CdClientListComponentComponent', () => {
  let component: CdClientListComponentComponent;
  let fixture: ComponentFixture<CdClientListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdClientListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdClientListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
