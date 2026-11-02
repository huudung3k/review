const router = require('express').Router();

const dashboardController = require('../../controllers/admin/dashboard.controller');
const authMiddleWare = require('../../middleware/admin/auth.middleware.js');

router.get('/',authMiddleWare.requireAuth('dashboard-view'),dashboardController.dashboard);

module.exports = router;