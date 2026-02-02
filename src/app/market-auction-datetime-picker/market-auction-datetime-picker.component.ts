import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NgxFlickingComponent, NgxFlickingModule } from '@egjs/ngx-flicking';

// Custom pipes for UI testing
@Pipe({ name: 'datetime', standalone: true })
export class DatetimePipe implements PipeTransform {
  transform(value: Date, format?: string): string {
    if (!value) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = value.getFullYear();
    const m = pad(value.getMonth() + 1);
    const d = pad(value.getDate());
    const h = pad(value.getHours());
    const min = pad(value.getMinutes());
    const s = pad(value.getSeconds());
    if (format === 'sec') {
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    }
    return `${y}-${m}-${d} ${h}:${min}`;
  }
}

@Pipe({ name: 'secondsToTime', standalone: true })
export class SecondsToTimePipe implements PipeTransform {
  transform(value: number): string {
    if (value < 0) return '종료';
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);

    if (days > 0) {
      return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${seconds}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    }
    return `${seconds}초`;
  }
}

@Component({
  selector: 'app-market-auction-datetime-picker',
  imports: [
    CommonModule,
    FormsModule,
    NgxFlickingModule,
    NzButtonModule,
    NzModalModule,
    NzDatePickerModule,
    DatetimePipe,
    SecondsToTimePipe
  ],
  templateUrl: './market-auction-datetime-picker.component.html',
  styleUrls: ['./market-auction-datetime-picker.component.scss']
})
export class MarketAuctionDatetimePickerComponent implements OnInit, OnDestroy {

  @ViewChild('flickHour') flickHour!: NgxFlickingComponent;
  @ViewChild('flickMin') flickMin!: NgxFlickingComponent;
  @Input() end_datetime!: Date;
  @Output() setAuctionTime = new EventEmitter<Date>();

  isEndDatetimeView = false;
  hours: string[] = [];
  mins: string[] = [];
  date!: Date;
  sel_year = 0;
  sel_month = 0;
  sel_day = 0;
  sel_hour = 0;
  sel_min = 0;
  valid = false;
  countMap: { [key: number]: number } = {};
  nzmodalStyle: object | undefined = undefined;
  auction_end_datetime = 0;
  auction_interval: ReturnType<typeof setInterval> | null = null;

  flickingOptionsForMin: any;
  flickingOptionsForHour: any;
  baseFlickingOptions = {
    align: 'prev',
    horizontal: false,
    circular: true,
    interruptable: true,
    useCSSOrder: true,
  }

  disabledDate = (value: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const afterTenDays = new Date();
    afterTenDays.setDate(afterTenDays.getDate() + 10);

    return yesterday > value || value > afterTenDays;
  }

  constructor() { }

  ngOnInit() {
    this.hours = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, '0')
    );

    this.mins = Array.from({ length: 60 }, (_, i) =>
      i.toString().padStart(2, '0')
    );
    this.getScreenSize();
    if (this.end_datetime) {
      this.setRemainingAuctionTime();
    }

    this.flickingOptionsForHour = this.createFlickingOptions(this.sel_hour);
    this.flickingOptionsForMin = this.createFlickingOptions(this.sel_min);
  }

  createFlickingOptions(defaultIndex: number) {
    return {
      ...this.baseFlickingOptions,
      defaultIndex,
    };
  }

  ngOnDestroy() {
    if (this.auction_interval) {
      clearInterval(this.auction_interval);
      this.auction_interval = null;
    }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: Event) {
    const screenWidth = window.innerWidth;
    if (screenWidth < 600) {
      this.nzmodalStyle = { top: '0' };
    } else {
      this.nzmodalStyle = undefined;
    }
  }

  openEndDatetimeView() {
    this.isEndDatetimeView = true;
    if (this.end_datetime) {
      this.date = this.end_datetime;
      this.sel_year = new Date(this.end_datetime).getFullYear();
      this.sel_month = new Date(this.end_datetime).getMonth() + 1;
      this.sel_day = new Date(this.end_datetime).getDate();
      this.sel_hour = new Date(this.end_datetime).getHours();
      this.sel_min = new Date(this.end_datetime).getMinutes();

      this.getMarketAuctionCount();
    }
  }

  closeEndDatetimeView() {
    this.isEndDatetimeView = false;
  }

  getEndDatetimeAuctionCount(date: Date) {
    console.log('Selected date:', date);
    this.sel_year = date.getFullYear();
    this.sel_month = date.getMonth() + 1;
    this.sel_day = date.getDate();

    this.getMarketAuctionCount();
  }

  clickHour(hour: number) {
    console.log('Selected hour:', hour);
    this.sel_hour = hour;
    this.getMarketAuctionCount();
    this.flickHour?.moveTo(hour);
  }

  clickMin(min: number) {
    console.log('Selected min:', min);
    this.sel_min = min;
    this.flickMin?.moveTo(min);
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Mock data for UI testing
  getMarketAuctionCount() {
    this.countMap = {};
    // Generate random mock data for testing
    for (let i = 0; i < 60; i++) {
      this.countMap[i] = Math.floor(Math.random() * 5);
    }
    // Always set 0 min to 0 (disabled by business logic)
    this.countMap[0] = 0;
  }

  auctionInvalidReason(): string | null {
    const count = this.countMap[this.sel_min] ?? 0;

    const selectedDate = new Date(
      this.sel_year,
      this.sel_month - 1,
      this.sel_day,
      this.sel_hour,
      this.sel_min + 1,
      0
    );

    const now = new Date();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const diff = selectedDate.getTime() - now.getTime();

    if (diff < ONE_DAY_MS) {
      return 'TIME';
    }

    if (this.sel_min === 0) {
      return 'MIN';
    }

    if (count >= 3) {
      return 'COUNT';
    }

    return null;
  }

  get auctionInvalidReasonValue(): string | null {
    return this.auctionInvalidReason();
  }

  get isAuctionTimeInvalidValue(): boolean {
    return this.auctionInvalidReasonValue !== null;
  }

  setMarketAuctionTime() {
    const now = new Date();
    const sec = now.getSeconds();
    this.end_datetime = new Date(this.sel_year, this.sel_month - 1, this.sel_day, this.sel_hour, this.sel_min, sec)
    this.setRemainingAuctionTime();

    this.setAuctionTime.emit(this.end_datetime);
    this.isEndDatetimeView = false;
  }

  setRemainingAuctionTime() {
    this.auction_end_datetime = this.calRemainTime(this.end_datetime);

    if (this.auction_end_datetime > 0) {
      this.auction_interval = setInterval(() => {
        if (this.auction_end_datetime > 0) {
          this.auction_end_datetime -= 0.1;
        } else {
          if (this.auction_interval) {
            clearInterval(this.auction_interval);
            this.auction_interval = null;
          }
        }
      }, 100);
    }
  }

  // Helper function to calculate remaining time in seconds
  calRemainTime(endDate: Date): number {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return diff / 1000;
  }
}
