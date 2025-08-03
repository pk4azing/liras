import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdRolesTableComponent } from './cd-roles-table.component';

describe('CdRolesTableComponent', () => {
  let component: CdRolesTableComponent;
  let fixture: ComponentFixture<CdRolesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdRolesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdRolesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
