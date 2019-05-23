'use strict';

// const CHORES = {};
// const CLIENTS = {};
//
// function getClients(callback) {
//   setTimeout(function() {
//     callback(CLIENTS)
//   }, 1);
// }
//
// function getChores(callback) {
//   setTimeout(function() {
//     callback(CHORES)
//   }, 1);
// }

// function renderClients(data) {
//   for (let i = 0; i < data.clients.length; i++) {
//     $('#js-render-clients').append(`<input type="button" value="${data.clients[i].name}">`);
//   };
// }
//
// function renderChores(data) {
//   for (let i = 0; i < data.chores.length; i++) {
//     $('#js-render-chores').append(`<li>${data.chores[i].chore}: $${data.chores[i].value}`)
//   }
// }
//
// function getAndRenderClients() {
//   getClients(renderClients);
// }
//
// function getAndRenderChores() {
//   getChores(renderChores);
// }

function renderLoginClick() {
  $('#js-go-login-button').on('click', function(event) {
    event.preventDefault();
    renderLogin();
  });
}

function renderLogin() {
    $('#js-main-container').html(`
      <section role="section" class="login-container" id="js-login-conatiner">
        <form id="js-login" class="login">
          <span class="username">User Name:<input id="js-username" type="text" name="username"></span>
          <span class="password">Password:<input id="js-password" type="password" name="password"></span>
          <input id="js-login-button" class="login-button" type="submit" value="Log in">
        </form>
      </section>
      `);
    userLogin();
  }

function userLogin(username, password) {
  $('#js-login-button').on('click', function(event) {
    event.preventDefault();
    const username = $('#js-username').val();
    const password = $('#js-password').val();

    const data = {
      username: username,
      password: password
    };

    const url = 'http://localhost:8080/api/auth/login';
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(response => {
      localStorage.setItem('authToken', response.authToken)
      renderDashboard()
    })
    .catch(err => console.error('Error', err));
  });
}

function renderDashboard() {
  $('.login-nav').addClass('hidden');
  $('.dashboard-nav').removeClass('hidden');
  renderHome();
  goHomeClick();
  renderAddClientClick();
  renderAddChoreClick();
  renderEditChoreClick();
}

function renderHome() {
  $('#js-main-container').html(`
    <section role="section" class="dashboard-container" id="js-dashboard-container">
      Needs to be updated
      <div>Clients:</div>
      <ul id="js-render-clients-list"></ul>
      <span class="js-error-message"></span>
    </section>
    `);
    getClient();
}

function getClient() {
  const url = 'http://localhost:8080/api/users/client';

  fetch(url, {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
  })
  .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
  .then(response => renderClient(response))
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function renderClient(data) {
  console.log(data);
  console.log('Made it to renderClient');
  for (let i = 0; i < data.length; i++) {
    $('#js-render-clients-list').append(`
      <li>${data[i].name}, Total Amount: ${data[i].totalVlue}</span class="-hidden">${data[i].id}</span><input type="button" value="Edit" class="js-client-edit-button"><input type="button" value="Delete" class="js-client-delete-button"></li>
      `);
      let id = data[i].id;
      let name = data[i].name;
      renderEditClient(id, name);
      deleteClient(id);
  };
}

function renderEditClient(client_id, name) {
  $('.js-client-edit-button').on('click', function(event) {
    event.preventDefault();
    $('#js-main-container').html(`
      <section role="section" id="js-edit-client-container" class="edit-client-container hidden">
        <p>Add instructions</p>
        <p>Currently editing client: ${name}.</p>
        <form id="js-edit-client-name">
          <span>Edit name of client</span>
          <input type="text" value="" id="js-edit-client-text">
          <input type="submit" value="Submit" id="js-edit-client-submit">
        </form>
        <span class="js-error-message"></span>
      </section>
      `);
    editClient(client_id);
  });
}

function editClient(client_id) {
  $('#js-edit-client-submit').on('click', function(event) {
    event.preventDefault();
    const editName = $('#js-edit-client-text').val();
    const url = `http://localhost:8080/api/users/client/${client_id}`;
    const data = {
      id: client_id,
      name: editName
    }

    fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(reloadClient())
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
  });
}

function deleteClient(client_id) {
  $('.js-client-delete-button').on('click', function(event) {
    event.preventDefault();
    const url = `http://localhost:8080/api/users/client/${client_id}`;

    fetch(url, {
      method: 'DELETE',
      body: {
        id: client_id
      },
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(reloadClient())
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
  });
}

function reloadClient() {
  $('#js-render-clients-list').empty();
  getClient();
}

function goHomeClick() {
  $('.js-go-home-button').on('click', function(event) {
    event.preventDefault();
    renderHome();
  });
}

function renderAddClientClick() {
  $('.js-go-add-client-button').on('click', function(event) {
    event.preventDefault();
    renderAddClient();
  });
}


function renderAddClient() {
    $('#js-main-container').html(`
      <section role="section" id="js-add-client" class="add-client-container">
        <p>Add instructions</p>
        <form id="js-add-client-form">
          <span>Name of client:</span>
          <input type="text" id="js-add-client-text">
          <input type="submit" value="add" id="js-add-client-button">
        </form>
        <div id="js-render-client-success"></div>
        <span class="js-error-message"></span>
      </section>
      `)
    addClient();
  }

function addClient() {
  $('#js-add-client-button').on('click', function(event) {
    event.preventDefault();
    const newName = $('#js-add-client-text').val();
    const url = 'http://localhost:8080/api/users/client';
    const data = {
      name: newName
    }
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(response => renderNewClient(response))
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
  });
}

function renderNewClient(response) {
  console.log(response);
  $('#js-render-client-success').html(`
    <p>${response.name} has been successfully created!</p><input type="button" id="js-add-another-client-button" value="Add another?">
    <span class="js-error-message"></span>
    `)
  document.getElementById('js-add-client-text').value = "";
  addAnotherClient();
}

function addAnotherClient() {
  $('#js-add-another-client-button').on('click', function(event) {
    event.preventDefault();
    renderAddClient();
  });
}

function renderAddChoreClick() {
  $('.js-go-add-chore-button').on('click', function(event) {
    event.preventDefault();
    renderAddChore();
  });
}

function renderAddChore() {
    $('#js-main-container').html(`
      <section role="section" id="js-add-chore-container" class="add-chore-container">
        <p>Add instructions</p>
        <form id="js-add-chore-form">
          <span>Name of chore:</span>
          <input type="text" id="js-add-chore-text">
          <span>Value of chore:</span>
          <input type="number" id="js-add-chore-value-number">
          <input type="submit" value="add" id="js-add-chore-button">
        </form>
        <span class="js-error-message"></span>
        <div id="js-render-chore-success"></div>
      </section>
      `);
    addChore();
}

function addChore() {
  $('#js-add-chore-button').on('click', function(event) {
    event.preventDefault();
    const newChore = $('#js-add-chore-text').val();
    const newValue = $('#js-add-chore-value-number').val();
    const url = 'http://localhost:8080/api/users/chore';
    const data = {
        choreName: newChore,
        value: newValue
    }

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(response => renderNewChore(response))
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
  });
}

function renderNewChore(response) {
  $('#js-render-chore-success').html(`
    <p>${response.choreName} has been successfully created, with a value of $${response.value}!</p><input type="button" id="js-add-another-chore-button" value="Add another?">
    <span class="js-error-message"></span>
    `);
  document.getElementById('js-add-chore-text').value = "";
  document.getElementById('js-add-chore-value-number').value = "";
  addAnotherChore();
}

function addAnotherChore() {
  $('#js-add-another-chore-button').on('click', function(event) {
    event.preventDefault();
    renderAddChore();
  });
}

function renderEditChoreClick() {
  $('.js-go-edit-chore-button').on('click', function(event) {
    event.preventDefault();
    renderEditChore();
  });
}

function renderEditChore() {
  $('#js-main-container').html(`
    <section role="section" id="js-edit-chore-list-container" class="edit-chore-list-container">
      <p>Add instructions</p>
      <div>List of chores:</div>
      <ul id="js-chore-list" class=""></ul>
      <span class="js-error-message"></span>
    </section>
    `)
    getChore();
}

function getChore() {
  const url = 'http://localhost:8080/api/users/chore';

  fetch(url, {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
  })
  .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
  .then(response => renderChore(response))
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function renderChore(data) {
  console.log(data);
  for (let i = 0; i < data.length; i++) {
    $('#js-chore-list').append(`<li>${data[i].choreName}, $${data[i].value}<span class="-hidden">${data[i].id}</span><input type="button" value="Edit" class="js-chore-edit-button"><input type="button" value="Delete" class="js-chore-delete-button"></li>`);
    let id = $(this).id;
    let name = $(this).choreName;
    renderEditChorePage(id, name);
    deleteChore(id);
  };
}

function renderEditChorePage(chore_id, choreName) {
  $('.js-chore-edit-button').on('click', function(event) {
    event.preventDefault();
    $('#js-main-container').html(`
      <section role="section" id="js-edit-chore-container" class="edit-chore-container">
        <p>Add instructions</p>
        <p>Currently editing ${choreName}.</p>
        <form id="js-edit-chore-prop">
          <span>Edit name of chore</span>
          <input type="text" value="" id="js-edit-chore-text">
          <span>Edit value of chore</span>
          <input type="number" value="" id="js-edit-chore-value-number">
          <input type="submit" value="Submit" id="js-edit-chore-submit">
        </form>
        <span class="js-error-message"></span>
      </section>
      `);
    editChore(chore_id);
  });
}

function editChore(chore_id) {
  $('#js-edit-chore-submit').on('click', function(event) {
    event.preventDefault();
    const editChore = $('#js-edit-chore-text').val();
    const editValue = $('#js-edit-chore-value-number').val();
    const url = `http://localhost:8080/api/users/client/${chore_id}`;
    const data = {
      id: chore_id,
      choreName: editChore,
      value: editValue
    }

    fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(reloadChore())
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
  });
}

function deleteChore(chore_id) {
  $('.js-chore-delete-button').on('click', function(event) {
    event.preventDefault();
    const url = `http://localhost:8080/api/users/chore/${chore_id}`;
    const data = {
      id: chore_id
    }
    fetch(url, {
      method: 'DELETE',
      body: JSON.stringify(data),
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(response => reloadChore())
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
  });
}

function reloadChore(response) {
  $('#js-chore-list').empty();
  getChore();
}

function renderSignUpClick() {
  $('#js-go-signup-button').on('click', function(event) {
    event.preventDefault();
    renderSignUp();
  });
}

function logoClick() {
  $('#logo').on('click', function(event) {
    event.preventDefault();
    location.reload()
  });
}

function renderSignUp() {
  $('#js-main-container').html(`
    <section role="section" class="signup-container" id="js-signup-container">
      <form id="js-signup-form">
        <span class="block">First Name:</span>
        <input type="text" id="js-firstname-signup">
        <span class="block">Last Name:</span>
        <input type="text" id="js-lastname-signup">
        <span class="block">User Name:</span>
        <input type="text" id="js-username-signup">
        <span class="block">Password:</span>
        <input type="password" id="js-password-signup">
        <input id="js-signup-button" type="submit" value="Sign-Up!">
      </form>
      <span class="js-error-message"></span>
    </section>
    `);
    signUp();
}

function signUp() {
  $('#js-signup-button').on('click', function(event) {
    event.preventDefault();
    const firstName = $('#js-firstname-signup').val();
    const lastName = $('#js-lastname-signup').val();
    const username = $('#js-username-signup').val();
    const password = $('#js-password-signup').val();
    //add validation(ideally both)
    const data = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      password: password

    }
    const url = 'http://localhost:8080/api/users/signup';
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(renderLogin())
    .catch(err => console.error('Error', err));
  });
}

$(function() {
  renderLoginClick();
  renderSignUpClick();
  logoClick();
})
