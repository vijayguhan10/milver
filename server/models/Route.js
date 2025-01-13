const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const routeSchema = new mongoose.Schema({
  route_id: {
    type: Number,
    unique: true,
  },
  route_name: {
    type: String,
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  customers: {
    type: [mongoose.Schema.ObjectId],
    ref: "Customer",
    default: [],
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: "Deliverymen",
    default: null,
  },
  distance: {
    type: Number,
    required: true,
  },
  delivery_history: {
    type: [
      {
        driver: {
          type: mongoose.Schema.ObjectId,
          ref: "Deliverymen",
          default: null,  
        },
        assigned_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
  fuelamount: { 
    type: Number,
    default: 0,
  },
  todaysAmount:{
    type:Number,
    default:0
  },
 
});

routeSchema.plugin(AutoIncrement, { inc_field: "route_id" });

const Route = mongoose.model("Route", routeSchema);

module.exports = Route;
