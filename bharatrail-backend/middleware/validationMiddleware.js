function makeError(message, statusCode = 400, details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) && !Number.isNaN(new Date(value).getTime());
}

function validateRegister(req, _res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(makeError("name, email, and password are required."));
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return next(makeError("A valid email address is required."));
  }

  if (String(password).length < 8) {
    return next(makeError("Password must be at least 8 characters long."));
  }

  return next();
}

function validateLogin(req, _res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(makeError("email and password are required."));
  }

  return next();
}

function validateTrainSearch(req, _res, next) {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return next(makeError("from, to, and date query parameters are required."));
  }

  if (!isValidDate(date)) {
    return next(makeError("date must be in YYYY-MM-DD format."));
  }

  return next();
}

function validateCreateBooking(req, _res, next) {
  const { trainId, journeyDate, classType, passengers } = req.body;

  if (!trainId || !journeyDate || !classType || !Array.isArray(passengers) || passengers.length === 0) {
    return next(makeError("trainId, journeyDate, classType, and passengers are required."));
  }

  if (!isValidDate(journeyDate)) {
    return next(makeError("journeyDate must be in YYYY-MM-DD format."));
  }

  const allowedClasses = ["Sleeper", "3AC", "2AC", "1AC"];
  if (!allowedClasses.includes(classType)) {
    return next(makeError(`classType must be one of: ${allowedClasses.join(", ")}.`));
  }

  if (passengers.length > 6) {
    return next(makeError("A maximum of 6 passengers can be booked in one request."));
  }

  for (const passenger of passengers) {
    if (!passenger.name || !passenger.age || !passenger.gender) {
      return next(makeError("Each passenger requires name, age, and gender."));
    }
  }

  return next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateTrainSearch,
  validateCreateBooking,
  makeError
};
