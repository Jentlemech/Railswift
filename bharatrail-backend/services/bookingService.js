const { sequelize, Train, SeatInventory, Booking, Passenger } = require("../models");
const { makeError } = require("../middleware/validationMiddleware");

function classPrefix(classType) {
  return {
    Sleeper: "S",
    "3AC": "B",
    "2AC": "A",
    "1AC": "H"
  }[classType] || "C";
}

async function generateUniquePnr(transaction) {
  let pnr = "";
  let exists = true;

  while (exists) {
    pnr = String(Math.floor(1000000000 + Math.random() * 9000000000));
    exists = Boolean(await Booking.findOne({ where: { pnr_number: pnr }, transaction }));
  }

  return pnr;
}

function calculateFare(classType, passengerCount) {
  const fareMap = {
    Sleeper: 540,
    "3AC": 1240,
    "2AC": 1890,
    "1AC": 3120
  };

  return Number((fareMap[classType] || 0) * passengerCount);
}

async function createBooking({ trainId, userId, journeyDate, classType, passengers }) {
  return sequelize.transaction(async (transaction) => {
    const train = await Train.findByPk(trainId, { transaction });
    if (!train) {
      throw makeError("Train not found.", 404);
    }

    const inventory = await SeatInventory.findOne({
      where: { train_id: trainId, class_type: classType },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!inventory) {
      throw makeError("Seat inventory not found for the requested class.", 404);
    }

    if (inventory.available_seats < passengers.length) {
      throw makeError("Seats are not available for the requested class and passenger count.", 409);
    }

    const bookedCount = inventory.total_seats - inventory.available_seats;
    const pnr = await generateUniquePnr(transaction);
    const totalFare = calculateFare(classType, passengers.length);

    const booking = await Booking.create(
      {
        pnr_number: pnr,
        train_id: trainId,
        user_id: userId,
        journey_date: journeyDate,
        booking_status: "Confirmed",
        class_type: classType,
        total_fare: totalFare
      },
      { transaction }
    );

    const passengerRows = passengers.map((passenger, index) => ({
      booking_id: booking.id,
      name: passenger.name,
      age: passenger.age,
      gender: passenger.gender,
      seat_number: `${classPrefix(classType)}${bookedCount + index + 1}`,
      seat_preference: passenger.seatPreference || null
    }));

    await Passenger.bulkCreate(passengerRows, { transaction });

    inventory.available_seats -= passengers.length;
    await inventory.save({ transaction });

    return getBookingByPnr(pnr, transaction);
  });
}

async function getBookingByPnr(pnr, transaction = null) {
  const booking = await Booking.findOne({
    where: { pnr_number: pnr },
    include: [
      { model: Train, as: "train" },
      { model: Passenger, as: "passengers" }
    ],
    transaction
  });

  if (!booking) {
    throw makeError("Booking not found for the given PNR.", 404);
  }

  return booking;
}

async function getBookingsByUserId(userId) {
  return Booking.findAll({
    where: { user_id: userId },
    include: [
      { model: Train, as: "train" },
      { model: Passenger, as: "passengers" }
    ],
    order: [["created_at", "DESC"]]
  });
}

module.exports = {
  createBooking,
  getBookingByPnr,
  getBookingsByUserId
};
