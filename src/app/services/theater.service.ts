import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Theater, Seat, ReservationRequest, ReservationResponse } from '../models/theater.model';

@Injectable({
  providedIn: 'root'
})
export class TheaterService {
  private apiUrl = 'http://localhost:3000/api';
  private selectedSeatsSubject = new BehaviorSubject<Seat[]>([]);
  selectedSeats$ = this.selectedSeatsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTheater(): Observable<Theater> {
    return this.http.get<Theater>(`${this.apiUrl}/theater`);
  }

  getSeats(): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/seats`);
  }

  reserveSeats(seatIds: string[]): Observable<ReservationResponse> {
    const request: ReservationRequest = { seatIds };
    return this.http.post<ReservationResponse>(`${this.apiUrl}/reserve`, request);
  }

  // Select/deselect seats client-side before making reservation
  toggleSeatSelection(seat: Seat): void {
    const currentSelection = this.selectedSeatsSubject.value;
    const index = currentSelection.findIndex(s => s.id === seat.id);
    
    if (index === -1) {
      // Add seat to selection
      this.selectedSeatsSubject.next([...currentSelection, seat]);
    } else {
      // Remove seat from selection
      this.selectedSeatsSubject.next(
        currentSelection.filter(s => s.id !== seat.id)
      );
    }
  }

  clearSelection(): void {
    this.selectedSeatsSubject.next([]);
  }

  isSeatSelected(seatId: string): boolean {
    return this.selectedSeatsSubject.value.some(seat => seat.id === seatId);
  }

  getSelectedSeats(): Seat[] {
    return this.selectedSeatsSubject.value;
  }

  getTotalPrice(): number {
    return this.selectedSeatsSubject.value.reduce((total, seat) => total + seat.price, 0);
  }

  createStripeCheckoutSession(seatIds: string[]): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.apiUrl}/create-checkout-session`, { seatIds });
  }
}