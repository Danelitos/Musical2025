import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TheaterService } from '../../services/theater.service';
import { Theater, Seat } from '../../models/theater.model';
import { SeatComponent } from './seat/seat.component';

@Component({
  selector: 'app-seating',
  standalone: true,
  imports: [CommonModule, SeatComponent],
  templateUrl: './seating.component.html',
  styleUrls: ['./seating.component.css']
})
export class SeatingComponent implements OnInit {
  theater: Theater | null = null;
  allSeats: Seat[] = [];
  selectedSeats: Seat[] = [];
  totalPrice: number = 0;
  seatLayout: { type: 'seat' | 'gap', seat?: Seat }[][] = [];

  constructor(
    private theaterService: TheaterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTheaterData();
    this.theaterService.selectedSeats$.subscribe(seats => {
      this.selectedSeats = seats;
      this.totalPrice = this.theaterService.getTotalPrice();
    });
  }

  loadTheaterData(): void {
    this.theaterService.getTheater().subscribe(theater => {
      this.theater = theater;
      this.allSeats = theater.seats;
      this.buildSeatLayout();
    });
  }

  buildSeatLayout(): void {
    // Debe coincidir con el layout del backend
    const layout = [
      [2, 9, 2, 9, 2],
      [2, 9, 2, 9, 2],
      [1, 10, 2, 10, 1],
      [1, 10, 2, 10, 1],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [0, 11, 2, 11, 0],
      [1, 10, 2, 10, 1],
      [1, 10, 2, 10, 1],
      [2, 9, 2, 9, 2],
      [2, 9, 2, 9, 2],
    ];
    this.seatLayout = [];
    for (let row = 1; row <= layout.length; row++) {
      const [emptyLeft, seatsLeft, aisle, seatsRight, emptyRight] = layout[row - 1];
      const rowArr: { type: 'seat' | 'gap', seat?: Seat }[] = [];
      let seatNum = 1;
      // Left empty
      for (let i = 0; i < emptyLeft; i++) rowArr.push({ type: 'gap' });
      // Left seats
      for (let i = 0; i < seatsLeft; i++) {
        const seat = this.allSeats.find(s => s.row === row && s.number === seatNum);
        if (seat) rowArr.push({ type: 'seat', seat });
        seatNum++;
      }
      // Central aisle
      for (let i = 0; i < aisle; i++) rowArr.push({ type: 'gap' });
      // Right seats
      for (let i = 0; i < seatsRight; i++) {
        const seat = this.allSeats.find(s => s.row === row && s.number === seatNum);
        if (seat) rowArr.push({ type: 'seat', seat });
        seatNum++;
      }
      // Right empty
      for (let i = 0; i < emptyRight; i++) rowArr.push({ type: 'gap' });
      this.seatLayout.push(rowArr);
    }
  }

  getSeat(row: number, seatNumber: number): Seat | undefined {
    return this.allSeats.find(seat => seat.row === row && seat.number === seatNumber);
  }

  toggleSeatSelection(seat: Seat): void {
    if (seat.reserved) return;
    this.theaterService.toggleSeatSelection(seat);
  }

  isSeatSelected(seatId: string | undefined): boolean {
    if (!seatId) return false;
    return this.theaterService.isSeatSelected(seatId);
  }

  getSectionGridRow(firstRow: number): string {
    return `span 7`; // Ajustado para más filas visibles en etiquetas
  }

  reserveSeats(): void {
    if (this.selectedSeats.length === 0) return;

    const seatIds = this.selectedSeats.map(seat => seat.id);
    this.theaterService.reserveSeats(seatIds).subscribe({
      next: (response) => {
        if (response.success) {
          // Navigate to confirmation page
          this.router.navigate(['/confirmation']);
        }
      },
      error: (error) => {
        console.error('Error reserving seats', error);
        // Handle error (show message to user)
        if (error.status === 409) {
          alert('Algunos asientos ya están reservados. Por favor, actualiza y vuelve a intentarlo.');
          this.loadTheaterData();
          this.theaterService.clearSelection();
        } else {
          alert('Ocurrió un error al reservar los asientos. Inténtalo de nuevo.');
        }
      }
    });
  }

  sectionTrackBy(index: number, section: any): string {
    return section.name;
  }

  rowTrackBy(index: number): number {
    return index;
  }

  seatTrackBy(index: number, seat: Seat): string | undefined {
    return seat?.id;
  }

  trackByCell(index: number, cell: { type: 'seat' | 'gap', seat?: Seat }) {
    return cell.type === 'seat' && cell.seat ? cell.seat.id : 'gap-' + index;
  }
}