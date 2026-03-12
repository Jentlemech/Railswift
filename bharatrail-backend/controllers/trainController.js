const trainService = require("../services/trainService");
const trackingService = require("../services/trackingService");

function serializeTrain(train) {
  return {
    id: train.id,
    train_number: train.train_number,
    train_name: train.train_name,
    source_station: train.source_station,
    destination_station: train.destination_station,
    departure_time: train.departure_time,
    arrival_time: train.arrival_time,
    duration: train.duration,
    seat_inventory: Array.isArray(train.seatInventory)
      ? train.seatInventory.map((seat) => ({
          id: seat.id,
          class_type: seat.class_type,
          total_seats: seat.total_seats,
          available_seats: seat.available_seats
        }))
      : []
  };
}

async function listTrains(_req, res) {
  const trains = await trainService.getAllTrains();
  res.json({
    success: true,
    data: trains.map(serializeTrain)
  });
}

async function searchTrains(req, res) {
  const { from, to, date } = req.query;
  const trains = await trainService.searchTrains({ from, to, date });

  res.json({
    success: true,
    message: trains.length
      ? "Trains fetched successfully."
      : "No trains found for the requested route and date.",
    data: {
      route: { from, to, date },
      count: trains.length,
      trains: trains.map(serializeTrain)
    }
  });
}

async function getTrainById(req, res) {
  const train = await trainService.getTrainById(req.params.id);
  res.json({
    success: true,
    data: serializeTrain(train)
  });
}

async function getTrainLocation(req, res) {
  const location = await trackingService.getTrainLocation(req.params.trainNumber);
  res.json({
    success: true,
    data: location
  });
}

module.exports = {
  listTrains,
  searchTrains,
  getTrainById,
  getTrainLocation
};
