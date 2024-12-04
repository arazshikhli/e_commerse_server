// logger.js
const pino = require("pino");
const fs = require("fs");

// Создаём поток записи в файл
const logStream = pino.destination("./logs/app.log");

// Инициализация логгера
const logger = pino(
  {
    level: "info", // Уровень логирования
    timestamp: pino.stdTimeFunctions.isoTime, // Человекочитаемая метка времени
  },
  logStream // Поток записи в файл
);

module.exports = logger;
