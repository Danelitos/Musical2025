import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TheaterService } from '../../services/theater.service';
import { Seat } from '../../models/theater.model';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  reservedSeats: Seat[] = [];
  subtotal: number = 0;
  serviceFee: number = 0;
  totalPrice: number = 0;
  confirmationCode: string = '';

  constructor(
    private theaterService: TheaterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reservedSeats = this.theaterService.getSelectedSeats();

    if (this.reservedSeats.length === 0) {
      this.router.navigate(['/seating']);
      return;
    }

    this.subtotal = this.reservedSeats.reduce((total, seat) => total + seat.price, 0);
    this.serviceFee = this.subtotal * 0.10; // 10% de comisión
    this.totalPrice = this.subtotal + this.serviceFee;

    this.confirmationCode = this.generateConfirmationCode();

    this.theaterService.clearSelection();
  }

  generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  bookMoreTickets(): void {
    this.router.navigate(['/seating']);
  }

  trackBySeatId(index: number, seat: Seat): string | undefined {
    return seat?.id;
  }
}