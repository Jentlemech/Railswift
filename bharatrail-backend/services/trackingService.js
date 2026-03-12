const { getTrainByNumber } = require("./trainService");

function hashSeed(value) {
  return String(value || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

async function getTrainLocation(trainNumber) {
  const train = await getTrainByNumber(trainNumber);
  const hash = hashSeed(trainNumber);

  return {
    train_number: train.train_number,
    train_name: train.train_name,
    current_station: hash % 2 === 0 ? `${train.source_station} Outbound Section` : `${train.destination_station} Corridor`,
    next_station: hash % 2 === 0 ? "Intermediate Junction" : train.destination_station,
    delay_minutes: hash % 17,
    eta: train.arrival_time
  };
}

module.exports = {
  getTrainLocation
};
