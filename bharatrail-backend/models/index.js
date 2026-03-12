const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user")(sequelize, DataTypes);
const Train = require("./train")(sequelize, DataTypes);
const SeatInventory = require("./seatInventory")(sequelize, DataTypes);
const Booking = require("./booking")(sequelize, DataTypes);
const Passenger = require("./passenger")(sequelize, DataTypes);

User.hasMany(Booking, { foreignKey: "user_id", as: "bookings" });
Booking.belongsTo(User, { foreignKey: "user_id", as: "user" });

Train.hasMany(SeatInventory, { foreignKey: "train_id", as: "seatInventory" });
SeatInventory.belongsTo(Train, { foreignKey: "train_id", as: "train" });

Train.hasMany(Booking, { foreignKey: "train_id", as: "bookings" });
Booking.belongsTo(Train, { foreignKey: "train_id", as: "train" });

Booking.hasMany(Passenger, { foreignKey: "booking_id", as: "passengers" });
Passenger.belongsTo(Booking, { foreignKey: "booking_id", as: "booking" });

module.exports = {
  sequelize,
  User,
  Train,
  SeatInventory,
  Booking,
  Passenger
};
