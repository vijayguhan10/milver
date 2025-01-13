const Customer = require("../models/Customer");
const Route = require("../models/Route");
const DEFAULT_LOCATION = { latitude: 0, longitude: 0 };

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();

    const transformedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const route = await Route.findById(customer.route_id);
  
        return {
          ...customer.toObject(),
          route_id: route ? route.route_id : null,
          route_name: route ? route.route_name : null,
        };
      })
    );
 
    res.json(transformedCustomers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.body.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error });
  }
};

const createCustomer = async (req, res) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      phone,
      deliverytime,
      route_id,
    } = req.body;

    if (
      !name ||
      !address ||
      !phone ||
      !deliverytime ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const route = await Route.findOne({ route_id });
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    const customer = new Customer({
      name,
      address,
      location,
      latitude,
      longitude,
      phone,
      deliverytime,
      route_id: route._id,
    });

    const savedCustomer = await customer.save();

    route.customers = route.customers || [];
    route.customers.push(savedCustomer._id);
    await route.save();

    res
      .status(201)
      .json({ message: "Customer created", customer: savedCustomer });
  } catch (error) {
    console.error("Error in createCustomer:", error.message);
    res.status(500).json({
      message: "Error creating customer",
      error: error.message,
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id, name, address, location, phone, deliverytime, route_id } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    if (!name || !address || !phone || !deliverytime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { latitude, longitude } = location || {};
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (route_id && customer.route_id.toString() !== route_id.toString()) {
      const newRoute = await Route.findOne({ route_id });
      if (!newRoute) {
        return res.status(404).json({ message: "New route not found" });
      }

      if (customer.route_id) {
        const oldRoute = await Route.findById(customer.route_id);
        if (oldRoute) {
          oldRoute.customers = oldRoute.customers.filter(
            (custId) => String(custId) !== String(customer._id)
          );
          await oldRoute.save();
        }
      }

      newRoute.customers = newRoute.customers || [];
      newRoute.customers.push(customer._id);
      await newRoute.save();

      customer.route_id = newRoute._id;
    }

    customer.name = name;
    customer.address = address;
    customer.latitude = latitude;
    customer.longitude = longitude;
    customer.phone = phone;
    customer.deliverytime = deliverytime;

    const updatedCustomer = await customer.save();

    res.status(200).json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error in updateCustomer:", error.message);
    res.status(500).json({
      message: "Error updating customer",
      error: error.message,
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (customer.route_id) {
      const route = await Route.findById(customer.route_id);
      if (route) {
        route.customers = route.customers.filter(
          (custId) => String(custId) !== String(customer._id)
        );
        await route.save();
      }
    }

    await Customer.findByIdAndDelete(id);

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting customer", error: error.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
