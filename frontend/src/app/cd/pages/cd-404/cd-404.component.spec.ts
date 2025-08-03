import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cd404Component } from './cd-404.component';

describe('Cd404Component', () => {
  let component: Cd404Component;
  let fixture: ComponentFixture<Cd404Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cd404Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cd404Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
