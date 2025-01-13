const Bottle = require("../models/Bottle");

// Add new bottle details for a specific route
const addBottleDetail = async (req, res) => {
  try {
    const { route_id, bottle_detail } = req.body;

    // Find the bottle document for the given route_id
    const bottle = await Bottle.findOne({ route_id });

    if (!bottle) {
      return res
        .status(404)
        .json({ message: "Bottle document not found for the given route" });
    }

    // Add the new bottle detail to the existing bottle_details array
    bottle.bottle_details.push(bottle_detail);

    // Save the updated bottle document 
    const updatedBottle = await bottle.save();
 
    res.status(200).json(updatedBottle);
  } catch (error) {
    res.status(500).json({ message: "Error adding bottle detail", error });
  }
};

// Get bottle details by route_id
const getBottlesByRoute = async (req, res) => {
  try {
    const { route_id } = req.body;

    // Find the bottle document by route_id
    const bottles = await Bottle.find({ route_id });

    if (!bottles || bottles.length === 0) {
      return res
        .status(404)
        .json({ message: "No bottles found for the given route" });
    }

    res.status(200).json(bottles);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving bottles", error });
  }
};

// Get a specific bottle by route_id and detail_id
const getBottleDetailById = async (req, res) => {
  try {
    const { route_id, detail_id } = req.body;

    // Find the bottle document by route_id
    const bottle = await Bottle.findOne({ route_id });

    if (!bottle) {
      return res
        .status(404)
        .json({ message: "Bottle document not found for the given route" });
    }

    // Find the specific detail in the bottle_details array
    const detail = bottle.bottle_details.find(
      (detail) => detail._id.toString() === detail_id
    );

    if (!detail) {
      return res.status(404).json({ message: "Bottle detail not found" });
    }

    res.status(200).json(detail);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving bottle detail", error });
  }
};

// Update bottle details for a specific route and detail_id
const updateBottleDetail = async (req, res) => {
  try {
    const { route_id, detail_id, updated_detail } = req.body;

    // Find the bottle document for the given route_id
    const bottle = await Bottle.findOne({ route_id });

    if (!bottle) {
      return res
        .status(404)
        .json({ message: "Bottle document not found for the given route" });
    }

    // Find the index of the bottle detail in the bottle_details array
    const detailIndex = bottle.bottle_details.findIndex(
      (detail) => detail._id.toString() === detail_id
    );

    if (detailIndex === -1) {
      return res.status(404).json({ message: "Bottle detail not found" });
    }

    // Update the specific bottle detail
    bottle.bottle_details[detailIndex] = {
      ...bottle.bottle_details[detailIndex]._doc,
      ...updated_detail,
    };

    // Save the updated bottle document
    const updatedBottle = await bottle.save();

    res.status(200).json(updatedBottle);
  } catch (error) {
    res.status(500).json({ message: "Error updating bottle detail", error });
  }
};

// Delete a bottle document by route_id
const deleteBottle = async (req, res) => {
  try {
    const { route_id } = req.body;

    // Find and delete the bottle document for the given route_id
    const deletedBottle = await Bottle.findOneAndDelete({ route_id });

    if (!deletedBottle) {
      return res
        .status(404)
        .json({ message: "Bottle document not found for the given route" });
    }

    res.status(200).json({ message: "Bottle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting bottle", error });
  }
};

// Delete a specific bottle detail from a bottle document
const deleteBottleDetail = async (req, res) => {
  try {
    const { route_id, detail_id } = req.body;

    // Find the bottle document for the given route_id
    const bottle = await Bottle.findOne({ route_id });

    if (!bottle) {
      return res
        .status(404)
        .json({ message: "Bottle document not found for the given route" });
    }

    // Remove the specific detail from the bottle_details array
    bottle.bottle_details = bottle.bottle_details.filter(
      (detail) => detail._id.toString() !== detail_id
    );

    // Save the updated bottle document
    const updatedBottle = await bottle.save();

    res.status(200).json(updatedBottle);
  } catch (error) {
    res.status(500).json({ message: "Error deleting bottle detail", error });
  }
};

module.exports = {
  addBottleDetail,
  getBottlesByRoute,
  getBottleDetailById,
  updateBottleDetail,
  deleteBottle,
  deleteBottleDetail,
};
