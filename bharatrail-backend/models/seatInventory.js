module.exports = (sequelize, DataTypes) => {
  const SeatInventory = sequelize.define(
    "SeatInventory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      train_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      class_type: {
        type: DataTypes.ENUM("Sleeper", "3AC", "2AC", "1AC"),
        allowNull: false
      },
      total_seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      available_seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      }
    },
    {
      tableName: "seat_inventories",
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["train_id", "class_type"]
        }
      ]
    }
  );

  return SeatInventory;
};
