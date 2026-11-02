const router = require('express').Router();
const accountRoute = require('./account.route');
const dashboardRoute = require('./dashboard.route');
const categoryRoute = require('./category.route');
const tourRoute = require('./tour.route');
const orderRoute = require('./order.route');
const userRoute = require('./user.route');
const contactRoute = require('./contact.route');
const settingRoute = require('./setting.route');
const profileRoute = require('./profile.route');
const authMiddleware = require('../../middleware/admin/auth.middleware');


// giúp không lưu giao diện vào bộ nhớ đệm tránh TH khi logout mà ấn mũi tên quay lại sẽ load được giao 
// mục đích của bộ nhớ đệm sẽ giúp load  nhanh hơn
router.use((req,res,next) => {
  res.setHeader('Cache-Control','no-store');
  next();
})


router.use('/account',accountRoute);
router.use('/dashboard',authMiddleware.verifyToken,dashboardRoute);
router.use('/category',authMiddleware.verifyToken,categoryRoute);
router.use('/tour',authMiddleware.verifyToken,tourRoute);
router.use('/order',authMiddleware.verifyToken,orderRoute);
router.use('/user',authMiddleware.verifyToken,userRoute);
router.use('/contact',authMiddleware.verifyToken,contactRoute);
router.use('/setting',authMiddleware.verifyToken,settingRoute);
router.use('/profile',authMiddleware.verifyToken,profileRoute);

router.use( (req,res) => {
  res.render('admin/pages/error-404.pug',{
    pageTitle : "Not found"
  })
});

module.exports = router;