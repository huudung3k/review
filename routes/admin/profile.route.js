const router = require('express').Router();
const profileController = require('../../controllers/admin/profile.controller');
const multer = require('multer');
const cloudinaryHelpers = require('../../helpers/cloudinary.helper');
const upload = multer({ storage: cloudinaryHelpers.storage });

router.get('/edit',profileController.profileEdit);
router.patch('/edit',upload.single('avatar'),profileController.profileEditPatch);
router.get('/change-password',profileController.changePassword);
router.patch('/change-password',profileController.changePasswordPatch);

module.exports = router;