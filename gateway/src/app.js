const express = require("express");

const loggerMiddleware = require("./middleware/loggerMiddleware");
const rateLimitMiddleware = require("./middleware/rateLimitMiddleware");
const routes = require("./routes");

const app = express();

app.use(express.json());

app.use(loggerMiddleware);
app.use(rateLimitMiddleware);

app.use("/api", routes);

module.exports = app;