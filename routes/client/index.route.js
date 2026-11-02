// index.route là file tổng chứa các đường dẫn cấp 1
// điều phối các route để tránh phải nhúng hết vào file index
// bên index.js chỉ cần nhúng file index.route là được thay vì phải nhúng hết tất cả
// --------- file này là file trung, để phân phối , ,
const router = require('express').Router();
const tourRoute = require('./tour.route');
const homeRoute = require('./home.route');
const cartRoute = require('./cart.route');

// sử dụng use để không cần biết method gì vẫn có thể tru cập vào home được
// nếu sử dụng get thì phải viết thêm code cho method post,delete,...

router.use('/',homeRoute);

router.use('/tours',tourRoute);
router.use('/cart',cartRoute);

//file cha thì use  chứ không sử dụng method get để truy cập được

module.exports = router