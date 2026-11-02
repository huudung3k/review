const router = require('express').Router();
const multer  = require('multer');
const cloudinaryHelpers = require('../../helpers/cloudinary.helper');
const upload = multer({ storage: cloudinaryHelpers.storage });
const tourValidate = require('../../validates/admin/tourCreate.validate');
const authMiddleWare = require('../../middleware/admin/auth.middleware.js');
const tourController = require('../../controllers/admin/tour.controller');

router.get('/list',authMiddleWare.requireAuth('tour-view'),tourController.list);
router.get('/edit/:id',authMiddleWare.requireAuth('tour-edit'),tourController.edit);
router.patch('/edit/:id',authMiddleWare.requireAuth('tour-edit'),upload.single('avatar'),tourValidate.createPost,tourController.editPatch);
router.get('/create',authMiddleWare.requireAuth('tour-create'),tourController.create);
router.post('/create',authMiddleWare.requireAuth('tour-create'),upload.single('avatar'),tourValidate.createPost,tourController.createPost);
router.get('/trash',authMiddleWare.requireAuth('tour-delete'), tourController.trash);
router.patch('/delete/:id',authMiddleWare.requireAuth('tour-delete'), tourController.deletePatch);
router.patch('/change-multi',tourController.changeMultiPatch);
router.patch('/change-multi-trash',authMiddleWare.requireAuth('tour-delete'), tourController.changeMultiTrashPatch);
router.patch('/undo/:id',authMiddleWare.requireAuth('tour-delete'), tourController.undoPatch);
router.patch('/delete-destroy/:id',authMiddleWare.requireAuth('tour-delete'),tourController.deleteDestroyPatch);

module.exports = router;