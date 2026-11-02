const router = require('express').Router();
const multer  = require('multer');

const authMiddleWare = require('../../middleware/admin/auth.middleware.js');
const categoryController = require('../../controllers/admin/category.controller');
const cloudinaryHelpers = require('../../helpers/cloudinary.helper');
const categoryCreateValidate = require('../../validates/admin/categoryCreate.validate.js');
const upload = multer({ storage: cloudinaryHelpers.storage });

router.get('/list',authMiddleWare.requireAuth('category-view'),categoryController.list);
router.get('/create',authMiddleWare.requireAuth('category-create'),categoryController.create);
router.get('/trash',authMiddleWare.requireAuth('category-delete'),categoryController.trash);
//  lưu ý : nếu có dữ liệu file thì phải trung gian qua thư viện  multer
// nếu không thì sẽ req.body sẽ undefine !!!
router.post('/create',authMiddleWare.requireAuth('category-create'),upload.single('avatar'),categoryCreateValidate,categoryController.createPost);
// lấy tham số động đưa vào params (object) của req, tự động lấy tất cả phía sau /post/ thành id cho tới / ở sau
// ':' là có nghĩa lấy hết
router.get('/edit/:id',authMiddleWare.requireAuth('category-edit'),categoryController.edit);
router.patch('/delete/:id',authMiddleWare.requireAuth('category-delete'),categoryController.deletePatch);
router.patch('/edit/:id',authMiddleWare.requireAuth('category-edit'),upload.single('avatar'),categoryCreateValidate,categoryController.editPatch);
router.patch('/change-multi',categoryController.applyOptionPatch);
router.patch('/undo/:id',authMiddleWare.requireAuth('category-delete'),categoryController.categoryUndo);
router.patch('/delete-destroy/:id',authMiddleWare.requireAuth('category-delete'),categoryController.deleteDestroy);
router.patch('/trash/change-multi',authMiddleWare.requireAuth('category-delete'),categoryController.categoryTrashChangeMulti);


module.exports = router;