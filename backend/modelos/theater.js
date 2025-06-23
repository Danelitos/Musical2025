import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data.json');

const seatLayout = [
  [4, 7, 2, 7, 4],
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
  [4, 7, 2, 7, 4],
];

/**
 * @typedef {Object} Seat
 * @property {string} id
 * @property {number} row
 * @property {number} number
 * @property {string} section
 * @property {number} price
 * @property {boolean} reserved
 */

export function generateInitialData() {
  const theaterData = {
    name: "Broadway Theater",
    rows: seatLayout.length,
    seatsPerRow: Math.max(...seatLayout.map(r => r[1] + r[3])),
    sections: [
      { name: "General", rows: Array.from({length: seatLayout.length}, (_, i) => i + 1), price: 5 }
    ],
    /** @type {Seat[]} */
    seats: []
  };

  for (let row = 1; row <= seatLayout.length; row++) {
    let [emptyLeft, seatsLeft, aisle, seatsRight, emptyRight] = seatLayout[row - 1];
    let seatNumber = 1;
    for (let i = 0; i < emptyLeft; i++) seatNumber++;
    for (let i = 0; i < seatsLeft; i++) {
      theaterData.seats.push({
        id: `${row}-${seatNumber}`,
        row: row,
        number: seatNumber,
        section: "General",
        price: 5,
        reserved: false
      });
      seatNumber++;
    }
    
    for (let i = 0; i < aisle; i++) seatNumber++;

    for (let i = 0; i < seatsRight; i++) {
      theaterData.seats.push({
        id: `${row}-${seatNumber}`,
        row: row,
        number: seatNumber,
        section: "General",
        price: 5,
        reserved: false
      });
      seatNumber++;
    }
  }
  return theaterData;
}

export function initDataFile() {
  if (!fs.existsSync(dataPath)) {
    const data = generateInitialData();
    fs.writeFileSync(dataPath, JSON.stringify(data), 'utf8');
  }
}

export function readData() {
  initDataFile();
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

export function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data), 'utf8');
}

export function updateSeatsAsReserved(seatIds) {
  const data = readData();
  let updated = false;
  for (const seat of data.seats) {
    if (seatIds.includes(seat.id)) {
      seat.reserved = true;
      updated = true;
    }
  }
  if (updated) writeData(data);
}