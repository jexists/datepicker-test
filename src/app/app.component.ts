import { Component } from '@angular/core';
import { MarketAuctionDatetimePickerComponent } from './market-auction-datetime-picker/market-auction-datetime-picker.component';

@Component({
  selector: 'app-root',
  imports: [MarketAuctionDatetimePickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'datepicker-test';

  onAuctionTimeSet(date: Date) {
    console.log('Auction time set:', date);
  }
}
