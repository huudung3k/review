// Menu Mobile
const buttonMenuMobile = document.querySelector(".header .inner-button-menu");
if(buttonMenuMobile) {
  const sider = document.querySelector(".sider");
  const siderOverlay = document.querySelector(".sider-overlay");

  buttonMenuMobile.addEventListener("click", () => {
    sider.classList.add("active");
    siderOverlay.classList.add("active");
  })

  siderOverlay.addEventListener("click", () => {
    sider.classList.remove("active");
    siderOverlay.classList.remove("active");
  })
}
// End Menu Mobile

// Schedule Section 8
const scheduleSection8 = document.querySelector(".section-8 .inner-schedule");
if(scheduleSection8) {
  const buttonCreate = scheduleSection8.querySelector(".inner-schedule-create");
  const listItem = scheduleSection8.querySelector(".inner-schedule-list");

  // Tạo mới
  if(buttonCreate) {
    buttonCreate.addEventListener("click", () => {
      const firstItem = listItem.querySelector(".inner-schedule-item");
      const cloneItem = firstItem.cloneNode(true);
      cloneItem.querySelector(".inner-schedule-head input").value = "";

      const body = cloneItem.querySelector(".inner-schedule-body");
      const id = `mce_${Date.now()}`;
      body.innerHTML = `<textarea textarea-mce id="${id}"></textarea>`;

      listItem.appendChild(cloneItem);

      initTinyMCE(`#${id}`);
    })
  }

  listItem.addEventListener("click", (event) => {
    // Đóng/mở item
    if(event.target.closest('.inner-more')) {
      const parentItem = event.target.closest('.inner-schedule-item');
      if (parentItem) {
        parentItem.classList.toggle('hidden');
      }
    }

    // Xóa item
    if(event.target.closest('.inner-remove')) {
      const parentItem = event.target.closest('.inner-schedule-item');
      const totalItem = listItem.querySelectorAll(".inner-schedule-item").length;
      if (parentItem && totalItem > 1) {
        parentItem.remove();
      }
    }
  })

  // Sắp xếp
  new Sortable(listItem, {
    animation: 150, // Thêm hiệu ứng mượt mà
    handle: ".inner-move", // Chỉ cho phép kéo bằng class .inner-move
    onStart: (event) => {
      const textarea = event.item.querySelector("[textarea-mce]");
      const id = textarea.id;
      tinymce.get(id).remove();
    },
    onEnd: (event) => {
      const textarea = event.item.querySelector("[textarea-mce]");
      const id = textarea.id;
      initTinyMCE(`#${id}`);
    }
  });
}
// End Schedule Section 8

// Filepond Image
const listFilepondImage = document.querySelectorAll("[filepond-image]");
let filePond = {};
if(listFilepondImage.length > 0) {
  listFilepondImage.forEach(filepondImage => {
    FilePond.registerPlugin(FilePondPluginImagePreview);
    FilePond.registerPlugin(FilePondPluginFileValidateType);
    let files = null;
    const elementImageDefault = filepondImage.closest("[image-default]");
    if(elementImageDefault) {
      const imageDefault = elementImageDefault.getAttribute("image-default");
      if(imageDefault) {
        files = [
          {
            source: imageDefault,
          },
        ]
      }
    }
    filePond[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: '+',
      files : files
    });
  });
}
// End Filepond Image

// Biểu đồ doanh thu
const revenueChart = document.querySelector("#revenue-chart");
if(revenueChart) {
  new Chart(revenueChart, {
    type: 'line',
    data: {
      labels: ['01', '02', '03', '04', '05'],
      datasets: [
        {
          label: 'Tháng 04/2025', // Nhãn của dataset
          data: [1200000, 1800000, 3200000, 900000, 1600000], // Dữ liệu
          borderColor: '#4379EE', // Màu viền
          borderWidth: 1.5, // Độ dày của đường
        },
        {
          label: 'Tháng 03/2025', // Nhãn của dataset
          data: [1000000, 900000, 1200000, 1200000, 1400000], // Dữ liệu
          borderColor: '#EF3826', // Màu viền
          borderWidth: 1.5, // Độ dày của đường
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Ngày'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Doanh thu (VND)'
          }
        }
      },
      maintainAspectRatio: false, // Không giữ tỷ lệ khung hình mặc định
    }
  });
}
// Hết Biểu đồ doanh thu

// Category Create Form
const categoryCreateForm = document.querySelector("#category-create-form");
if(categoryCreateForm) {
  const validation = new JustValidate('#category-create-form');

  validation
    // .addField('#name', [
    //   {
    //     rule: 'required',
    //     errorMessage: 'Vui lòng nhập tên danh mục!'
    //   }
    // ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const description = tinymce.get("description").getContent();

      const dataForm = new FormData();
      dataForm.append("name",name);
      dataForm.append("parent",parent);
      dataForm.append("position",position);
      dataForm.append("status",status);
      dataForm.append("avatar",avatar);
      dataForm.append("description",description);

      fetch(`/${pathAdmin}/category/create`,{
        method : "POST",
        body : dataForm
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.href = `/${pathAdmin}/category/create`;
        }
        else{
          alert(data.message);
        }
      })

    })
  ;
}
const categoryEditForm = document.querySelector("#category-edit-form");
if(categoryEditForm) {
  const validation = new JustValidate('#category-edit-form');

  validation
    // .addField('#name', [
    //   {
    //     rule: 'required',
    //     errorMessage: 'Vui lòng nhập tên danh mục!'
    //   }
    // ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.avatar.closest('[image-default]');
        const imageDefault = elementImageDefault.getAttribute("image-default");
        if(imageDefault.includes(avatar.name)){
          avatar = null;
        }
      }
      const description = tinymce.get("description").getContent();

      const dataForm = new FormData();
      dataForm.append("name",name);
      dataForm.append("parent",parent);
      dataForm.append("position",position);
      dataForm.append("status",status);
      dataForm.append("avatar",avatar);
      dataForm.append("description",description);

      fetch(`/${pathAdmin}/category/edit/${id}`,{
        // method PATCH  đc sử dụng khi muốn câp nhật database
        method : "PATCH",
        body : dataForm
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.href = `/${pathAdmin}/category/list`;
        }
        else{
          alert(data.message);
        }
      })

    })
  ;
}
// End Category Create Form

// Tour Create Form
const tourCreateForm = document.querySelector("#tour-create-form");
if(tourCreateForm) {
  const validation = new JustValidate('#tour-create-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên tour!'
      }
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const category = event.target.category.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const priceAdult = event.target.priceAdult.value;
      const priceChildren = event.target.priceChildren.value;
      const priceBaby = event.target.priceBaby.value;
      const priceNewAdult = event.target.priceNewAdult.value;
      const priceNewChildren = event.target.priceNewChildren.value;
      const priceNewBaby = event.target.priceNewBaby.value;
      const stockAdult = event.target.stockAdult.value;
      const stockChildren = event.target.stockChildren.value;
      const stockBaby = event.target.stockBaby.value;
      const locations = [];
      const time = event.target.time.value;
      const vehicle = event.target.vehicle.value;
      const departureDate = event.target.departureDate.value;
      const information = tinymce.get("information").getContent();
      const schedules = [];

      // locations
      const listElementLocation = tourCreateForm.querySelectorAll('input[name="locations"]:checked');
      listElementLocation.forEach(input => {
        locations.push(input.value);
      });
      // End locations

      // schedules
      const listElementScheduleItem = tourCreateForm.querySelectorAll('.inner-schedule-item');
      listElementScheduleItem.forEach(scheduleItem => {
        const input = scheduleItem.querySelector("input");
        const title = input.value;

        const textarea = scheduleItem.querySelector("textarea");
        const idTextarea = textarea.id;
        const description = tinymce.get(idTextarea).getContent();

        schedules.push({
          title: title,
          description: description
        });
      });
      // End schedules
      const formData = new FormData();
      formData.append('name',name);
      formData.append('category',category);
      formData.append('position',position);
      formData.append('status',status);
      formData.append('avatar',avatar);
      formData.append('priceAdult',priceAdult);
      formData.append('priceChildren',priceChildren);
      formData.append('priceBaby',priceBaby);
      formData.append('priceNewAdult',priceNewAdult);
      formData.append('priceNewChildren',priceNewChildren);
      formData.append('priceNewBaby',priceNewBaby);
      formData.append('stockAdult',stockAdult);
      formData.append('stockChildren',stockChildren);
      formData.append('stockBaby',stockBaby);
      // formdata không gửi array lên được, phải chuyển sang chuỗi;
      formData.append('locations',JSON.stringify(locations));
      formData.append('time',time);
      formData.append('vehicle',vehicle);
      formData.append('departureDate',departureDate);
      formData.append('information',information);
      formData.append('schedules',JSON.stringify(schedules));

      fetch(`/${pathAdmin}/tour/create`,{
        method : "POST",
        body : formData
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.href = `/${pathAdmin}/tour/list`
        }
        else{
          alert(data.message);
        }
      })
    })
  ;
}
// End Tour Create Form

// Order Edit Form
const orderEditForm = document.querySelector("#order-edit-form");
if(orderEditForm) {
  const validation = new JustValidate('#order-edit-form');

  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: 'Số điện thoại không đúng định dạng!'
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const phone = event.target.phone.value;
      const note = event.target.note.value;
      const paymentMethod = event.target.paymentMethod.value;
      const paymentStatus = event.target.paymentStatus.value;
      const status = event.target.status.value;

      console.log(fullName);
      console.log(phone);
      console.log(note);
      console.log(paymentMethod);
      console.log(paymentStatus);
      console.log(status);
    })
  ;
}
// End Order Edit Form

// Setting Website Info Form
const settingWebsiteInfoForm = document.querySelector("#setting-website-info-form");
if(settingWebsiteInfoForm) {
  const validation = new JustValidate('#setting-website-info-form');

  validation
    .addField('#websiteName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên website!'
      },
    ])
    .addField('#email', [
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .onSuccess((event) => {
      const websiteName = event.target.websiteName.value;
      const phone = event.target.phone.value;
      const email = event.target.email.value;
      const address = event.target.address.value;
      const logos = filePond.logo.getFiles();
      let logo = null;
      if(logos.length > 0) {
        logo = logos[0].file;
        const elementImageDefault = event.target.logo.closest('[image-default]');
        const imageDefault = elementImageDefault.getAttribute("image-default");
        if(imageDefault.includes(logo.name)){
          logo = null;
        }
      }
      const favicons = filePond.favicon.getFiles();
      let favicon = null;
      if(favicons.length > 0) {
        favicon = favicons[0].file;
        const elementImageDefault = event.target.favicon.closest('[image-default]');
        const imageDefault = elementImageDefault.getAttribute("image-default");
        if(imageDefault.includes(favicon.name)){
          favicon = null;
        }
      }
      const formData = new FormData();
      formData.append('websiteName',websiteName);
      formData.append('phone',phone);
      formData.append('email',email);
      formData.append('address',address);
      formData.append('logo',logo);
      formData.append('favicon',favicon);

      fetch(`/${pathAdmin}/setting/website-info`,{
        method : "PATCH",
        body : formData
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.reload();
        }
        else{
          alert(data.message);
        }
      })
    })
  ;
}
// End Setting Website Info Form

// Setting Account Admin Create Form
const settingAccountAdminCreateForm = document.querySelector("#setting-account-admin-create-form");
if(settingAccountAdminCreateForm) {
  const validation = new JustValidate('#setting-account-admin-create-form');

  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!',
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email!'
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: 'Số điện thoại không đúng định dạng!'
      },
    ])
    .addField('#positionCompany', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập chức vụ!'
      },
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!',
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!',
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const role = event.target.role.value;
      const positionCompany = event.target.positionCompany.value;
      const status = event.target.status.value;
      const password = event.target.password.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const formData = new FormData();
      formData.append('fullName',fullName);
      formData.append('email',email);
      formData.append('phone',phone);
      formData.append('role',role);
      formData.append('positionCompany',positionCompany);
      formData.append('status',status);
      formData.append('password',password);
      formData.append('avatar',avatar);

      fetch(`/${pathAdmin}/setting/account-admin/create`,{
        method: "POST",
        body : formData
      }).then(res => res.json())
      .then(data => {
        if(data.code == 'success'){
          window.location.href = `/${pathAdmin}/setting/account-admin/list`
        }
        else{
          alert(data.message);
        }
      })
    })
  ;
}
// End Setting Account Admin Create Form
const settingAccountAdminEditForm = document.querySelector("#setting-account-admin-edit-form");
if(settingAccountAdminEditForm) {
  const validation = new JustValidate('#setting-account-admin-edit-form');

  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!',
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email!'
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: 'Số điện thoại không đúng định dạng!'
      },
    ])
    .addField('#positionCompany', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập chức vụ!'
      },
    ])
    .addField('#password', [
      {
        validator: (value) => value ? value.length >= 8 : true,
        errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
      },
      {
        validator: (value) => value ? /[A-Z]/.test(value) : true,
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
      },
      {
        validator: (value) => value ? /[a-z]/.test(value) : true,
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
      },
      {
        validator: (value) => value ? /\d/.test(value) : true,
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!',
      },
      {
        validator: (value) => value ? /[@$!%*?&]/.test(value) : true,
        errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const role = event.target.role.value;
      const positionCompany = event.target.positionCompany.value;
      const status = event.target.status.value;
      const password = event.target.password.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.avatar.closest('[image-default]'); // lấy thẻ cha gần nhất là thẻ div
        const imageDefault = elementImageDefault.getAttribute("image-default");
        if(imageDefault.includes(avatar.name)){
          avatar = null;
        }
      }
      const formData = new FormData();
      formData.append('fullName',fullName);
      formData.append('email',email);
      formData.append('phone',phone);
      formData.append('role',role);
      formData.append('positionCompany',positionCompany);
      formData.append('status',status);
      if(password){
        formData.append('password',password);
      }
      formData.append('avatar',avatar);

      fetch(`/${pathAdmin}/setting/account-admin/edit/${id}`,{
        method: "PATCH",
        body : formData
      }).then(res => res.json())
      .then(data => {
        if(data.code == 'success'){
          window.location.href = `/${pathAdmin}/setting/account-admin/list`;
        }
        else if(data.code == "error"){
          alert(data.message);
        }
      })
    })
  ;
}
// Setting Role Create Form
const settingRoleCreateForm = document.querySelector("#setting-role-create-form");
if(settingRoleCreateForm) {
  const validation = new JustValidate('#setting-role-create-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên nhóm quyền!'
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const description = event.target.description.value;
      const permissions = [];

      // permissions
      const listElementPermission = settingRoleCreateForm.querySelectorAll('input[name="permissions"]:checked');
      listElementPermission.forEach(input => {
        permissions.push(input.value);
      });
      // End permissions
      const dataFinal = {
        name,
        description,
        permissions
      }
      fetch(`/${pathAdmin}/setting/role/create`,{
        method : "POST",
        headers : {
          "Content-Type" :"application/json" 
        },
        body : JSON.stringify(dataFinal)
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.reload();
        }
        else{
          alert(data.message);
        }
      })
    })
  ;
}
// End Setting Role Create Form

const settingRoleEditForm = document.querySelector('#setting-role-edit-form');
if(settingRoleEditForm){
  const validation = new JustValidate('#setting-role-edit-form');
  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên nhóm quyền!'
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const description = event.target.description.value;
      const permissions = [];

      // permissions
      const listElementPermission = settingRoleEditForm.querySelectorAll('input[name="permissions"]:checked');
      listElementPermission.forEach(input => {
        permissions.push(input.value);
      });
      // End permissions
      const dataFinal = {
        name,
        description,
        permissions
      }
      fetch(`/${pathAdmin}/setting/role/edit/${id}`,{
        method : "PATCH",
        headers : {
          "Content-Type" :"application/json" 
        },
        body : JSON.stringify(dataFinal)
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.reload();
        }
        else{
          alert(data.message);
        }
      })
    })
  ;
}



// Profile Edit Form
const profileEditForm = document.querySelector("#profile-edit-form");
if(profileEditForm) {
  const validation = new JustValidate('#profile-edit-form');

  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!',
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email!'
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: 'Số điện thoại không đúng định dạng!'
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
        const elementImageDefault = event.target.avatar.closest('[image-default]'); // lấy thẻ cha gần nhất là thẻ div
        const imageDefault = elementImageDefault.getAttribute("image-default");
        if(imageDefault.includes(avatar.name)){
          avatar = null;
        }
      }
      const formData = new FormData();
      formData.append('fullName',fullName);
      formData.append('email',email);
      formData.append('phone',phone);
      formData.append('avatar',avatar);
      fetch(`/${pathAdmin}/profile/edit`,{
        method : "PATCH",
        body : formData
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.reload();
        }
        else if(data.code == "error"){
          alert(data.message);
        }
      })
    })
  ;
}
// End Profile Edit Form

// Profile Change Password Form
const profileChangePasswordForm = document.querySelector("#profile-change-password-form");
if(profileChangePasswordForm) {
  const validation = new JustValidate('#profile-change-password-form');

  validation
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!',
      },
      {
        validator: (value) => value.length >= 8,
        errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
      },
      {
        validator: (value) => /[A-Z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
      },
      {
        validator: (value) => /[a-z]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
      },
      {
        validator: (value) => /\d/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!',
      },
      {
        validator: (value) => /[@$!%*?&]/.test(value),
        errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
      },
    ])
    .addField('#confirmPassword', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng xác nhận mật khẩu!',
      },
      {
        validator: (value, fields) => {
          const password = fields['#password'].elem.value;
          return value == password;
        },
        errorMessage: 'Mật khẩu xác nhận không khớp!',
      }
    ])
    .onSuccess((event) => {
      const password = event.target.password.value;
      const dataFinal = {password};

      fetch(`/${pathAdmin}/profile/change-password`,{
        method: "PATCH",
        headers : {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify(dataFinal)
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.href = `/${pathAdmin}/profile/edit`;
        }
        else if(data.code == "error"){
          alert(data.message);
        }
      })
    })
  ;
}
// End Profile Change Password Form

// Sider
const sider = document.querySelector(".sider");
if(sider) {
  const pathNameCurrent = window.location.pathname;
  const splitPathNameCurrent = pathNameCurrent.split("/");
  const menuList = sider.querySelectorAll("a");
  menuList.forEach(item => {
    const href = item.href;
    const pathName = new URL(href).pathname;
    const splitPathName = pathName.split("/");
    if(splitPathNameCurrent[1] == splitPathName[1] && splitPathNameCurrent[2] == splitPathName[2]) {
      item.classList.add("active");
    }
  })
}
// End Sider

// Logout
const buttonLogout = document.querySelector(".sider .inner-logout");
if(buttonLogout) {
  buttonLogout.addEventListener("click", () => {
    fetch(`/${pathAdmin}/account/logout`, {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        if(data.code == 'success') {
          window.location.href = `/${pathAdmin}/account/login`;
        }
      })
  })
}
// End Logout

// flash open
const alertTime = document.querySelector("[alert-time]");
if(alertTime){
  let time = alertTime.getAttribute("alert-time");
  time = time ? parseInt(time) : 4000;
  setTimeout(() => {
    alertTime.remove();
  },time);
}
// delete ware
const listButtonDelete = document.querySelectorAll('[button-delete]');
if(listButtonDelete.length > 0){
  listButtonDelete.forEach(btn => {
    btn.addEventListener("click", () => {
      const dataApi = btn.getAttribute("data-api");
      fetch(dataApi,{
        method : "PATCH"
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.reload();
        }
        else if(data.code == "error"){
          alert(data.message);
        }
      });
    });
  });
}
// btn undo
const listBtnUndo = document.querySelectorAll('[button-undo]');
if(listBtnUndo.length > 0){
  listBtnUndo.forEach(button => {
    button.addEventListener('click',() => {
      const dataApi = button.getAttribute('data-api');
      fetch(dataApi,{
        method : "PATCH"
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.reload();
        }
        else if(data.code == "error"){
          alert(data.message);
        }
      }
      )
    })
  })
}
const filterByStatus = document.querySelector('[filter-status]');
if(filterByStatus){
  const url = new URL(window.location.href);
  filterByStatus.addEventListener('change',() => {
    const value = filterByStatus.value;
    if(value){
      url.searchParams.set("status",value);
    }
    else {
      url.searchParams.delete("status");
    }
    window.location.href = url.href;
  })
  // khi mới load trang, nếu query được thì sẽ gán giá trị mặc định là giá trị trên url
  const statusCurr = url.searchParams.get("status");
  if(statusCurr){
    filterByStatus.value = statusCurr;
  }
}
const filterByCreated = document.querySelector('[filter-created-by]');
if(filterByCreated){
  const url = new URL(window.location.href);
  filterByCreated.addEventListener('change',() => {
    // id
    const value = filterByCreated.value;
    if(value){
      url.searchParams.set("createdBy",value);
    }
    else {
      url.searchParams.delete("createdBy");
    }
    window.location.href = url.href;
  })
  // khi mới load trang, nếu query được thì sẽ gán giá trị mặc định là giá trị trên url
  const CreatedByCurr = url.searchParams.get("createdBy");
  if(CreatedByCurr){
    filterByCreated.value = CreatedByCurr;
  }
}
const filterStartDate = document.querySelector('[filter-start-date]');
if(filterStartDate){
  const url = new URL(window.location.href);
  filterStartDate.addEventListener('change',() => {
    const startDate = filterStartDate.value;
    if(startDate){
      url.searchParams.set("startDate",startDate);
    }
    else{
      url.searchParams.delete("startDate");
    }
    window.location.href = url.href;
  })
  const startDateCurr = url.searchParams.get('startDate');
  if(startDateCurr){
    filterStartDate.value = startDateCurr;
  }
}
const filterEndDate = document.querySelector('[filter-end-date]');
if(filterEndDate){
  const url = new URL(window.location.href);
  filterEndDate.addEventListener('change',() => {
    const endDate = filterEndDate.value;
    if(endDate){
      url.searchParams.set("endDate",endDate);
    }
    else{
      url.searchParams.delete("endDate");
    }
    window.location.href = url.href;
  })
  const endDateCurr = url.searchParams.get('endDate');
  if(endDateCurr){
    filterEndDate.value = endDateCurr;
  }
}

const categoryFilter = document.querySelector('[filter-category]');
if(categoryFilter){
  const url = new URL(window.location.href);
  categoryFilter.addEventListener('change',() => {
    const value = categoryFilter.value;
    if(value){
      url.searchParams.set('category',value);
    }
    else{
      url.searchParams.delete('category');
    }
    window.location.href = url.href;
  })
  const categoryCurr = url.searchParams.get('category')
  if(categoryCurr){
    categoryFilter.value = categoryCurr;
  }
}
const priceFilter = document.querySelector('[filter-price]');
if(priceFilter){
  const url = new URL(window.location.href);
  priceFilter.addEventListener('change',() => {
    const value = priceFilter.value;
    if(value){
      url.searchParams.set('price',value);
    }
    else{
      url.searchParams.delete('price');
    }
    window.location.href = url.href;
  })
  const priceCurr = url.searchParams.get('price')
  if(priceCurr){
    priceFilter.value = priceCurr;
  }
}
const resetFilter = document.querySelector('[filter-reset]');
if(resetFilter){
  resetFilter.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.search = "";
    window.location.href = url.href;
  })
}

const checkAllBox = document.querySelector('[check-all]');
if(checkAllBox){
  checkAllBox.addEventListener('click', () => {
    const checkItemList = document.querySelectorAll('[check-item]');
    checkItemList.forEach(item => {
      item.checked = checkAllBox.checked;
    })
  })
}

const changeMulti = document.querySelector('[change-multi]');
if(changeMulti){
  const select = changeMulti.querySelector("select");
  const button = changeMulti.querySelector("button");
  const dataApi = button.getAttribute("data-api");
  button.addEventListener("click", () => {
    const option = select.value;
    const checkItemList = document.querySelectorAll("[check-item]:checked");
    const ids = [];
    if(option && checkItemList.length > 0){
      checkItemList.forEach(item => {
        ids.push(item.getAttribute("check-item"));
      })
    }
    const dataFinal = {
      option : option,
      ids : ids
    }
    fetch(dataApi,{
      method : "PATCH",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify(dataFinal)
    }).then(res => res.json())
    .then(data => {
      if(data.code == "success"){
        window.location.reload();
      }
      else if(data.code == "error"){
        alert(data.message);
      }
    })

  })
}

const filterByName = document.querySelector('[search-text]');
if(filterByName){
  const url = new URL(window.location.href);
  filterByName.addEventListener('keyup',(event) => {
    if(event.key == 'Enter'){
      const keyWord = filterByName.value;
      if(keyWord){
        url.searchParams.set('keyword',keyWord);
      }
      else{
        url.searchParams.delete('keyword');
      }
      window.location.href = url.href;
    }
  })
  const keyWorkCurr = url.searchParams.get('keyword');
  if(keyWorkCurr){
    filterByName.value = keyWorkCurr;
  }
}

const filterByRole = document.querySelector('[filter-role]');
if(filterByRole){
  const url = new URL(window.location.href);
  filterByRole.addEventListener('change',() => {
    const role = filterByRole.value;
    if(role){
      url.searchParams.set('role',role)
    }
    else{
      url.searchParams.delete('role');
    }
    window.location.href = url.href
  });
  const roleCurr = url.searchParams.get('role');
  if(roleCurr){
    filterByRole.value = roleCurr;
  }
}
const pagination = document.querySelector('[pagination]');
if(pagination){
  const url = new URL(window.location.href);
  pagination.addEventListener('change', () => {
    const page = pagination.value;
    if(page){
      url.searchParams.set('page',page);
    }
    else{
      url.searchParams.delete('page');
    }
    window.location.href = url.href;
  });
  const pageCurr = url.searchParams.get('page');
  if(pageCurr){
    pagination.value = pageCurr;
  }
}
// update tour
const tourEditForm = document.querySelector("#tour-edit-form");
if(tourEditForm) {
  const validation = new JustValidate('#tour-edit-form');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên tour!'
      }
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const category = event.target.category.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatars = filePond.avatar.getFiles();
      let avatar = null;
      if(avatars.length > 0) {
        avatar = avatars[0].file;
      }
      const priceAdult = event.target.priceAdult.value;
      const priceChildren = event.target.priceChildren.value;
      const priceBaby = event.target.priceBaby.value;
      const priceNewAdult = event.target.priceNewAdult.value;
      const priceNewChildren = event.target.priceNewChildren.value;
      const priceNewBaby = event.target.priceNewBaby.value;
      const stockAdult = event.target.stockAdult.value;
      const stockChildren = event.target.stockChildren.value;
      const stockBaby = event.target.stockBaby.value;
      const locations = [];
      const time = event.target.time.value;
      const vehicle = event.target.vehicle.value;
      const departureDate = event.target.departureDate.value;
      const information = tinymce.get("information").getContent();
      const schedules = [];

      // locations
      const listElementLocation = tourEditForm.querySelectorAll('input[name="locations"]:checked');
      listElementLocation.forEach(input => {
        locations.push(input.value);
      });
      // End locations

      // schedules
      const listElementScheduleItem = tourEditForm.querySelectorAll('.inner-schedule-item');
      listElementScheduleItem.forEach(scheduleItem => {
        const input = scheduleItem.querySelector("input");
        const title = input.value;

        const textarea = scheduleItem.querySelector("textarea");
        const idTextarea = textarea.id;
        const description = tinymce.get(idTextarea).getContent();

        schedules.push({
          title: title,
          description: description
        });
      });
      // End schedules
      const formData = new FormData();
      formData.append('name',name);
      formData.append('category',category);
      formData.append('position',position);
      formData.append('status',status);
      formData.append('avatar',avatar);
      formData.append('priceAdult',priceAdult);
      formData.append('priceChildren',priceChildren);
      formData.append('priceBaby',priceBaby);
      formData.append('priceNewAdult',priceNewAdult);
      formData.append('priceNewChildren',priceNewChildren);
      formData.append('priceNewBaby',priceNewBaby);
      formData.append('stockAdult',stockAdult);
      formData.append('stockChildren',stockChildren);
      formData.append('stockBaby',stockBaby);
      // formdata không gửi array lên được, phải chuyển sang chuỗi;
      formData.append('locations',JSON.stringify(locations));
      formData.append('time',time);
      formData.append('vehicle',vehicle);
      formData.append('departureDate',departureDate);
      formData.append('information',information);
      formData.append('schedules',JSON.stringify(schedules));

      fetch(`/${pathAdmin}/tour/edit/${id}`,{
        method : "PATCH",
        body : formData
      }).then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          window.location.href = `/${pathAdmin}/tour/list`;
        }
        else if(data.code == "error"){
          alert(data.message);
        }
      })
  })
}

