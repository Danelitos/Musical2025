import {readData, writeData} from '../modelos/theater.js';

export function getTheater(req, res) {
  const data = readData();
  res.json(data);
}

export function getSeats(req, res) {
  const data = readData();
  res.json(data.seats);
}

export function reserveSeats(req, res) {
  const { seatIds } = req.body;
  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'Invalid seat selection' });
  }

  const data = readData();
  const alreadyReserved = seatIds.filter(id =>
    data.seats.find(seat => seat.id === id && seat.reserved)
  );
  if (alreadyReserved.length > 0) {
    return res.status(409).json({
      error: 'Some seats are already reserved',
      seats: alreadyReserved
    });
  }

  data.seats.forEach(seat => {
    if (seatIds.includes(seat.id)) {
      seat.reserved = true;
    }
  });

  writeData(data);
  const reservedSeats = data.seats.filter(seat => seatIds.includes(seat.id));
  res.json({
    success: true,
    message: 'Seats reserved successfully',
    seats: reservedSeats
  });
}
