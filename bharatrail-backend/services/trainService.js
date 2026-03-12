const { Op } = require("sequelize");
const { Train, SeatInventory } = require("../models");
const { makeError } = require("../middleware/validationMiddleware");

async function getAllTrains() {
  return Train.findAll({
    include: [{ model: SeatInventory, as: "seatInventory" }],
    order: [["train_number", "ASC"]]
  });
}

async function searchTrains({ from, to }) {
  const trains = await Train.findAll({
    where: {
      source_station: {
        [Op.iLike]: from
      },
      destination_station: {
        [Op.iLike]: to
      }
    },
    include: [{ model: SeatInventory, as: "seatInventory" }],
    order: [["departure_time", "ASC"]]
  });

  return trains;
}

async function getTrainById(id) {
  const train = await Train.findByPk(id, {
    include: [{ model: SeatInventory, as: "seatInventory" }]
  });

  if (!train) {
    throw makeError("Train not found.", 404);
  }

  return train;
}

async function getTrainByNumber(trainNumber) {
  const train = await Train.findOne({
    where: { train_number: String(trainNumber) },
    include: [{ model: SeatInventory, as: "seatInventory" }]
  });

  if (!train) {
    throw makeError("Train not found.", 404);
  }

  return train;
}

module.exports = {
  getAllTrains,
  searchTrains,
  getTrainById,
  getTrainByNumber
};
