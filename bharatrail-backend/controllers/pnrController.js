const bookingService = require("../services/bookingService");
const { serializeBooking } = require("./bookingController");

async function getPnrStatus(req, res) {
  const booking = await bookingService.getBookingByPnr(req.params.pnr);
  const data = serializeBooking(booking);

  res.json({
    success: true,
    data: {
      pnr_number: data.pnr_number,
      booking_status: data.booking_status,
      journey_date: data.journey_date,
      train: data.train,
      passengers: data.passengers
    }
  });
}

module.exports = {
  getPnrStatus
};
