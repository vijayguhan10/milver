const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const CustomerSchema = new Schema({
  customer_id: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  phone: {
    type: String, 
    required: true,
  },
  route_id: {
    type: mongoose.Schema.ObjectId, 
    ref: "Route",
    default: null,
  },
  deliverytime: {
    type: String,
    required: true,
  },
  history: {
    type: [
      {
        deliveryman_id: {
          type: Number,
          required: true,
        },
        delivery_status: {
          type: String,
          enum: ["delivered", "failed", "returned"],
          default: "delivered",
        },
        delivery_datetime: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
});

CustomerSchema.plugin(AutoIncrement, { inc_field: "customer_id" });

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
  