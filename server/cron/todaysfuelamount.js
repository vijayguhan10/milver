const cron = require("node-cron");
const Route = require("../models/Route"); 

cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Resetting todaysAmount for all routes...");
      const result = await Route.updateMany({}, { $set: { todaysAmount: 0 } });
      console.log(`Successfully reset ${result.nModified} routes' todaysAmount.`);
    } catch (error) {
      console.error("Error resetting todaysAmount:", error);
    }
  });


//   0 0 * * *"