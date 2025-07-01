const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 
const role = require('../middleware/roleMiddleware'); 
const {
  createParcel,
  getMyParcels,
  assignAgent,
  updateStatus,
  unassignParcel,
  getParcels,
  getAssignedParcels,
  updateCurrentLocation,
  getCurrentLocation,
  getDistance,
  trackParcel 
} = require('../controllers/parcelController'); 

// Customer routes
router.post('/', auth, role(['customer']), createParcel);
router.get('/my', auth, role(['customer']), getMyParcels);
router.get('/:id/location', auth, role(['customer', 'agent', 'admin']), getCurrentLocation); 
// Admin routes
router.patch('/assign', auth, role(['admin']), assignAgent);
router.patch('/unassign', auth, role(['admin']), unassignParcel);
router.get('/all-parcels', auth, role(['admin', 'agent']), getParcels); 
router.get('/assigned', auth, role(['admin', 'agent']), getAssignedParcels); 

// Agent routes
router.patch('/:id/status', auth, role(['agent', 'admin']), updateStatus);
router.patch('/location', auth, role(['agent']), updateCurrentLocation);

router.post('/distance', auth, role(['customer', 'admin']), getDistance); 


router.get('/track/:trackingNumber', trackParcel);


module.exports = router;
