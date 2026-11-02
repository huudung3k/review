const categoryTreeHelper = require('../../helpers/categoryTree.helper');
const categoryModel = require('../../models/category.model');
const accountAdminModel = require('../../models/account-admin.model');
const tourModel = require('../../models/tour.model');
const cityModel =require('../../models/cities.model');
const moment = require('moment');
const slugify = require('slugify');

module.exports.list = async (req,res) => {
  const tourFilter = {
    deleted : false
  };
  const createdAt = {};
  const priceNewAdult = {};
  if(req.query.status){
    tourFilter.status = req.query.status;
  }
  if(req.query.createdBy){
    tourFilter.createdBy = req.query.createdBy
  }
  if(req.query.category){
    tourFilter.category = req.query.category;
  }
  if(req.query.startDate){
    createdAt.$gte = req.query.startDate;
  }
  if(req.query.endDate){
    createdAt.$lte = req.query.endDate;
  }
  if(Object.keys(createdAt).length > 0){
    tourFilter.createdAt = createdAt;
  }
  if(req.query.price){
    const priceSplit = req.query.price.split("-");
    const minPrice = priceSplit[0];
    const maxPrice = priceSplit[1];
    if(minPrice){
      priceNewAdult.$gte = minPrice
    }
    if(maxPrice){
      priceNewAdult.$lte = maxPrice
    }
  }
  if(Object.keys(priceNewAdult).length > 0){
    tourFilter.priceNewAdult = priceNewAdult;
  }

  if(req.query.keyword){
    const keyWordFormat = slugify(req.query.keyword,{lower : true});
    tourFilter.slug = new RegExp(keyWordFormat);
  }
  const limitRecord = process.env.LIMIT_PAGE_LIST;
  const totalRecord = await tourModel.countDocuments(tourFilter);
  const limitPage = Math.ceil(totalRecord/limitRecord);
  let page = 1;
  if(req.query.page){
    const pageParseInt = parseInt(req.query.page);
    if(pageParseInt > 0){
      page = pageParseInt;
    }
    if(page > limitPage && limitPage > 0){
      page = limitPage
    }
  }
  const skip = (page - 1) * limitRecord;
  const pagination = {
    totalRecord,
    limitPage,
    skip
  }
  const tourList = await tourModel.find(tourFilter).limit(limitRecord).skip(skip);
  for(const item of tourList){
    const createdByFullName = await accountAdminModel.findOne({_id : item.createdBy});
    if(createdByFullName){
      item.createdByFullName = createdByFullName.fullName;
    }
    else{
      item.createdByFullName = "";
    }
    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
  }
  for(const item of tourList){
    const updatedByFullName = await accountAdminModel.findOne({_id : item.updatedBy});
    if(updatedByFullName){
      item.updatedByFullName = updatedByFullName.fullName;
    }
    else{
      item.updatedByFullName = "";
    }
    item.updatedAtFormat = moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');
  }
  const accountAdminList = await accountAdminModel.find({}).select('fullName');
  const categoryList = await categoryModel.find({deleted : false});
  const categoryTree = categoryTreeHelper.categoryTree(categoryList);
  res.render('admin/pages/tour-list.pug',{
    pageTitle : "Tour list",
    tourList : tourList,
    accountAdminList :accountAdminList,
    categoryTree : categoryTree,
    pagination : pagination
  })
}
module.exports.changeMultiPatch = async (req,res) => {
  try{
    const {ids,option} = req.body;
    switch(option){
      case "active" :
      case "inactive":
          if(!req.roleDetail.permissions.includes('tour-edit')){
            res.json({
              code : "error",
              message : "Tài khoảng không có quyền truy cập !"
            });
            return;
          }
        await tourModel.updateMany({_id :{ $in : ids },deleted : false},{status : option});
        req.flash('success',"Cập nhật thành công");
        res.json({code: "success"});
        break;
      case "delete" :
        if(!req.roleDetail.permissions.includes('tour-delete')){
          res.json({
            code : "error",
            message : "Tài khoảng không có quyền truy cập !"
          });
          return;
        } 
        await tourModel.updateMany({_id :{ $in : ids },deleted : false},{deleted : true, deletedBy : req.account.id, deletedAt : Date.now()});
        req.flash('success',"Đã chuyển vào thùng rác ");
        res.json({code: "success"});
        break;
      default : 
        res.json({code : "error",message : "Hành động không tồn tại"});
        break;
      }

  }catch(error){
    res.json({
      code : "error",
      message : "Bản ghi không tồn tại !"
    })
  }
}
module.exports.changeMultiTrashPatch = async (req,res) => {
  try{
    const {ids,option} = req.body;
    switch(option){
      case "undo":
        await tourModel.updateMany({_id :{ $in : ids },deleted : true},{deleted : false});
        req.flash('success',"khôi phục thành công");
        res.json({code: "success"});
        break;
      case "delete-destroy" : 
        await tourModel.deleteMany({_id :{ $in : ids },deleted : true});
        req.flash('success',"Xóa thành công");
        res.json({code: "success"});
        break;
      default : 
        res.json({code : "error",message : "Hành động không tồn tại"});
        break;
      }

  }catch(error){
    res.json({
      code : "error",
      message : "Bản ghi không tồn tại !"
    })
  }
}
module.exports.edit = async (req,res) => {
  const id = req.params.id;
  const tourDetail = await tourModel.findOne({_id : id,deleted : false});
  // type Date của HTML  chỉ chấp nhận value có format YYYY-MM-DD
  // Date cảu 
  tourDetail.departureDateFormat = moment(tourDetail.departureDate).format('YYYY-MM-DD'); 
  const cityList = await cityModel.find({});
  const categoryList = await categoryModel.find({deleted : false});
  const categoryTree = categoryTreeHelper.categoryTree(categoryList);
  res.render('admin/pages/tour-edit.pug',{
    pageTitle : "Tour edit",
    categoryTree : categoryTree,
    cityList : cityList,
    tourDetail : tourDetail

  })
}
module.exports.editPatch = async (req,res) => {
  try{
    const id = req.params.id;
    if(req.body.position){
      req.body.position = parseInt(req.body.position);
    }
    else{
      const totalRecord = tourModel.countDocuments({});
      req.body.position = totalRecord + 1;
    }
    if(req.file){
      req.body.avatar = req.file.path;
    }
    else{
      delete req.body.avatar;
    }
    req.body.updatedBy = req.account.id;
    req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
    req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : 0;
    req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : 0;
    req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : 0;
    req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
    req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
    // phải chuyển về js vì bên frontend chuyển thành json để gửi qua backend, nếu không chuyển thì location,.. sẽ là 1 chuỗi : '["a","b","c"]'
    // nếu không chuyển thành js thì khi lưu vào DB  là mảng chỉ có duy nhất 1 phần tử là '["a","b","c"]' (là 1 chuỗi);
    req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
    req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];
    await tourModel.updateOne({_id : id, deleted : false},req.body);
    req.flash('success',"Cập nhập thành công");
    res.json({
      code : "success"
    })
  } catch(error){
    res.json({
      code : "error",
      message : "Bản ghi không tồn tại"
    })
    res.redirect(`/${pathAdmin}/tour/list`);
  }
}
module.exports.create = async (req,res) => {
  const categoryList = await  categoryModel.find({deleted : false});
  const  cityList = await cityModel.find({});
  categoryTree = categoryTreeHelper.categoryTree(categoryList);
  res.render('admin/pages/tour-create.pug',{
    pageTitle : "Tour create",
    categoryTree : categoryTree,
    cityList : cityList
  })
}
module.exports.createPost = async (req,res) => {
  if(req.body.position){
    req.body.position = parseInt(req.body.position);
  }
  else{
    const totalRecord = await tourModel.countDocuments({});
    req.body.position = totalRecord + 1;
  }
  req.body.avatar = req.file ? req.file.path : "";
  //nếu có departureDate thì đưa về định dạng chuẩn
  req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
  req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
  req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
  req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : 0;
  req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : 0;
  req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : 0;
  req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
  req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
  req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
  // phải chuyển về js vì bên frontend chuyển thành json để gửi qua backend, nếu không chuyển thì location,.. sẽ là 1 chuỗi : '["a","b","c"]'
  // nếu không chuyển thành js thì khi lưu vào DB  là mảng chỉ có duy nhất 1 phần tử là '["a","b","c"]' (là 1 chuỗi);
  req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
  req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];
  // tạo 1 bảng ghi mới với tham số là 1 object chứa các trường
  // cấp bộ nhớ heap cho newrecord chứa dữ liệu trả về
  // newrecord kế thừa tất cả từ class tourModel 
  const newRecord = new tourModel(req.body);
  await newRecord.save();
  req.flash('success','Tạo tour thành công');
  res.json({
    code : "success"
  });
}
module.exports.trash = async (req,res) => {
  const tourFilter = {
    deleted : true
  }
  if(req.query.keyword){
    const keyWordFormat = slugify(req.query.keyword,{lower : true});
    tourFilter.slug = new RegExp(keyWordFormat);
  }
  const limitRecord = process.env.LIMIT_PAGE_LIST;
  const totalRecord = await tourModel.countDocuments(tourFilter);
  const limitPage = Math.ceil(totalRecord / limitRecord);
  let page = 1;
  if(req.query.page){
    const pageParseInt = parseInt(req.query.page);
    if(pageParseInt > 0){
      page = pageParseInt;
    }
    if(page > limitPage && limitPage > 0){
      page = limitPage;
    }
  }
  const skip = (page - 1) * limitRecord;
  const pagination = {
    totalRecord,
    skip,
    limitPage
  }
  const tourListTrash = await tourModel.find(tourFilter).limit(limitRecord).skip(skip); 
  for(const item of tourListTrash){
    const createdByFullName = await accountAdminModel.findOne({_id : item.createdBy});
    item.createdByFullName = createdByFullName.fullName;
    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
  }
  for(const item of tourListTrash){
    const updatedByFullName = await accountAdminModel.findOne({_id : item.updatedBy});
    item.updatedByFullName = updatedByFullName.fullName;
    item.updatedAtFormat = moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');
  }
  res.render('admin/pages/tour-trash.pug',{
    pageTitle : "Tour trash",
    tourListTrash : tourListTrash,
    pagination : pagination
  })
}

  module.exports.deletePatch = async (req,res) => {
    try{
      const id = req.params.id;
      await tourModel.updateOne({_id : id, deleted : false},{deleted : true,deletedAt : Date.now() , deletedBy : req.account.id});
      req.flash('success','Đã chuyển danh mục vào thùng rác');
      res.json({
        code : "success"
      })
    }
    catch(error){
      res.json({
        code :"error",
        message : "Danh mục không tồn tại"
      })
    }
  }
  module.exports.undoPatch = async (req,res) => {
    try{
      const id = req.params.id;
      await tourModel.updateOne({_id : id},{deleted : false});
      req.flash('success','Đã khôi phục danh mục');
      res.json({
        code : "success"
      })
    }
    catch(error){
      res.json({
        code :"error",
        message : "Danh mục không tồn tại"
      })
    }
  }
  module.exports.deleteDestroyPatch = async (req,res) => {
    try{
      const id = req.params.id;
      await tourModel.deleteOne({_id : id , deleted : true});
      req.flash('success','Đã xóa  danh mục thành công');
      res.json({
        code : "success"
      })
    }
    catch(error){
      res.json({
        code :"error",
        message : "Danh mục không tồn tại"
      })
    }
  }