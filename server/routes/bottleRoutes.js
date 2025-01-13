const express = require("express");
const router = express.Router();
const {
  addBottleDetail,
  getBottlesByRoute,
  getBottleDetailById,
  updateBottleDetail,
  deleteBottle,
  deleteBottleDetail,
} = require("../controllers/bottleController");

router.post("/addDetail", addBottleDetail);

router.post("/byRoute", getBottlesByRoute);

router.post("/getDetail", getBottleDetailById);

router.put("/updateDetail", updateBottleDetail);

router.delete("/deleteBottle", deleteBottle);

router.delete("/deleteDetail", deleteBottleDetail);

module.exports = router;
