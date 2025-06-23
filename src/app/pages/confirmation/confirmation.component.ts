import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  seatCount: number = 0;
  totalPrice: number = 0;
  confirmationCode: string = '';
  paymentStatus: string = '';
  loading: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.http.get<any>(`http://localhost:3000/api/stripe-session?session_id=${sessionId}`).subscribe({
          next: (session) => {
            this.paymentStatus = session.payment_status;
            this.totalPrice = session.amount_total ? session.amount_total / 100 : 0;
            this.seatCount = session.line_items?.data?.[0]?.quantity || 0
            this.confirmationCode = session.metadata?.confirmation_code || this.generateConfirmationCode();
            this.loading = false;
          },
          error: () => {
            this.paymentStatus = 'error';
            this.loading = false;
          }
        });
      } else {
        // Si no hay sesión, redirigir al inicio
        this.router.navigate(['/']);
      }
    });
  }

  generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  bookMoreTickets(): void {
    this.router.navigate(['/seating']);
  }
}