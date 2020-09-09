import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef;
  
  @Input() center = { lat: 43.6532, lng: 79.3832 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';

  clickListener: any;
  googleMaps: any;

  constructor(private modalCtrl: ModalController,
              private renderer: Renderer2) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps()
        .then(googleMaps => {
          this.googleMaps = googleMaps;
          const mapEl = this.mapElementRef.nativeElement;
          const map = new googleMaps.Map(mapEl, {
            center: this.center,
            zoom: 16 
          });
          this.googleMaps.event.addListenerOnce(map, 'idle', () => {
            this.renderer.addClass(mapEl, 'visible');
          });

          if (this.selectable) {
            this.clickListener = map.addListener('click', event => {
              const selectedCoords = { 
                lat: event.latLng.lat(), 
                lng: event.latLng.lng()
              };
              this.modalCtrl.dismiss(selectedCoords);
            });
          } else {
            const marker = new googleMaps.Marker({
              position: this.center,
              map,
              title: 'Picked Location'
            });
            marker.setMap(map);
          }

        })
        .catch(error => {
          console.log(error);
        });
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;

    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available.');
        }
      };
    });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

}
