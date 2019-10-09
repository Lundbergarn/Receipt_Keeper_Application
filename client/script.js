(function () {

  let url = "";
  let token = "";
  let messageModal = document.querySelector('#messageModal');
  let messageTag = document.querySelector('.error');

  document.querySelector('#messageBtn').addEventListener('click', (e) => {
    e.target.parentNode.parentNode.parentNode.style.display = 'none';
  })

  //////////////////////////////////// 10.158.76.172  - "http://192.168.1.224:3000/"
  // Change if runned localy
  isMobileDevice() ? url = "/" : url = "/";

  // Check for new input
  $("#imageInput").change( () => {
    readURL(this);
  });


  // Check mobiledevice
  function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
  };

  // Display errors
  const displayMessage = (message) => {
    if (Object.keys(message).includes('error')) {
      messageTag.textContent = message.message;
      // alert(message.error)
      messageModal.style.display = 'block';
      console.log('error')
    } else if (Object.keys(message).includes('message')) {
      console.log(message)
      messageTag.textContent = message.message;
      messageModal.style.display = 'block';
      console.log('message')
    } else console.log('other')
  };

  // Check request for errors
  async function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response
    } else {
      let status = await response.json()
      await displayMessage(status);
      var error = new Error(response.statusText)
      error.response = response
      throw error
    }
  }

  // Select from DOM
  const querySelect = (element) => {
    return document.querySelector(element);
  }

  // Parsedata
  const parseJSON = (response) => {
    return response.json()
  }

  // GET
  const getRequest = (endpoint) => {
    return fetch(url + endpoint, {
      method: 'GET',
      protocol: 'http:',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
  }

  // POST
  const postRequest = (endpoint, data = null) => {
    return fetch(url + endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
  }

  // DELETE
  const deleteRequest = (endpoint, id) => {
    return fetch(url + endpoint, {
      method: 'DELETE',
      body: JSON.stringify(id),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
  }

  // ShowImage function
  const showImage = (data, searchVal = null) => {
    if (!data[0]) {
      displayMessage({ message: 'No images to show' })
      return;
    }

    let imgList = document.createElement('DIV');

    data.forEach(el => {
      if (searchVal === null || el.title.toLowerCase().includes(searchVal)) {

        let img = document.createElement('IMG');
        let title = document.createElement('P');
        let date = document.createElement('P');
        let remove = document.createElement('I');
        let container = document.createElement('ARTICLE');

        img.src = `data:image/jpeg;base64,${el.image}`;
        container.className = "card";
        container.id = el._id;
        title.textContent = el.title;
        date.textContent = el.createdAt.slice(0, 10);
        remove.textContent = "delete";
        remove.className = "material-icons";
        imgList.className = "all_image_container";

        container.append(title);
        container.append(date);
        container.append(remove);
        container.append(img);
        imgList.append(container);
      }
    })

    let allImg = querySelect('#allImg');
    allImg.innerHTML = "";
    allImg.append(imgList);
  }


  
  // Search Image ----------
  // Search Image ----------
  const searchImage = () => {
    let searchValue = querySelect('#searchInput').value.toLowerCase();

    if (searchValue === "") {
      displayMessage({ message: 'Type search value' });
      return;
    }

    try {
      getRequest('kvitton')
        .then(checkStatus)
        .then(parseJSON)
        .then(dataRes => showImage(dataRes, searchValue))
        .then($('#searchModal').modal('close'))
        .catch(error => displayMessage({ error: error }));
    }
    catch (error) {
      console.log(error);
    }
  };

  querySelect('#searchInput').addEventListener("keydown", (event) => {
    if (event.keyCode == 13) {
      console.log('search')
      event.preventDefault();
      event.target.blur();
      searchImage();
    }
  });

  querySelect('#search').addEventListener('click', () => {
    searchImage();
  });


  // Titel input -------
  // Titel input -------
  querySelect('#imageTitel').addEventListener("keydown", (event) => {
    if (event.keyCode == 13) {
      event.preventDefault();
      event.target.blur();
    }
  })

  //Save Image  ----------
  //Save Image  ----------
  querySelect('#saveImageBtn').addEventListener('click', () => {
    let image = querySelect('#inputImage');
    let title = querySelect('#imageTitel');

    // Remove data:image/jpeg;base64,
    let imageValue = image.src.slice(23);

    let obj = {
      "title": title.value.toLowerCase(),
      "image": imageValue
    };

    if (image.src.length > 41 && title.value.length > 1) {
      title.value = "";
      image.src = "";
    } else {
      displayMessage({ message: 'Add image and title' });
      return;
    }

    try {
      postRequest('kvitton', obj)
        .then(checkStatus)
        .then(parseJSON)
        .then(response => {
          displayMessage({ message: 'Images saved' });
        })
        .catch(error => console.log(error));
    }
    catch (error) {
      console.log(error);
    }
  });


  // Show Image ----------
  // Show Image ----------
  querySelect('#showImagesBtn').addEventListener('click', () => {
    if (token === "") {
      displayMessage({ message: 'Login or set up an account' });
      return;
    }

    try {
      getRequest('kvitton')
        .then(checkStatus)
        .then(parseJSON)
        .then(dataRes => showImage(dataRes))
        .catch(error => displayMessage({ error: error }));
    }
    catch (error) {
      console.log(error);
    }
  })

  // Delete Image
  document.body.addEventListener('click', (e) => {
    if(e.target.innerHTML === 'delete') {
      try {
        deleteRequest('kvitton/' + e.target.parentNode.id)
          .then(checkStatus)
          .then(response => {
            displayMessage({ message: 'Image removed' });
            e.target.parentNode.remove();
          })
          .catch(error => console.log(error));
      }
      catch (error) {
        console.log(error);
      }
    }
  })

  // Modal ------------
  // Modal ------------
  document.addEventListener('DOMContentLoaded', () => {
    let elems = document.querySelectorAll('.modal');
    let instances = M.Modal.init(elems);
  });


  document.querySelector('#login').addEventListener('click', () => {
    token = "";
    let email = querySelect('#email').value;
    let password = querySelect('#password').value;

    if (!email || !password) {
      displayMessage({ message: 'Type in password and email' });
      return;
    };

    let obj = {
      "email": email,
      "password": password
    };

    try {
      postRequest('users/login', obj)
        .then(checkStatus)
        .then(parseJSON)
        .then(response => {
          token = response.token;
        })
        .then(data => {
          querySelect('#logoutModalHandle').classList.add('active-log');
          querySelect('#loginModalHandle').classList.remove('active-log');

          $('#loginModal').modal('close');
          $('#inputContainer').css("display", "block");
          $('#imageInput').removeAttr("disabled");
          $('#searchModalHandle').removeAttr("disabled");
        })
        .catch(error => console.log(error));
    }
    catch (error) {
      console.log(error);
    }
  })


  // Create User -------------
  // Create User -------------
  querySelect('#createAcc').addEventListener('click', () => {
    token = "";
    let email = querySelect('#emailCreate').value;
    let password = querySelect('#passwordCreate').value;
    let password2 = querySelect('#passwordCreateConfirm').value;
    let name = querySelect('#firstnameCreate').value;

    if (!email || !password || !password2 || !name) {
      displayMessage({ message: 'Type in all the fields' });
      return;
    };

    if (password !== password2) {
      displayMessage({ message: 'Passwords are not the same' });
      return;
    }

    let obj = {
      "name": name,
      "email": email,
      "password": password
    };

    try {
      postRequest('users', obj)
        .then(checkStatus)
        .then(parseJSON)
        .then(response => {
          token = response.token;

          querySelect('#logoutModalHandle').classList.add('active-log');
          querySelect('#loginModalHandle').classList.remove('active-log');

          $('#createAccModal').modal('close');
          $('#inputContainer').css("display", "block");

          $('#imageInput').removeAttr("disabled");
          $('#searchModalHandle').removeAttr("disabled");
        })
        .catch(error => console.log(error));
    }
    catch (error) {
      console.log(error);
    }
  })


  // Logout --------
  // Logout --------
  querySelect('#logoutModalHandle').addEventListener('click', () => {

    try {
      postRequest('users/logout')
        .then(response => {
          token = "";

          querySelect('#allImg').innerHTML = "";
          querySelect('#logoutModalHandle').classList.remove('active-log');
          querySelect('#loginModalHandle').classList.add('active-log');

          $('#inputContainer').css("display", "none");
          $('#imageInput').attr("disabled", true);
          $('#searchModalHandle').attr("disabled", true);

          displayMessage({ message: 'Logged out' })
        })
        .catch(error => console.log(error));
    }
    catch (error) {
      console.log(error)
    }
  })


  ////////////////////////////////////
  ////////////////////////////////////

  function readURL(input) {
    if (input.files && input.files[0]) {
      resizeImage({
        file: input.files[0],
        maxSize: 650
      }).then(function (resizedImage) {

        let reader = new FileReader();
        let result = reader.result;
        reader.readAsDataURL(resizedImage);

        reader.onload = function (e) {
          $('#inputImage').attr('src', e.target.result);
        }

      }).catch(function (error) {
        console.log(error);
      });
    }
  }


  // Rezise input images
  var resizeImage = function (settings) {
    var file = settings.file;
    var maxSize = settings.maxSize;
    var reader = new FileReader();
    var image = new Image();
    var canvas = document.createElement('canvas');
    var dataURItoBlob = function (dataURI) {
      var bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
        atob(dataURI.split(',')[1]) :
        unescape(dataURI.split(',')[1]);
      var mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
      var max = bytes.length;
      var ia = new Uint8Array(max);
      for (var i = 0; i < max; i++)
        ia[i] = bytes.charCodeAt(i);
      return new Blob([ia], { type: mime });
    };
    var resize = function () {
      var width = image.width;
      var height = image.height;
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);
      var dataUrl = canvas.toDataURL('image/jpeg');
      return dataURItoBlob(dataUrl);
    };
    return new Promise(function (ok, no) {
      if (!file.type.match(/image.*/)) {
        no(new Error("Not an image"));
        return;
      }
      reader.onload = function (readerEvent) {
        image.onload = function () { return ok(resize()); };
        image.src = readerEvent.target.result;
      };
      return reader.readAsDataURL(file);
    });
  };

})();