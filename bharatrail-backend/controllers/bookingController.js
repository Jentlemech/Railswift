const bookingService = require("../services/bookingService");

function serializeBooking(booking) {
  return {
    id: booking.id,
    pnr_number: booking.pnr_number,
    journey_date: booking.journey_date,
    booking_status: booking.booking_status,
    class_type: booking.class_type,
    total_fare: booking.total_fare,
    created_at: booking.created_at,
    train: booking.train
      ? {
          id: booking.train.id,
          train_number: booking.train.train_number,
          train_name: booking.train.train_name,
          source_station: booking.train.source_station,
          destination_station: booking.train.destination_station,
          departure_time: booking.train.departure_time,
          arrival_time: booking.train.arrival_time,
          duration: booking.train.duration
        }
      : null,
    passengers: Array.isArray(booking.passengers)
      ? booking.passengers.map((passenger) => ({
          id: passenger.id,
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
          seat_number: passenger.seat_number,
          seat_preference: passenger.seat_preference
        }))
      : []
  };
}

async function createBooking(req, res) {
  const booking = await bookingService.createBooking({
    trainId: req.body.trainId,
    userId: req.user.id,
    journeyDate: req.body.journeyDate,
    classType: req.body.classType,
    passengers: req.body.passengers
  });

  res.status(201).json({
    success: true,
    message: "Booking created successfully.",
    data: serializeBooking(booking)
  });
}

async function getBookingByPnr(req, res) {
  const booking = await bookingService.getBookingByPnr(req.params.pnr);
  res.json({
    success: true,
    data: serializeBooking(booking)
  });
}

async function getBookingsByUser(req, res) {
  const bookings = await bookingService.getBookingsByUserId(req.params.userId);
  res.json({
    success: true,
    data: bookings.map(serializeBooking)
  });
}

module.exports = {
  createBooking,
  getBookingByPnr,
  getBookingsByUser,
  serializeBooking
};
