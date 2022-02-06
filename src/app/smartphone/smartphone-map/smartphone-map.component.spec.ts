import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartphoneMapComponent } from './smartphone-map.component';

describe('SmartphoneMapComponent', () => {
  let component: SmartphoneMapComponent;
  let fixture: ComponentFixture<SmartphoneMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartphoneMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartphoneMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
