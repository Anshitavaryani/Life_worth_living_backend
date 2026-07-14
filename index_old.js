const app = require('./app.js');
const moment = require('moment');
const config = require('./src/config/config.js');
const logger = require('./src/config/logger.js');
process.env.TZ = config.DEFAULT_TIMEZONE;

// For Http Server
// const http = require('http');
// let servers = http.createServer(app);


// For Https Server
let https = require('https');
let fs = require('fs');
let options = {
  key: fs.readFileSync('/etc/ssl/virtualmin/17690882161840194/ssl.key'),
  cert: fs.readFileSync('/etc/ssl/virtualmin/17690882161840194/ssl.cert'),
  ca: fs.readFileSync('/etc/ssl/virtualmin/17690882161840194/ssl.ca'),
};
let servers = https.createServer(options, app);

// Get the current date and time
const currentTime = moment();
let server = servers.listen(config.port, () => {
    logger.info(`Server is Working Fine😊 & Listening to PORT: ${config.port} | Default Timezone is: ${process.env.TZ} | Current date and time: ${currentTime.format('YYYY-MM-DD HH:mm:ss')}`);
});


//server exit operations
const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

//unexpectedError handler
const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', exitHandler);


