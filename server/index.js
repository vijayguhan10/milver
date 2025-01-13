const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const db = require("./config/db");
const cronJob = require("../server/cron/todaysfuelamount"); // Import the cron job

const customerRoutes = require("./routes/customerRoutes");
const deliverymenRoutes = require("./routes/deliverymenRoutes");
const routeRoutes = require("./routes/routeRoutes");
const bottleRoutes = require("./routes/bottleRoutes");
const fuelallowance = require("./routes/FuelAllowanceRoutes");

const clearfuntion = require("./controllers/deliverymenController");
clearfuntion.resetDriverStatusAndRoutes();

const app = express();
const PORT = process.env.PORT || 8000;

db();

app.use(cors({ origin: "*" }));
app.use(express.json()); 
 
app.use("/api/customer", customerRoutes);
app.use("/api/deliverymen", deliverymenRoutes);
app.use("/api/route", routeRoutes); 
app.use("/api/bottle", bottleRoutes);
app.use("/api/fuelallowance", fuelallowance);
  
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`); 
});  
   