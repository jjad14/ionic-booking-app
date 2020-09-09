import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlacesPage } from './places.page';

const routes: Routes = [
  {
    // /places/tabs
    path: 'tabs',
    component: PlacesPage,
    children: [
      {  // /places/tabs/discover
        path: 'discover', 
        children: [
          { // /places/tabs/discover
            path: '',
            loadChildren: () => import('./discover/discover.module').then( m => m.DiscoverPageModule)
          },
          { // /places/tabs/discover/:placeId
            path: ':placeId',
            loadChildren: () => import('./discover/place-detail/place-detail.module').then( m => m.PlaceDetailPageModule)
          }
        ] 
      },
      { // /places/tabs/offers
        path: 'offers',
        children: [
          { // /places/tabs/offers
            path: '',
            loadChildren: () => import('./offers/offers.module').then( m => m.OffersPageModule)
          },
          { // /places/tabs/offers/new,
            path: 'new',
            loadChildren: () => import('./offers/new-offer/new-offer.module').then( m => m.NewOfferPageModule)
          },
          { // /places/tabs/offers/edit/:placeId,
            path: 'edit/:placeId',
            loadChildren: () => import('./offers/edit-offer/edit-offer.module').then( m => m.EditOfferPageModule)
          }
        ]
      }, 
      { // /places/tabs
        path: '',
        redirectTo: '/places/tabs/discover',
        pathMatch: 'full'
      }
    ]
  },
  {
    // /places/
    path: '',
    redirectTo: '/places/tabs/discover',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlacesPageRoutingModule {}
