module.exports = (sequelize, DataTypes) => {
  const Train = sequelize.define(
    "Train",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      train_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
      },
      train_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      source_station: {
        type: DataTypes.STRING,
        allowNull: false
      },
      destination_station: {
        type: DataTypes.STRING,
        allowNull: false
      },
      departure_time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      arrival_time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: "trains",
      underscored: true
    }
  );

  return Train;
};
