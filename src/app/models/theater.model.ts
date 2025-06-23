export interface Seat {
  id: string;
  row: number;
  number: number;
  section: string;
  price: number; // will be fixed to 10
  reserved: boolean;
}

export interface Section {
  name: string;
  rows: number[];
  price: number; // will be fixed to 10
}

export interface Theater {
  name: string;
  rows: number;
  seatsPerRow: number;
  sections: Section[];
  seats: Seat[];
}

export interface ReservationRequest {
  seatIds: string[];
}

export interface ReservationResponse {
  success: boolean;
  message: string;
  seats: Seat[];
}