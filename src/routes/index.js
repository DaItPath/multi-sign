const { Router } = require("express");
const route = Router();
const authRoute = require("./auth");

route.use("/auth", authRoute);

module.exports = route;
