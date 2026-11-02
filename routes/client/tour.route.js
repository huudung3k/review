
const router = require('express').Router();
// router thay cho app ở index.js, tương tụ như app

const tourController = require('../../controllers/client/tour.controller');


router.get('/',tourController.list);
router.get('/detail',tourController.detail);

module.exports = router;