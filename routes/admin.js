const express = require("express");
const router = express.Router();
const Parcel = require("../models/Parcel");
const moment = require("moment");
const verifyToken = require("../middleware/authMiddleware");
const { Parser } = require('json2csv'); 
const PDFDocument = require('pdfkit');

const { updateCurrentLocation, getCurrentLocation,getDistance } = require("../controllers/parcelController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/metrics", verifyToken, async (req, res) => {
  try {
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();


    const dailyBookings = await Parcel.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const failedDeliveries = await Parcel.countDocuments({
      status: "Failed",
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

  
    const codParcels = await Parcel.find({
      paymentType: "COD",
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const codAmount = codParcels.reduce((sum, parcel) => {
    
      return sum + (parcel.codAmount || 0);
    }, 0);

    res.json({ dailyBookings, failedDeliveries, codAmount });
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/export/pdf", verifyToken, async (req, res) => {
  try {
    const parcels = await Parcel.find().lean();

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Parcel Report", { align: "center" });
    doc.moveDown();

    parcels.forEach((p, i) => {
      doc.fontSize(12).text(
        `${i + 1}. Pickup: ${p.pickupAddress} | Delivery: ${p.deliveryAddress} | Status: ${p.status} | Payment: ${p.paymentType} | Date: ${moment(p.createdAt).format("YYYY-MM-DD")}`
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error("PDF export error:", error);
    res.status(500).json({ message: "Failed to export PDF" });
  }
});

router.get("/export/csv", verifyToken, async (req, res) => {
  try {
    const parcels = await Parcel.find().lean();

    const fields = [
      "pickupAddress",
      "deliveryAddress",
      "status",
      "paymentType",
      "createdAt",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(parcels);

    res.header("Content-Type", "text/csv");
    res.attachment("report.csv");
    return res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    res.status(500).json({ message: "Failed to export CSV" });
  }
});

router.patch('/update-location', auth, role(['agent']), updateCurrentLocation);
router.get('/location/:parcelId', auth, role(['customer', 'agent', 'admin']), getCurrentLocation);
router.post('/distance', auth, role(['customer', 'agent', 'admin']), getDistance);

module.exports = router;
