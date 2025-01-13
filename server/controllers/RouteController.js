const Route = require("../models/Route");
const Deliverymen = require("../models/Deliverymen");

const getAllRoutes = async (req, res) => {
  console.log("Fetching all routes...");
  try {
    const routes = await Route.find().populate("customers").populate("driver");

    res.json(routes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ message: "Error fetching routes", error });
  }
};

const getRouteById = async (req, res) => {
  try {
    const { route_id } = req.body;
    const route = await Route.findOne({ route_id })
      .populate("customers")
      .populate("drivers");

    if (!route) return res.status(404).json({ message: "Route not found" });

    res.json(route);
  } catch (error) {
    res.status(500).json({ message: "Error fetching route", error });
  }
};

const confirmAndSaveAssignments = async (req, res) => {
  try {
    const { shuffledAssignments } = req.body;

    for (const assignment of shuffledAssignments) {
      await Route.findByIdAndUpdate(assignment.route, {
        driver: assignment.driver,
      });
      await Deliverymen.findByIdAndUpdate(assignment.driver, {
        status: "assigned",
      });
    }

    res.status(200).json({
      message: "Deliverymen successfully assigned to routes.",
    });
  } catch (error) {
    console.error("Error in confirmAndSaveAssignments:", error);
    res.status(500).json({
      message: "Error in confirming assignments",
      error: error.message,
    });
  }
};

const assignDeliverymenManual = async (req, res) => {
  try {
    const { driver_objid, route_objid } = req.body;

    const route = await Route.findById(route_objid);
    const driver = await Deliverymen.findById(driver_objid);

    if (!route || !driver) {
      return res.status(404).json({ message: "Route or driver not found" });
    }

    route.driver = driver._id;

    driver.status = "assigned";
    await driver.save();

    route.delivery_history.push({
      driver: driver._id,
      assigned_at: Date.now(),
    });

    await route.save();

    res.json(route);
  } catch (error) {
    res.status(500).json({ message: "Error assigning driver", error });
  }
};

const createRoute = async (req, res) => {
  try {
    const {
      route_name,
      customers,
      drivers,
      distance,
      location,
      defaultAmount,
    } = req.body;

    const newRoute = new Route({
      route_name,
      customers,
      drivers,
      distance,
      location,
      defaultAmount,
    });

    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (error) {
    res.status(400).json({ message: "Error creating route", error });
  }
};

const updateRoute = async (req, res) => {
  try {
    const {
      route_id,
      route_name,
      customers,
      drivers,
      distance,
      location,
      defaultAmount,
    } = req.body;

    const route = await Route.findOne({ route_id });

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    if (route_name) route.route_name = route_name;
    if (customers) route.customers = customers;
    if (drivers) route.drivers = drivers;
    if (distance) route.distance = distance;
    if (location) {
      if (location.latitude) route.location.latitude = location.latitude;
      if (location.longitude) route.location.longitude = location.longitude;
    }
    if (defaultAmount) {
      route.defaultAmount = defaultAmount;
    }

    await route.save();

    const updatedRoute = await route.populate("customers").populate("drivers");
    res.json(updatedRoute);
  } catch (error) {
    res.status(400).json({ message: "Error updating route", error });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const { route_id } = req.body;

    const route = await Route.findOne({ route_id });

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    await route.delete();

    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting route", error });
  }
};

const removeDeliverymanFromRoute = async (req, res) => {
  try {
    const { deliveryman_id } = req.body;
    const { route_id } = req.body;

    const route = await Route.findOne({ route_id });

    if (!route) return res.status(404).json({ message: "Route not found" });

    if (route.drivers.includes(deliveryman_id)) {
      route.drivers.pull(deliveryman_id);
      await route.save();
      res.json(route);
    } else {
      res.status(400).json({ message: "Deliveryman not found in this route" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing deliveryman from route", error });
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  removeDeliverymanFromRoute,
  assignDeliverymenManual,
  confirmAndSaveAssignments,
};
