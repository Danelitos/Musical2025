const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(cors());
app.use(express.json());

// Define seat layout per row (example: [left empty, seats, central aisle, seats, right empty])
const seatLayout = [
  // Each array: [emptyLeft, seatsLeft, aisle, seatsRight, emptyRight]
  [4, 7, 2, 7, 4], // Row 1 (front, closest to stage)
  [3, 8, 2, 8, 3],
  [2, 9, 2, 9, 2],
  [2, 10, 2, 10, 2],
  [1, 11, 2, 11, 1],
  [1, 12, 2, 12, 1],
  [0, 13, 2, 13, 0],
  [0, 14, 2, 14, 0],
  [0, 15, 2, 15, 0],
  [0, 16, 2, 16, 0],
  [0, 16, 2, 16, 0],
  [0, 16, 2, 16, 0],
  [0, 15, 2, 15, 0],
  [0, 14, 2, 14, 0],
  [0, 13, 2, 13, 0],
  [1, 12, 2, 12, 1],
  [1, 11, 2, 11, 1],
  [2, 10, 2, 10, 2],
  [2, 9, 2, 9, 2],
  [3, 8, 2, 8, 3],
  [4, 7, 2, 7, 4], // Row 21 (back)
];

// Initial data (for demo purposes)
const theaterData = {
  name: "Broadway Theater",
  rows: seatLayout.length,
  seatsPerRow: Math.max(...seatLayout.map(r => r.reduce((a, b) => a + b))),
  sections: [
    { name: "General", rows: Array.from({length: seatLayout.length}, (_, i) => i + 1), price: 10 }
  ],
  seats: []
};

// Generate seats with gaps for aisles and empty spaces
let seatId = 1;
for (let row = 1; row <= seatLayout.length; row++) {
  let [emptyLeft, seatsLeft, aisle, seatsRight, emptyRight] = seatLayout[row - 1];
  let seatNumber = 1;
  // Left empty
  for (let i = 0; i < emptyLeft; i++) {
    seatNumber++;
  }
  // Left seats
  for (let i = 0; i < seatsLeft; i++) {
    theaterData.seats.push({
      id: `${row}-${seatNumber}`,
      row: row,
      number: seatNumber,
      section: "General",
      price: 10,
      reserved: false
    });
    seatNumber++;
  }
  // Central aisle (skip numbers)
  for (let i = 0; i < aisle; i++) {
    seatNumber++;
  }
  // Right seats
  for (let i = 0; i < seatsRight; i++) {
    theaterData.seats.push({
      id: `${row}-${seatNumber}`,
      row: row,
      number: seatNumber,
      section: "General",
      price: 10,
      reserved: false
    });
    seatNumber++;
  }
  // Right empty (no seats, just for grid)
  // seatNumber += emptyRight; // Not needed for seat objects
}

// Store data in a file
const dataPath = path.join(__dirname, 'data.json');
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify(theaterData), 'utf8');
}

// Helper function to read data
const readData = () => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data), 'utf8');
};

// Routes
app.get('/api/theater', (req, res) => {
  const data = readData();
  res.json(data);
});

app.get('/api/seats', (req, res) => {
  const data = readData();
  res.json(data.seats);
});

app.post('/api/reserve', (req, res) => {
  const { seatIds } = req.body;
  
  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'Invalid seat selection' });
  }
  
  const data = readData();
  
  // Check if any selected seats are already reserved
  const alreadyReserved = seatIds.filter(id => 
    data.seats.find(seat => seat.id === id && seat.reserved)
  );
  
  if (alreadyReserved.length > 0) {
    return res.status(409).json({ 
      error: 'Some seats are already reserved',
      seats: alreadyReserved
    });
  }
  
  // Mark seats as reserved
  data.seats.forEach(seat => {
    if (seatIds.includes(seat.id)) {
      seat.reserved = true;
    }
  });
  
  writeData(data);
  
  // Return the reserved seats
  const reservedSeats = data.seats.filter(seat => seatIds.includes(seat.id));
  res.json({
    success: true,
    message: 'Seats reserved successfully',
    seats: reservedSeats
  });
});

// Fallback route for serving Angular app (for production)
app.use(express.static(path.join(__dirname, '../dist/demo')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/demo/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});