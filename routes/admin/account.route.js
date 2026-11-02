const router = require('express').Router();
const accountController = require('../../controllers/admin/account.controller.js');
const registerValidate = require('../../validates/admin/register.validate.js');
const loginValidate = require('../../validates/admin/login.validate.js');
const passwordValidate = require('../../validates/admin/password.validate.js');
const emailValidate = require('../../validates/admin/email.validate.js');
const emailOptValidate = require('../../validates/admin/emailOtp.validate.js');
const authMiddleware = require('../../middleware/admin/auth.middleware.js');


router.get('/login',accountController.login);
router.get('/register',accountController.register);
router.get('/register-initial',accountController.registerInitial);
router.get('/forgot-password',accountController.forgotPassword);
router.get('/otp-password',accountController.otpPassword);
router.get('/reset-password',authMiddleware.verifyToken,accountController.resetPassword);

// nếu req theo POST thì bắt riêng
// trung gian qua ham validate de kiem tra du lieu vao co chuyen khong
router.post('/register',registerValidate,accountController.registerPost);
router.post('/login',loginValidate,accountController.loginPost);
router.post('/logout',accountController.logoutPost);
router.post('/forgot-password',emailValidate,accountController.forgotPasswordPost);
router.post('/otp-password',emailOptValidate,accountController.otpPasswordPost);
router.post('/reset-password',authMiddleware.verifyToken,passwordValidate,accountController.resetPasswordPost);


module.exports = router;