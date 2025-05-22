import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Seat {
  id: string;
  row: number;
  number: number;
  reserved: boolean;
}

@Component({
  selector: 'app-seating-plan',
  templateUrl: './seating-plan-component.component.html',
  styleUrls: ['./seating-plan-component.component.css']
})
export class SeatingPlanComponent implements OnInit {
  seats: Seat[] = [];
  selectedSeats: Set<string> = new Set();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSeats();
  }

  loadSeats() {
    this.http.get<Seat[]>('/api/seats').subscribe(data => {
      this.seats = data;
      this.selectedSeats.clear();
    });
  }

  toggleSeatSelection(seat: Seat) {
    if (seat.reserved) return;
    if (this.selectedSeats.has(seat.id)) {
      this.selectedSeats.delete(seat.id);
    } else {
      this.selectedSeats.add(seat.id);
    }
  }

  reserveSelectedSeats() {
    const seatIds = Array.from(this.selectedSeats);
    this.http.post('/api/reserve', { seatIds }).subscribe(() => {
      this.loadSeats();
    });
  }
}