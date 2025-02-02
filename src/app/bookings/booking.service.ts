import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';

interface BookingData {
    bookedFrom: string;
    bookedTo: string;
    firstName: string;
    guestNumber: number;
    lastName: string;
    placeId: string;
    placeImage: string;
    placeTitle: string;
    userId: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private _bookings = new BehaviorSubject<Booking[]>([]);

    getBookings() {
        return this._bookings.asObservable();
    }

    constructor(private authService: AuthService,
                private http: HttpClient) {}

    addBooking(
        placeId: string, 
        placeTitle: string, 
        placeImage: string, 
        firstName: string, 
        lastName: string, 
        guestNumber: number, 
        dateFrom: Date, 
        dateTo: Date
    ) {

    let genId: string;
    let newBooking: Booking;
    let fetchedUserId: string;
    return this.authService
        .getUserId()
        .pipe(
            take(1), 
            switchMap(userId => {
                if (!userId) {
                    throw new Error('No user id found');
                }
                fetchedUserId = userId;
                return this.authService.getToken();
            }),
            take(1),
            switchMap(token => {
                newBooking = new Booking(
                    Math.random().toString(), 
                    placeId, 
                    fetchedUserId,
                    placeTitle,
                    placeImage,
                    firstName,
                    lastName,
                    guestNumber,
                    dateFrom,
                    dateTo);

                return this.http.post<{ name: string }>(
                    `https://ibooking-bd962.firebaseio.com/bookings.json?auth=${token}`, 
                    { ...newBooking, id: null });
            }),
            switchMap(resData => {
                genId = resData.name;
                return this._bookings;
            }),
            // and do the same we did before. 
            take(1),
            tap(bookings => {
                newBooking.id = genId;
                this._bookings.next(bookings.concat(newBooking));
            }));      
    }

    cancelBooking(bookingId: string) {
        return this.authService.getToken()
            .pipe(
                take(1),
                switchMap(token => {
                    return this.http.delete(
                        `https://ibooking-bd962.firebaseio.com/bookings/${bookingId}.json?auth=${token}`
                    );
                }),
                switchMap(() => {
                    return this._bookings;
                }),
                take(1),
                tap(bookings => {
                    this._bookings.next(bookings.filter(booking => booking.id !== bookingId));
                })
            );
    }

    fetchBookings() {
        let fetchedUserId: string;
        return this.authService.getUserId()
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('User not found!');
                    }
                    fetchedUserId = userId;
                    return this.authService.getToken();
                }),
                take(1),
                switchMap(token => {
                    return this.http.get<{ [key: string]: BookingData }>(
                        `https://ibooking-bd962.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${
                            fetchedUserId}"&auth=${token}`);
                }),
                map( bookingData => {
                    const bookings = [];
        
                    for (const key in bookingData) {
                        if (bookingData.hasOwnProperty(key)) {
                            bookings.push(new Booking(
                                key, 
                                bookingData[key].placeId,
                                bookingData[key].userId,
                                bookingData[key].placeTitle,
                                bookingData[key].placeImage,
                                bookingData[key].firstName,
                                bookingData[key].lastName,
                                bookingData[key].guestNumber,
                                new Date(bookingData[key].bookedFrom),
                                new Date(bookingData[key].bookedTo),
                                ));
                        }
                    }
                    return bookings;
                }
                ), tap(bookings => {
                    this._bookings.next(bookings);
                })
            );
    }

}
