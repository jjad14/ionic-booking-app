import { Component, OnInit, OnDestroy } from '@angular/core';

import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  isLoading = false;
  private bookingSub: Subscription;

  constructor(private bookingService: BookingService,
              private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.bookingSub = this.bookingService.getBookings().subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }

  onCancelBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();

    this.loadingCtrl.create({
      message: 'Deleting booking...'
    }).then(loadingEl => {
      loadingEl.present();
      this.bookingService
      .cancelBooking(bookingId)
      .subscribe(() => {
        loadingEl.dismiss();
      })
    })
  }

  ngOnDestroy() {
    this.bookingSub.unsubscribe();
  }

}
