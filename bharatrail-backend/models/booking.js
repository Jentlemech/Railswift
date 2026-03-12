module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "Booking",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      pnr_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
      },
      train_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      journey_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      booking_status: {
        type: DataTypes.ENUM("Confirmed", "RAC", "Waiting List", "Cancelled"),
        allowNull: false,
        defaultValue: "Confirmed"
      },
      class_type: {
        type: DataTypes.ENUM("Sleeper", "3AC", "2AC", "1AC"),
        allowNull: false
      },
      total_fare: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: "bookings",
      underscored: true,
      createdAt: "created_at",
      updatedAt: false
    }
  );

  return Booking;
};
