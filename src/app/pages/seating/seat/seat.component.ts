import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seat } from '../../../models/theater.model';

@Component({
  selector: 'app-seat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="seat" 
      [class.available]="!seat.reserved && !selected"
      [class.reserved]="seat.reserved"
      [class.selected]="selected"
      (click)="onSeatClick()"
    >
      <div class="seat-arm left"></div>
      <div class="seat-arm right"></div>
      <div class="seat-back"></div>
      <div class="seat-cushion"></div>
      <span class="seat-number">{{ seat.number }}</span>
    </div>
  `,
  styles: [`
    .seat {
      width: 100%;
      height: 100%;
      min-width: 12px;
      min-height: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      cursor: pointer;
      position: relative;
      transition: transform 0.04s;
      font-size: 0.75rem;
      user-select: none;
      background: none;
    }
    .seat-back {
      width: 80%;
      height: 55%;
      border-radius: 60% 60% 30% 30% / 90% 90% 30% 30%;
      margin-bottom: -6px;
      border: 2px solid #2222;
      z-index: 2;
      position: relative;
    }
    .seat-cushion {
      width: 85%;
      height: 28%;
      border-radius: 0 0 12px 12px / 0 0 18px 18px;
      border: 2px solid #2222;
      z-index: 3;
      position: relative;
    }
    .seat-arm {
      position: absolute;
      bottom: 12%;
      width: 18%;
      height: 38%;
      border-radius: 8px 8px 12px 12px / 10px 10px 18px 18px;
      border: 2px solid #2222;
      z-index: 4;
    }
    .seat-arm.left {
      left: 2%;
      transform: rotate(-8deg);
    }
    .seat-arm.right {
      right: 2%;
      transform: rotate(8deg);
    }
    .seat.available .seat-back,
    .seat.available .seat-cushion,
    .seat.available .seat-arm {
      background: linear-gradient(180deg, #7ee8a5 60%, #4caf50 100%);
      border-color: #388e3c;
    }
    .seat.reserved .seat-back,
    .seat.reserved .seat-cushion,
    .seat.reserved .seat-arm {
      background: linear-gradient(180deg, #f08080 60%, #b22222 100%);
      border-color: #b22222;
    }
    .seat.selected .seat-back,
    .seat.selected .seat-cushion,
    .seat.selected .seat-arm {
      background: linear-gradient(180deg, #b3e0ff 60%, #1e90ff 100%);
      border-color: #1976d2;
    }
    .seat.selected,
    .seat:not(.reserved):hover {
      transform: scale(1.18);
      z-index: 2;
    }
    .seat-number {
      position: absolute;
      bottom: 6px;
      left: 0;
      right: 0;
      text-align: center;
      color: #fff;
      font-weight: 700;
      font-size: 0.7rem;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
      pointer-events: none;
      z-index: 20;
      letter-spacing: 0.5px;
    }
    .seat.reserved .seat-number {
      color: #fff;
      opacity: 0.7;
    }
    .seat.available .seat-number,
    .seat.selected .seat-number {
      color: #fff;
    }
  `]
})
export class SeatComponent {
  @Input() seat!: Seat;
  @Input() selected: boolean = false;
  @Output() seatClick = new EventEmitter<Seat>();

  onSeatClick(): void {
    if (!this.seat.reserved) {
      this.seatClick.emit(this.seat);
    }
  }
}