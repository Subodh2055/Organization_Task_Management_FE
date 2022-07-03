import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClarificationListComponent } from './clarification-list.component';

describe('ClarificationListComponent', () => {
  let component: ClarificationListComponent;
  let fixture: ComponentFixture<ClarificationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClarificationListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClarificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
