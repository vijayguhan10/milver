const Deliverymen = require("../models/Deliverymen");
const Route = require("../models/Route");
const cron = require("node-cron");

const getAllDeliverymen = async (req, res) => {
  try {
    const deliverymen = await Deliverymen.find()
      .populate({
        path: "routes",
        select: "route_id route_name location distance",
      })
      .populate("delivery_history.customer");

    const transformedDeliverymen = deliverymen.map((deliveryman) => ({
      ...deliveryman.toObject(),
      routes: deliveryman.routes.map((route) => ({
        id: route.route_id,
        name: route.route_name,
        location: route.location,
        distance: route.distance,
      })),
    }));

    res.json(transformedDeliverymen);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching deliverymen records", error });
  }
};

const getDeliverymanById = async (req, res) => {
  try {
    const deliveryman = await Deliverymen.findById(req.body.id).populate(
      "delivery_history.customer"
    );
    if (!deliveryman)
      return res.status(404).json({ message: "Deliveryman not found" });
    res.json(deliveryman);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching deliveryman record", error });
  }
};

const createDeliveryman = async (req, res) => {
  const { name, phone, email, address, routes, category } = req.body;
  console.log(req.body);

  try {
    if (!Array.isArray(routes) || routes.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one route ID is required" });
    }

    const routeObjects = [];

    for (let route_id of routes) {
      if (!route_id) {
        return res
          .status(400)
          .json({ message: "Invalid route ID in the request body" });
      }

      const routeObject = await Route.findOne({ route_id });

      if (!routeObject) {
        return res
          .status(404)
          .json({ message: `Route with ID ${route_id} not found` });
      }

      routeObjects.push(routeObject);
    }

    const newDeliveryman = new Deliverymen({
      name,
      phone,
      email,
      address,
      category,
      routes: routeObjects.map((route) => route._id),
    });

    const savedDeliveryman = await newDeliveryman.save();

    if (!category == "backup_driver") {
      let assignedRoute = null;

      for (let route of routeObjects) {
        if (!route.driver) {
          assignedRoute = route;
          route.driver = savedDeliveryman._id;
          await route.save();
          break;
        }
      }

      if (!assignedRoute) {
        return res
          .status(400)
          .json({ message: "No available routes without a driver" });
      }

      savedDeliveryman.status = "assigned";
      await savedDeliveryman.save();

      res.status(201).json({
        message: "Deliveryman created and assigned to a route",
        deliveryman: savedDeliveryman,
        assignedRoute: assignedRoute.route_id,
      });
    } else {
      res.status(201).json({
        message: "Deliveryman created",
        deliveryman: savedDeliveryman,
      });
    }
  } catch (error) {
    console.error("Error details:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate driver_id or other unique constraint error",
        error: error.message,
      });
    }
    res.status(400).json({
      message: "Error creating deliveryman record",
      error: error.message,
    });
  }
};

const attendencedeliverymen = async (req, res) => {
  try {
    const { driver_id, is_present } = req.body;

    // Validate input
    if (!driver_id || typeof is_present !== "boolean") {
      res.status(400).json({
        message: "Driver ID and attendance status are required",
      });
      return;
    }

    console.log("Received Payload:", { driver_id, is_present });

    const attendanceStatus = is_present ? "present" : "absent";
    const deliverymenStatus = is_present ? "available" : "on_leave";

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const driver = await Deliverymen.findOne({ _id: driver_id });

    if (!driver) {
      res
        .status(404)
        .json({ message: `Driver with ID ${driver_id} not found` });
      return;
    }

    // Check if attendance for today is already marked
    const alreadyMarked = driver.attendence.some((att) => {
      const recordDate = new Date(att.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === currentDate.getTime();
    });

    if (alreadyMarked) {
      res.status(400).json({
        message: "Attendance for today has already been marked",
      });
      return;
    }

    // Update attendance
    const updatedDriver = await Deliverymen.findOneAndUpdate(
      { _id: driver_id },
      {
        $push: {
          attendence: {
            date: new Date(),
            status: attendanceStatus,
          },
        },
        status: deliverymenStatus,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Attendance and status updated successfully",
      updatedDriver,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res
      .status(500)
      .json({ message: "Error updating attendance", error: error.message });
  }
};

const updateDeliveryman = async (req, res) => {
  try {
    console.log("update deliverymen");
    console.log(req.body);
    const updatedDeliveryman = await Deliverymen.findByIdAndUpdate(
      req.body.id,
      req.body,
      { new: true }
    ).populate("delivery_history.customer");

    if (!updatedDeliveryman)
      return res.status(404).json({ message: "Deliveryman not found" });
    res.json(updatedDeliveryman);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating deliveryman record", error });
  }
};

const deleteDeliveryman = async (req, res) => {
  try {
    console.log("Delete request received for ID:", req.body.id);

    const deletedDeliveryman = await Deliverymen.findByIdAndDelete(req.body.id);

    if (!deletedDeliveryman) {
      return res.status(404).json({ message: "Deliveryman not found" });
    }

    res.json({ message: "Deliveryman record deleted successfully" });
  } catch (error) {
    console.error("Error deleting deliveryman record:", error);
    res
      .status(500)
      .json({ message: "Error deleting deliveryman record", error });
  }
};

const addDeliveryHistory = async (req, res) => {
  try {
    const { customer, delivered_at, status } = req.body;
    const deliveryman = await Deliverymen.findById(req.body.id);

    if (!deliveryman)
      return res.status(404).json({ message: "Deliveryman not found" });

    const deliveryHistoryEntry = {
      customer,
      delivered_at,
      status,
    };

    deliveryman.delivery_history.push(deliveryHistoryEntry);
    await deliveryman.save();

    res.status(201).json(deliveryman);
  } catch (error) {
    res.status(400).json({ message: "Error adding delivery history", error });
  }
};

const updateDeliveryHistory = async (req, res) => {
  try {
    const { customer, delivered_at, status } = req.body;
    const deliveryman = await Deliverymen.findById(req.body.id);

    if (!deliveryman)
      return res.status(404).json({ message: "Deliveryman not found" });

    const historyEntry = deliveryman.delivery_history.id(req.body.historyId);

    if (!historyEntry)
      return res.status(404).json({ message: "History entry not found" });

    historyEntry.customer = customer || historyEntry.customer;
    historyEntry.delivered_at = delivered_at || historyEntry.delivered_at;
    historyEntry.status = status || historyEntry.status;

    await deliveryman.save();
    res.json(deliveryman);
  } catch (error) {
    res.status(400).json({ message: "Error updating delivery history", error });
  }
};

const deleteDeliveryHistory = async (req, res) => {
  try {
    const deliveryman = await Deliverymen.findById(req.body.id);

    if (!deliveryman)
      return res.status(404).json({ message: "Deliveryman not found" });

    const historyEntry = deliveryman.delivery_history.id(req.body.historyId);

    if (!historyEntry)
      return res.status(404).json({ message: "History entry not found" });

    historyEntry.remove();
    await deliveryman.save();

    res.json(deliveryman);
  } catch (error) {
    res.status(500).json({ message: "Error deleting delivery history", error });
  }
};

const resetDriverStatusAndRoutes = () => {
  cron.schedule("0 15 * * *", async () => {
    try {
      console.log(
        "Running scheduled task to reset driver statuses and routes."
      );

      await Deliverymen.updateMany({}, { status: "available" });
      console.log("All deliverymen statuses updated to 'available'.");

      await Route.updateMany({}, { driver: null });
      console.log("All routes have been reset to have no assigned driver.");
    } catch (error) {
      console.error("Error during scheduled task execution:", error);
    }
  });

  console.log(
    "Scheduled task for resetting driver statuses and routes initialized."
  );
};

module.exports = {
  getAllDeliverymen,
  getDeliverymanById,
  createDeliveryman,
  updateDeliveryman,
  deleteDeliveryman,
  addDeliveryHistory,
  updateDeliveryHistory,
  deleteDeliveryHistory,
  attendencedeliverymen,
  resetDriverStatusAndRoutes,
};
