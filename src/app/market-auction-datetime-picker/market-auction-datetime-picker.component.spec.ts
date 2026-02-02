/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MarketAuctionDatetimePickerComponent } from './market-auction-datetime-picker.component';

describe('MarketAuctionDatetimePickerComponent', () => {
  let component: MarketAuctionDatetimePickerComponent;
  let fixture: ComponentFixture<MarketAuctionDatetimePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketAuctionDatetimePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketAuctionDatetimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
