import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartphoneHomeComponent } from './smartphone-home.component';

describe('SmartphoneHomeComponent', () => {
  let component: SmartphoneHomeComponent;
  let fixture: ComponentFixture<SmartphoneHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartphoneHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartphoneHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
