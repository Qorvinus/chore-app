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
  renderEditClientClick();
}

function renderHome() {
  $('#js-main-container').html(`
    <section role="section" id="js-dashboard-container" class="dashboard-container">
    <ul id="js-home-clients"></ul>
    <div class="js-error-message"></div>
    </section>
    `);
    getUserInfo();
}

function getUserInfo() {
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
  .then(response => renderHomeClients(response))
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function renderHomeClients(data) {
    const client = data.client;
    const chore = data.chore;
    for (let i = 0; i < client.length; i++) {
      let client_id = client[i].id;
      $('#js-home-clients').append(`
        <li>
          <form class="chore-select">${client[i].name}, Allowance: ${client[i].totalValue}
            <select name="chores" class="drop-down" id="${client[i].id}" required>
            </select>
            <input type="submit" value="Log Chore" class="js-log-chore-button">
          </form>
        </li>
        `);
    };
    populateChores(chore, client);
}

function populateChores(chore, client) {
  client.forEach(function callback(select, idx) {
    if (idx === 0) {
    populateSelect(select, chore);
    };
  });
}

function populateSelect(select, chore) {
  for (let i = 0; i < chore.length; i++) {
    const option = document.createElement('option');
    option.setAttribute('value', chore[i].value);
    option.text = chore[i].choreName;
    const select = document.getElementById(`${select}`);
    select.appendChild(option);
  };
  onChoreSelect(select, chore);
}

function onChoreSelect(select, chore) {
  for (let i = 0; i < chore.length; i++) {
    $('.drop-down').change(function() {
      const selection = document.getElementById(`${select}`);
      const value = select.options[select.selectedIndex].number;
      const client_id = `${select}`;
      submitLogChore(value, client_id);
    })
  }
}

function submitLogChore(value, client_id) {
  $('.js-log-chore-button').on('submit', function(event) {
    event.preventDefault();
    const newTotal = addNewTotalValue(value, client_id);
    const url = `http://localhost:8080/api/users/client/value/${client_id}`;
    const data = {
      id: `${client_id}`,
      totalValue: newTotal
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
    .then(renderHome())
    .catch(err => {
        $('.js-error-message').text(`Something went wrong: ${err.message}`);
      });
  });
}

function addNewTotalValue(value, client_id) {
  const client = getClientInfo(client_id);
  return value + client.totalValue;
}

function renderEditClientClick() {
  $('.js-go-edit-client-button').on('click', function(event) {
    event.preventDefault();
    renderEditClient();
  })
}

function renderEditClient() {
  $('#js-main-container').html(`
    <section role="section" class="edit-client-container" id="js-edit-client-container">
      Needs to be updated
      <div>Clients:</div>
      <form>
        <fieldset>
          <ul id="js-render-clients-list"></ul>
          <input type="button" value="Edit" class="js-client-edit-button">
          <input type="button" value="Delete" class="js-client-delete-button">
        </fieldset>
      </form>
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
  .then(response => renderClient(response.client))
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function renderClient(data) {
  for (let i = 0; i < data.length; i++) {
    $('#js-render-clients-list').append(`
      <li>
      <label">
        <input type="radio" name="clients" value="${data[i]._id}" class="js-client-radio" required />
        <span>${data[i].name}, Total Amount: $${data[i].totalValue}</span>
      </label>
      </li>
      `);
    };
    onClientCheck();
}

function onClientCheck() {
  $('.js-client-radio').change(function() {
    checkClientSelection();
  });
}

function checkClientSelection() {
  let selection = $('input:checked');
  let id = selection.val();
  console.log(id);
  renderEditClientPageClick(id);
  deleteClient(id);
}

function renderEditClientPageClick(client_id) {
  $('.js-client-edit-button').on('click', function(event) {
    event.preventDefault();
    getClientInfo(client_id);
  });
}

function getClientInfo(client_id) {
  const url = `http://localhost:8080/api/users/client/${client_id}`;

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
  .then(response => {
    return response;
  })
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function renderEditClientPage() {
  const data = getClientInfo();

  $('#js-main-container').html(`
    <section role="section" id="js-edit-client-container" class="edit-client-container">
      <p>Add instructions</p>
      <p>Currently editing client: ${data.name}.</p>
      <form id="js-edit-client-name">
        <span>Edit name of client</span>
        <input type="text" value="${data.name}" id="js-edit-client-text">
        <input type="submit" value="Submit" id="js-edit-client-submit">
      </form>
      <span class="js-error-message"></span>
    </section>
    `);
    let client_id = `${data.id}`;
  editClient(client_id);
}

function editClient(client_id) {
  $('#js-edit-client-submit').on('click', function(event) {
    event.preventDefault();
    const editName = $('#js-edit-client-text').val();
    const url = `http://localhost:8080/api/users/client/${client_id}`;

    if (checkClientValue(editName) === true) {
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
    .then(renderEditClient())
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
  } else {
    $('.js-error-messge').text('Name cannot be empty.');
  }
  });
}

function checkClientValue(name) {
  if (name.value.length == 0) {
    return false;
  } else {
    return true;
  };
}

function deleteClient(client_id) {
  $('.js-client-delete-button').on('click', function(event) {
    event.preventDefault();
    const url = `http://localhost:8080/api/users/client/${client_id}`;
    console.log(`Deleting client with id: ${client_id}`);
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(renderEditClient())
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
  });
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
      <form>
        <fieldset>
          <ul id="js-render-chore-list"></ul>
          <input type="button" value="Edit" class="js-chore-edit-button">
          <input type="button" value="Delete" class="js-chore-delete-button">
        </fieldset>
      </form>
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
  .then(response => renderChore(response.chore))
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function renderChore(data) {
  console.log(data);
  for (let i = 0; i < data.length; i++) {
    $('#js-render-chore-list').append(`
      <li>
          <label">
            <input type="radio" name="chores" value="${data[i].id}" class="js-chore-radio" required />
            <span>${data[i].choreName}, Value: $${data[i].value}</span>
          </label>
      </li>
      `);
  };
  onChoreCheck();
}

function onChoreCheck() {
  $('.js-chore-radio').change(function() {
    checkChoreSelection();
  });
}

function checkChoreSelection() {
  let selection = $('input:checked');
  let id = selection.val();
  console.log(id);
  renderEditChorePageClick(id);
  deleteChore(id);
}

function renderEditChorePageClick(chore_id) {
  $('.js-chore-edit-button').on('click', function(event) {
    event.preventDefault();
    getChoreInfo(chore_id);
  });
}

function getChoreInfo(chore_id) {
  const url = `http://localhost:8080/api/users/chore/${chore_id}`;

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
  .then(response => renderEditChorePage(response))
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function renderEditChorePage(data) {
  $('#js-main-container').html(`
    <section role="section" id="js-edit-chore-container" class="edit-chore-container">
      <p>Add instructions</p>
      <p>Currently editing ${data.choreName}.</p>
      <form id="js-edit-chore-prop">
        <span>Edit name of chore</span>
        <input type="text" value="${data.choreName}" id="js-edit-chore-text">
        <span>Edit value of chore</span>
        <input type="number" value="${data.value}" id="js-edit-chore-value-number">
        <input type="submit" value="Submit" id="js-edit-chore-submit">
      </form>
      <span class="js-error-message"></span>
    </section>
    `);
    let chore_id = `${data.id}`;
    editChore(chore_id);
}

function editChore(chore_id) {
  $('#js-edit-chore-submit').on('click', function(event) {
    event.preventDefault();
    const editChore = $('#js-edit-chore-text').val();
    const editValue = $('#js-edit-chore-value-number').val();
    const url = `http://localhost:8080/api/users/chore/${chore_id}`;

    if (checkChoreValues(editChore, editValue) === true) {
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
      .then(renderEditChore())
      .catch(err => {
        $('.js-error-message').text(`Something went wrong: ${err.message}`);
      });
    } else {
      $('.js-error-message').text('Chore name or value cannot be empty.');
    }
  });
}


function checkChoreValues(name, value) {
  if (name.value.length == 0 || value.value.length == 0) {
    return false;
  } else {
    return true;
  };
}

function deleteChore(chore_id) {
  $('.js-chore-delete-button').on('click', function(event) {
    event.preventDefault();
    const url = `http://localhost:8080/api/users/chore/${chore_id}`;
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(renderEditChore())
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
  });
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
