module.exports = (sequelize, DataTypes) => {
  const Passenger = sequelize.define(
    "Passenger",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 120
        }
      },
      gender: {
        type: DataTypes.ENUM("Male", "Female", "Other"),
        allowNull: false
      },
      seat_number: {
        type: DataTypes.STRING,
        allowNull: false
      },
      seat_preference: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "passengers",
      underscored: true,
      timestamps: false
    }
  );

  return Passenger;
};
