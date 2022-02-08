import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartphoneTestComponent } from './smartphone-test.component';

describe('SmartphoneTestComponent', () => {
  let component: SmartphoneTestComponent;
  let fixture: ComponentFixture<SmartphoneTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartphoneTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartphoneTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
