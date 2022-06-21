import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvideClarificaitionComponent } from './provide-clarificaition.component';

describe('ProvideClarificaitionComponent', () => {
  let component: ProvideClarificaitionComponent;
  let fixture: ComponentFixture<ProvideClarificaitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProvideClarificaitionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvideClarificaitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
