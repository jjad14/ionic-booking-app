import { Injectable } from '@angular/core';
import { UrlTree, 
         CanLoad, Route, Router, 
         CanActivate, 
         ActivatedRouteSnapshot, 
         RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(private authService: AuthService,
              private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

      return this.authService.getUserAuth()
              .pipe(
                take(1),
                switchMap(isAuthenticated => {
                  if (!isAuthenticated) {
                    return this.authService.autoLogin();
                  } else {
                    return of(isAuthenticated);
                  }
                }),
                tap(isAuthenticated => {
                  if (!isAuthenticated) {
                    this.router.navigateByUrl('/auth'); 
                  }
                })
              );
  }
  
  canLoad(
    route: Route, segments: import("@angular/router").UrlSegment[])
    : boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

      return this.authService.getUserAuth()
              .pipe(
                take(1),
                switchMap(isAuthenticated => {
                  if (!isAuthenticated) {
                    return this.authService.autoLogin();
                  } else {
                    return of(isAuthenticated);
                  }
                }),
                tap(isAuthenticated => {
                  if (!isAuthenticated) {
                    this.router.navigateByUrl('/auth'); 
                  }
                })
              );
  }

  
}

/*Since we lazy load our content here, canActivate is actually the wrong guard because that 
would mean that the code for the lazy loaded module gets downloaded before the guard actually 
executes and that means if we prevents the navigation, we downloaded the code for nothing.

So instead we should use canLoad which actually is a guard that runs before lazy loaded code is 
fetched.*/ 