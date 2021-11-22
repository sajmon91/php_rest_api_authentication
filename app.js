 
  const sign_up_btn = document.querySelector('#sign_up');
  const login_btn = document.querySelector('#login');
  const logout_btn = document.querySelector('#logout');
  const home_btn = document.querySelector('#home');
  const account_btn = document.querySelector('#update_account');
  const content_div = document.querySelector('#content');
  const response_div = document.querySelector('#response');
 


 ///////////////////////////////////////////////////// show sign up / registration form
  sign_up_btn.addEventListener('click', function(){
    let html = `
              <h2>Sign Up</h2>
              <form id='sign_up_form'>
                  <div class="form-group">
                      <label for="firstname">Firstname</label>
                      <input type="text" class="form-control" name="firstname" id="firstname" required />
                  </div>
  
                  <div class="form-group">
                      <label for="lastname">Lastname</label>
                      <input type="text" class="form-control" name="lastname" id="lastname" required />
                  </div>
  
                  <div class="form-group">
                      <label for="email">Email</label>
                      <input type="email" class="form-control" name="email" id="email" required />
                  </div>
  
                  <div class="form-group">
                      <label for="password">Password</label>
                      <input type="password" class="form-control" name="password" id="password" required />
                  </div>
  
                  <button type='submit' class='btn btn-primary'>Sign Up</button>
              </form>
              `;
      clearResponse();
      content_div.innerHTML = html;
      let sign_up_form = document.querySelector('#sign_up_form');

      // trigger when registration form is submitted
      sign_up_form.addEventListener('submit', function(e){
        e.preventDefault();
        const form_data = new FormData(sign_up_form);

        let serialized = JSON.stringify(serialize(form_data));

        fetch('api/create_user.php', {
          method: "POST",
          body: serialized,
          headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => {
          if (response.ok) {
            response_div.innerHTML = "<div class='alert alert-success'>Successful sign up. Please login.</div>";
            sign_up_form.reset();
          }else {
            throw new Error();
          }
        })
        .catch(err => {
          response_div.innerHTML = "<div class='alert alert-danger'>Unable to sign up. Please contact admin.</div>";
        });
      });
      
  });

///////////////////////////////////////////////// login //

  login_btn.addEventListener('click', showLoginPage);

  // show login page
  function showLoginPage() {

    // remove jwt
    setCookie("jwt", "", 1);

    // login page html
    let html = `
        <h2>Login</h2>
        <form id='login_form'>
            <div class='form-group'>
                <label for='email'>Email address</label>
                <input type='email' class='form-control' id='email' name='email' placeholder='Enter email'>
            </div>
 
            <div class='form-group'>
                <label for='password'>Password</label>
                <input type='password' class='form-control' id='password' name='password' placeholder='Password'>
            </div>
 
            <button type='submit' class='btn btn-primary'>Login</button>
        </form>
        `;

    content_div.innerHTML = html;
    clearResponse();
    showLoggedOutMenu();

    // login form submit trigger will be here
    let login_form = document.querySelector('#login_form');
    login_form.addEventListener('submit', login_form_submit);
  };

  function login_form_submit(e){
      e.preventDefault();
      // get form data
      const login_data = new FormData(login_form);
      let serialized = JSON.stringify(serialize(login_data));

      // submit form data to api
      fetch('api/login.php', {
        method: "POST",
        body: serialized,
        headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }else {
          throw new Error('Something went wrong');
        }
      })
      .then(data => {
        // store jwt to cookie
        setCookie("jwt", data.jwt, 1);
        // show home page & tell the user it was a successful login
        showHomePage();
        response_div.innerHTML = "<div class='alert alert-success'>Successful login.</div>";
      })
      .catch(err => {
        response_div.innerHTML = "<div class='alert alert-danger'>Login failed. Email or password is incorrect.</div>";
        login_form.reset();
      });

  };

  ////////////////////////////////////////////// update account

  // show update account form
  account_btn.addEventListener("click", function(){
    showUpdateAccountForm();
  });


  // show update account form
  function showUpdateAccountForm(){
    // validate jwt to verify access
    const jwt = getCookie('jwt');
    fetch('api/validate_token.php', {
      method: "POST",
      body: JSON.stringify({ jwt:jwt }),
      headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }else {
        throw new Error();
      }
    })
    .then(data => {
      // if response is valid, put user details in the form
      let html = `
        <h2>Update Account</h2>
        <form id='update_account_form'>
            <div class="form-group">
                <label for="firstname">Firstname</label>
                <input type="text" class="form-control" name="firstname" id="firstname" required value="` + data.data.firstname + `" />
            </div>
 
            <div class="form-group">
                <label for="lastname">Lastname</label>
                <input type="text" class="form-control" name="lastname" id="lastname" required value="` + data.data.lastname + `" />
            </div>
 
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" class="form-control" name="email" id="email" required  value="` + data.data.email + `" />
            </div>
 
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" name="password" id="password" />
            </div>
 
            <button type='submit' class='btn btn-primary'>
                Save Changes
            </button>
        </form>
      `;
      clearResponse();
      content_div.innerHTML = html;
      // trigger when 'update account' form is submitted
      const update_account_form = document.querySelector('#update_account_form');
      update_account_form.addEventListener('submit', update_account_submit);
    })
    .catch((error) => {
      // on error/fail, tell the user he needs to login to show the account page
      showLoginPage();
      response_div.innerHTML = "<div class='alert alert-danger'>Please login to access the account page.</div>";
    });
  };


  function update_account_submit(e){
    e.preventDefault();

    // get form data
    const update_data = new FormData(update_account_form);
    let update_account_obj = serialize(update_data);

    // validate jwt to verify access
    const jwt = getCookie('jwt');

    // add jwt on the object
    update_account_obj.jwt = jwt;

    // convert object to json string
    const form_data = JSON.stringify(update_account_obj);  

    // submit form data to api
    fetch('api/update_user.php', {
      method: "POST",
      body: form_data,
      headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }else {
        return response.json().then(text => {throw new Error(text.message);});
      }
    })
    .then(data => {
      // tell the user account was updated
      response_div.innerHTML = "<div class='alert alert-success'>Account was updated.</div>";
      // store new jwt to coookie
      setCookie("jwt", data.jwt, 1);
    })
    .catch((error) => {
      // show error message to user
      if (error.message == "Unable to update user.") {
        response_div.innerHTML = "<div class='alert alert-danger'>Unable to update account.</div>";
      }else if(error.message == "Access denied.")
        showLoginPage();
        response_div.innerHTML = "<div class='alert alert-danger'>Access denied. Please login</div>";
    });
  };
  


  /////////////////////////////// helper function

  // show home page
  function showHomePage(){
  
    // validate jwt to verify access
    const jwt = getCookie('jwt');
    fetch('api/validate_token.php', {
      method: "POST",
      body: JSON.stringify({ jwt:jwt }),
      headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }else {
        throw new Error();
      }
    })
    .then(data => {
        // if valid, show homepage
				const html = `
        <div class="card">
            <div class="card-header">Welcome to Home - ${data.data.firstname} ${data.data.lastname}!</div>
            <div class="card-body">
                <h5 class="card-title">You are logged in.</h5>
                <p class="card-text">You won't be able to access the home and account pages if you are not logged in.</p>
            </div>
        </div>
        `;

        content_div.innerHTML = html;
        showLoggedInMenu();
    })
    .catch((error) => {
      showLoginPage();
      response_div.innerHTML = "<div class='alert alert-danger'>Please login to access the home page.</div>";
    });
  };

  // show home page
  home_btn.addEventListener('click', function(){
    showHomePage();
    clearResponse();
  });

  //logout the user
  logout_btn.addEventListener('click', function(){
    showLoginPage();
    response_div.innerHTML = "<div class='alert alert-info'>You are logged out.</div>";
  });

  // get or read cookie
  function getCookie(cname){
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' '){
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
  };

  // remove any prompt messages
  function clearResponse(){
    response_div.innerHTML = "";
  };

  // function to set cookie
  function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 *1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  };

  // if the user is logged out
  function showLoggedOutMenu(){
    // show login and sign up from navbar & hide logout button
    login_btn.style.display = 'block';
    sign_up_btn.style.display = 'block';
    logout_btn.style.display = 'none';
  };

  // if the user is logged in
  function showLoggedInMenu(){
    // hide login and sign up from navbar & show logout button
    login_btn.style.display = 'none';
    sign_up_btn.style.display = 'none';
    logout_btn.style.display = 'block';
  };


  // serialize to object
  function serialize (data) {
    let obj = {};
    for (let [key, value] of data) {
      if (obj[key] !== undefined) {
        if (!Array.isArray(obj[key])) {
          obj[key] = [obj[key]];
        }
        obj[key].push(value);
      } else {
        obj[key] = value;
      }
    }
    return obj;
  };