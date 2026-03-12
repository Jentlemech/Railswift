const { Train, SeatInventory } = require("../models");

const sampleTrains = [
  {
    train_number: "22436",
    train_name: "Vande Bharat Express",
    source_station: "NDLS",
    destination_station: "BCT",
    departure_time: "06:00:00",
    arrival_time: "14:10:00",
    duration: "08:10"
  },
  {
    train_number: "12007",
    train_name: "Shatabdi Express",
    source_station: "MAS",
    destination_station: "SBC",
    departure_time: "06:00:00",
    arrival_time: "11:05:00",
    duration: "05:05"
  },
  {
    train_number: "12625",
    train_name: "Kerala Express",
    source_station: "ERS",
    destination_station: "TVC",
    departure_time: "09:40:00",
    arrival_time: "13:55:00",
    duration: "04:15"
  }
];

const classInventory = [
  { class_type: "Sleeper", total_seats: 120, available_seats: 120 },
  { class_type: "3AC", total_seats: 72, available_seats: 72 },
  { class_type: "2AC", total_seats: 48, available_seats: 48 },
  { class_type: "1AC", total_seats: 24, available_seats: 24 }
];

async function seedDemoData() {
  const existingTrains = await Train.count();
  if (existingTrains > 0) return;

  for (const trainData of sampleTrains) {
    const train = await Train.create(trainData);
    await SeatInventory.bulkCreate(
      classInventory.map((inventory) => ({
        ...inventory,
        train_id: train.id
      }))
    );
  }
}

module.exports = {
  seedDemoData
};
