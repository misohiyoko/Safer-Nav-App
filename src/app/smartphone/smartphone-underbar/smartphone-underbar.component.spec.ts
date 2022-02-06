import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartphoneUnderbarComponent } from './smartphone-underbar.component';

describe('SmartphoneUnderbarComponent', () => {
  let component: SmartphoneUnderbarComponent;
  let fixture: ComponentFixture<SmartphoneUnderbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartphoneUnderbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartphoneUnderbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
