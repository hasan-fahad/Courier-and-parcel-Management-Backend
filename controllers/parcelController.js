const Parcel = require("../models/Parcel");
const axios = require("axios");

const generateTrackingNumber = () => {
  const prefix = "EXCEL-COURIER";
  const randomPart = Math.random().toString(36).substring(2, 12).toUpperCase();
  return `${prefix}-${randomPart}`;
};

exports.createParcel = async (req, res) => {
  const {
    pickupAddress,
    deliveryAddress,
    coordinates,
    parcelType,
    paymentType,
    parcelSize,
  } = req.body;

  try {
    const newTrackingNumber = generateTrackingNumber();

    const parcel = await Parcel.create({
      customerId: req.user.id,
      trackingNumber: newTrackingNumber,
      pickupAddress,
      deliveryAddress,
      coordinates,
      parcelType,
      paymentType,
      status: "Booked",
      parcelSize,
      currentLocation: coordinates?.pickup,

      trackingEvents: [
        {
          status: "Booked",
          location: coordinates?.pickup,
          timestamp: new Date(),
          dispatchId: null,
        },
      ],
    });
    res.status(201).json(parcel);
  } catch (err) {
    console.error("Error creating parcel:", err);
    res
      .status(500)
      .json({ message: "Parcel creation failed", error: err.message });
  }
};

exports.assignAgent = async (req, res) => {
  const { parcelId, agentId } = req.body;
  try {
    const parcel = await Parcel.findByIdAndUpdate(
      parcelId,
      { agentId, status: "Picked Up" },
      { new: true }
    ).populate("agentId", "name email");

    if (!parcel) return res.status(404).json({ message: "Parcel not found" });

    parcel.trackingEvents.push({
      status: "Picked Up",
      location: parcel.currentLocation || parcel.coordinates?.pickup,
      timestamp: new Date(),
      dispatchId: null,
    });
    await parcel.save();

    res.json(parcel);
  } catch (err) {
    console.error("Error assigning agent:", err);
    res
      .status(500)
      .json({ message: "Failed to assign agent", error: err.message });
  }
};

exports.getAssignedParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ agentId: { $ne: null } })
      .populate("agentId", "name email")
      .sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) {
    console.error("Error getting assigned parcels:", err);
    res
      .status(500)
      .json({ message: "Failed to get assigned parcels", error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, eventLocation, dispatchId } = req.body;

  const userRole = req.user.role;
  console.log("UpdateStatus called by role:", userRole, "with status:", status);

  const allowedAgentStatuses = [
    "Collected By Agent",
    "Delivered",
    "Failed",
    "Return",
  ];

  if (userRole === "agent" && !allowedAgentStatuses.includes(status)) {
    console.log("Forbidden status update attempt by agent.");
    return res.status(403).json({ message: "Not allowed to set this status." });
  }

  try {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    parcel.status = status;

    const eventLoc =
      eventLocation ||
      parcel.currentLocation ||
      parcel.coordinates?.current ||
      parcel.coordinates?.pickup;

    parcel.trackingEvents.push({
      status: status,
      location: eventLoc,
      dispatchId: dispatchId,
      timestamp: new Date(),
    });

    await parcel.save();
    res.json({
      message: "Parcel status and tracking event updated successfully",
      parcel,
    });
  } catch (error) {
    console.error("Error updating parcel status:", error);
    res.status(500).json({
      message: "Failed to update parcel status",
      error: error.message,
    });
  }
};

exports.unassignParcel = async (req, res) => {
  const { parcelId } = req.body;

  if (!parcelId) {
    return res.status(400).json({ message: "parcelId is required" });
  }

  try {
    const parcel = await Parcel.findByIdAndUpdate(
      parcelId,
      { agentId: null, status: "Booked" },
      { new: true }
    );

    if (!parcel) return res.status(404).json({ message: "Parcel not found" });

    parcel.trackingEvents.push({
      status: "Unassigned",
      location: parcel.currentLocation || parcel.coordinates?.current,
      timestamp: new Date(),
      dispatchId: null,
    });
    await parcel.save();

    res.json({ message: "Parcel unassigned successfully", parcel });
  } catch (err) {
    console.error("Error unassigning parcel:", err);
    res
      .status(500)
      .json({ message: "Failed to unassign parcel", error: err.message });
  }
};

exports.getMyParcels = async (req, res) => {
  try {
    console.log("Fetching parcels for user:", req.user.id);
    const parcels = await Parcel.find({ customerId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(parcels);
  } catch (err) {
    console.error("Error getting user's parcels:", err);
    res
      .status(500)
      .json({ message: "Failed to get your parcels", error: err.message });
  }
};

exports.getParcels = async (req, res) => {
  const assigned = req.query.assigned;

  let filter = {};

  if (assigned === "true") {
    filter.agentId = { $ne: null };
  } else if (assigned === "false") {
    filter.agentId = null;
  }

  try {
    const parcels = await Parcel.find(filter)
      .populate("agentId", "name email")
      .sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) {
    console.error("Error getting all parcels:", err);
    res
      .status(500)
      .json({ message: "Failed to get parcels", error: err.message });
  }
};

exports.updateCurrentLocation = async (req, res) => {
  const { parcelId, lat, lng } = req.body;

  if (!parcelId || !lat || !lng) {
    return res
      .status(400)
      .json({ message: "parcelId, lat and lng are required" });
  }

  try {
    const parcel = await Parcel.findByIdAndUpdate(
      parcelId,
      { currentLocation: { lat, lng }, "coordinates.current": { lat, lng } },
      { new: true }
    );

    if (!parcel) return res.status(404).json({ message: "Parcel not found" });

    res.json(parcel);
  } catch (err) {
    console.error("Error updating current location:", err);
    res
      .status(500)
      .json({ message: "Failed to update location", error: err.message });
  }
};

exports.getCurrentLocation = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.json({
      currentLocation: parcel.coordinates.current,
      status: parcel.status,
      updatedAt: parcel.updatedAt,
    });
  } catch (err) {
    console.error("Error getting current location:", err);
    res.status(500).json({ message: "Tracking failed", error: err.message });
  }
};

exports.getDistance = async (req, res) => {
  const { pickupAddress, deliveryAddress } = req.body;

  if (!pickupAddress || !deliveryAddress) {
    return res
      .status(400)
      .json({ message: "pickupAddress and deliveryAddress are required" });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        pickupAddress
      )}&destinations=${encodeURIComponent(deliveryAddress)}&key=${
        process.env.GOOGLE_MAPS_API_KEY
      }`
    );

    if (
      response.data.status !== "OK" ||
      response.data.rows[0].elements[0].status !== "OK"
    ) {
      return res.status(500).json({
        message: "Failed to get distance from Google Maps API",
        details: response.data.error_message || "Unknown error",
      });
    }

    const distance = response.data.rows[0].elements[0].distance.text;
    res.json({ distance });
  } catch (err) {
    console.error("Error calculating distance:", err);
    res
      .status(500)
      .json({ message: "Failed to calculate distance", error: err.message });
  }
};

const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    console.log("Geocode URL:", url);

    const response = await axios.get(url);
    console.log("Geocode Response:", response.data);

    if (
      response.data.status === "OK" &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      return response.data.results[0].formatted_address;
    } else {
      return "Unknown Location";
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return "Location unavailable";
  }
};
exports.trackParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({
      trackingNumber: req.params.trackingNumber,
    });

    if (!parcel) {
      return res.status(404).json({
        message: "Parcel not found with this tracking number.",
      });
    }

    const updatedEvents = await Promise.all(
      parcel.trackingEvents.map(async (event) => {
        let locationName = "Unknown";

        if (event.location?.lat && event.location?.lng) {
          locationName = await getAddressFromCoordinates(
            event.location.lat,
            event.location.lng
          );
        }

        return {
          ...event._doc,
          locationName,
        };
      })
    );

    res.json({
      trackingNumber: parcel.trackingNumber,
      currentStatus: parcel.status,
      pickupAddress: parcel.pickupAddress,
      deliveryAddress: parcel.deliveryAddress,
      lastUpdated: parcel.updatedAt,
      events: updatedEvents.sort((a, b) => b.timestamp - a.timestamp),
    });
  } catch (error) {
    console.error("Error tracking parcel by number:", error);
    res.status(500).json({ message: error.message });
  }
};
