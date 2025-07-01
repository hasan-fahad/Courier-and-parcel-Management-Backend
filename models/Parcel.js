const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: function () {
        const prefix = "EXCEL-COURIER";
        const randomPart = Math.random()
          .toString(36)
          .substring(2, 12)
          .toUpperCase();
        return `${prefix}-${randomPart}`;
      },
    },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    coordinates: {
      pickup: { lat: Number, lng: Number },
      delivery: { lat: Number, lng: Number },
      current: { lat: Number, lng: Number },
    },
    parcelType: { type: String, required: true },
    paymentType: { type: String, enum: ["COD", "Prepaid"], required: true },
    status: {
      type: String,
      enum: [
        "Booked",
        "Picked Up",
        "Sent To Warehouse",
        "Warehouse Received",
        "In Transit",
        "Hub Received",
        "Agent Assigned",
        "Collected By Agent",
        "Delivered",
        "Failed",
        "Return",
      ],
      default: "Booked",
    },
    parcelSize: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      default: "Medium",
    },

    currentLocation: {
      lat: Number,
      lng: Number,
    },

    trackingEvents: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        location: {
          lat: Number,
          lng: Number,
        },
        dispatchId: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parcel", parcelSchema);
