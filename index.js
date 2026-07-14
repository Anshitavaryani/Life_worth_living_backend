const http = require("http");
const moment = require("moment");

const app = require("./app.js");
const config = require("./src/config/config.js");
const logger = require("./src/config/logger.js");

process.env.TZ = config.DEFAULT_TIMEZONE;

const server = http.createServer(app);

server.listen(config.port, "127.0.0.1", () => {
  logger.info(
    `Server is Working Fine 😊 & Listening to PORT: ${
      config.port
    } | Default Timezone: ${
      process.env.TZ
    } | Current date and time: ${moment().format("YYYY-MM-DD HH:mm:ss")}`
  );
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
process.on("SIGINT", exitHandler);
process.on("SIGTERM", exitHandler);
