
require("dotenv").config();

const {
    startOutboxPublisher,
} = require("./src/outbox/outboxPublisher");

startOutboxPublisher().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
