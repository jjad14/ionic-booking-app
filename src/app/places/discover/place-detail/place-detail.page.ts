import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { PlaceService } from '../../place.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { BookingService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;

  constructor(private route: ActivatedRoute,
              private navCtrl: NavController,
              private placeService: PlaceService,
              private modalCtrl: ModalController,
              private actionSheetCtrl: ActionSheetController,
              private bookingService: BookingService,
              private loadingCtrl: LoadingController,
              private authService: AuthService,
              private alertCtrl: AlertController,
              private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) { 
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }

      this.isLoading = true;
      let fetchedUserId: string;

      this.authService.getUserId()
          .pipe(
            take(1), 
            switchMap(userId => {
              if (!userId) {
                throw new Error('Found no user!');
              }
              fetchedUserId = userId;
              return this.placeService
                        .getPlace(paramMap
                        .get('placeId'));
            })
            ).subscribe(place => {
              this.place = place;
              this.isBookable = place.userId !== fetchedUserId;
              this.isLoading = false;
          }, error => {
            this.alertCtrl.create({
              header: 'An Error Occurred.',
              message: 'Could not load place.',
              buttons: [{text: 'Ok', handler: () => {
                this.router.navigate(['/places/tabs/discover']);
              }}]
            }).then(alertEl => {
              alertEl.present();
            })
          });
    });
  }

  onBookPlace() {
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    })
    .then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  // TS Assingment, mode has to be a string but not any string, a string  it has to be exactly select or random
  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl
    .create({
      component: CreateBookingComponent, 
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    })
    .then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    })
    .then(resultData => {
      const data = resultData.data.bookingData;

      if (resultData.role === 'confirm'){
        this.loadingCtrl.create({
          message: 'Booking place...'
        })
        .then(loadingEl => {
          loadingEl.present();
          this.bookingService.addBooking(
            this.place.id,
            this.place.title,
            this.place.imageUrl,
            data.firstName,
            data.lastName,
            data.guestNumber,
            data.startDate,
            data.endDate)
            .subscribe(() => {
              loadingEl.dismiss();
            });
        });
      }

    });
  }

  onShowFullMap() {
    this.modalCtrl
        .create({ component: MapModalComponent, componentProps: {
          center: { lat: this.place.location.lat, lng: this.place.location.lng },
          selectable: false,
          closeButtonText: 'Close',
          title: this.place.location.address
        }})
        .then(modelEl => {
          modelEl.present();
        });
  }

  ngOnDestroy() {
    this.placeSub.unsubscribe();
  }

}
