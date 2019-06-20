'use strict';

const apiUrl = 'https://protected-eyrie-51452.herokuapp.com'

function onLoginClick() {
  $('#js-go-login-button').on('click', function(event) {
    event.preventDefault();
    renderLoginPage();
  });
}

function renderLoginPage() {
    $('#js-main-container').html(generateLoginPage());
    onUserLogin();
}

function generateLoginPage() {
  return `
    <section role="section" class="login-container col-8" id="js-login-conatiner">
    <div class="login-center">
      <form id="js-login" class="login">
        <span class="username">User Name:<input id="js-username" type="text" name="username" class="center-input" autofocus></span>
        <span class="password">Password:<input id="js-password" type="password" name="password" class="center-input"></span>
        <input id="js-login-button" class="login-button hover" type="submit" value="Log in">
      </form>
    </div>
    <p class="js-error-message"></p>
    </section>
    `
}

function onUserLogin(username, password) {
  $('#js-login-button').on('click', function(event) {
    event.preventDefault();
    const username = $('#js-username').val();
    const password = $('#js-password').val();

    userLogin(username, password);
  });
}

function userLogin(username, password) {
  const data = {
    username: username,
    password: password
  };

  const url = apiUrl + '/api/auth/login';
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
    throw new Error(res.message);
  })
  .then(response => {
    localStorage.setItem('authToken', response.authToken);
    prepareDashboard();
  })
  .catch(err => renderLoginError(err));
}

function renderLoginError(err) {
  $('.js-error-message').text('Incorrect Username or Password.');
}

function prepareDashboard() {
  setNav();
  renderHome();
  goHomeClick();
  onAddClientClick();
  onAddChoreClick();
  onEditChoreClick();
  onLogOutClick();
}

function onLogOutClick() {
  $('.js-logout').on('click', function(event) {
    event.preventDefault();
    localStorage.clear();
    onLogOut();
  });
}

function onLogOut() {
  const url = apiUrl + '/logout';
  fetch(url, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
      }
  })
  location.reload();
}

function setNav() {
  $('.login-nav').addClass('hidden');
  $('.dashboard-nav').removeClass('hidden');
  $('h1').addClass('hidden');
  $('#logo').addClass('hidden');
}

function renderHome() {
  $('#js-main-container').html(generateRenderHome());
    getUserInfo(renderHomeClients);
    onLogChorePageClick();
    onPayPageClick();
}

function onClientDelete() {
  $('.client-delete-img').on('click', function(event) {
    event.preventDefault();
    let id = $(this).val();
    deleteClient(id);
  })
}

function onClientEdit() {
  $('.client-edit-img').on('click', function(event) {
    event.preventDefault();
    let id = $(this).val();
    getClientInfo(id, renderEditClientPage);
  })
}

function generateRenderHome() {
  return `
    <section role="section" id="js-dashboard-container" class="dashboard-container col-8">
    <p>On the home page you can select a client and choose to either log new chores to them or pay out an allowance.</p>
      <p>Clients:</p>
      <form>
        <fieldset>
          <ul id="js-render-clients-home"></ul>
          <input type="button" value="Log Chore" id="js-log-chore-page-button" class="hover button">
          <input type="button" value="Pay Allowance" id="js-pay-allowance-page-button" class="hover button">
        </fieldset>
      </form>
      <p class="js-error-message"></p>
    </section>
    `
}

function getUserInfo(callback) {
  const url = apiUrl + '/api/users/user';

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
  .then(response => callback(response))
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function renderHomeClients(data) {
    const client = data.client;
    if (client.length == 0) {
      renderStartPage();
    } else {
      generateRenderHomeclients(data);
      onClientDelete();
      onClientEdit();
    }
}

function renderStartPage() {
  $('#js-main-container').html(generateStartPage());
}

function generateStartPage() {
  return `
  <section role="section" id="js-start-container" class="start-container col-8">
  <p>Welcome to Pay ME!  In the navigation bar you will find "Home", "Add Clients", "Add Chores", "Edit Chores" and "Logout".  </p>
        <ul id="js-instructions">
          <li>
            <span class="bold">Home:</span> This is where you'll log chores and pay out allowances.  Once you're set up this is where you'll spend most of your time, logging chores and paying out allowances.
          </li>
          <li>
            <span class="bold">Add Clients:</span> This is where you can add new clients.
          </li>
          <li>
            <span class="bold">Add Chores:</span> Here you can add chores and give them their respective dollar value.
          </li>
          <li>
            <span class="bold">Edit Chores:</span> You can edit the chore name and the value.
          </li>
        </ul>
        <p>We recommend you start off by adding clients then chores, we hope you enjoy Pay ME! and find it useful.</p>
    <p class="js-error-message"></p>
  </section>
  `
}

function generateRenderHomeclients(data) {
    const client = data.client;
    const chore = data.chore;
    for (let i = 0; i < client.length; i++) {
      let totalValue = parseFloat(`${client[i].totalValue}`).toFixed(2);
      $('#js-render-clients-home').append(`
        <li>
        <label>
          <input type="radio" name="clients" value="${client[i]._id}" class="js-clients-home-radio" required />
            <span>${client[i].name}, Allowance: $${totalValue}</span>
            <input type="image" src="/images/edit.png" alt="edit" class="client-edit-img hover" value="${client[i]._id}" />
            <input type="image" src="/images/delete.png" alt="delete" class="client-delete-img hover" value="${client[i]._id}" />
        </label>
        </li>
        `);
    };
}

function onLogChorePageClick(client_id) {
  $('#js-log-chore-page-button').on('click', function(event) {
    event.preventDefault();
    const selection = $('input:checked');
    const id = selection.val();
    getClientInfo(id, renderLogChorePage);
  });
}

function getClientInfo(client_id, callback) {
  const url = apiUrl + `/api/users/client/${client_id}`;

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
  .then(response => callback(response))
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function renderLogChorePage(data) {
  console.log(data);
  const client_id = data.id;
  const totalValue = data.totalValue;
  $('#js-main-container').html(generateLogChorePage(data))
    getUserInfo(populateChores);
    submitLogChore(client_id, totalValue);
}

function generateLogChorePage(data) {
  return `
    <section role="section" id="js-log-chore-container" class="log-chore-container col-8">
      <p>Please select a chore to log for the selected client.</p>
      <p>Adding a new chore log to ${data.name}.</p>
      <form>
        <fieldset>
          <label for="select-chore">Select chore to add:</label>
            <select name="select-chore" id="js-chore-select" class="drop-down" required>
            <option value="selectChore" selected>Select Chore</option>
            </select>
            <input type="submit" value="Log Chore" id="js-log-chore-button" class="log-chore-button hover button">
          </fieldset>
      </form>
      <p class="js-error-message"></p>
    </section>
    `;
}

function populateChores(response) {
  let data = response.chore;
  for (let i = 0; i < data.length; i++) {
    const option = document.createElement('option');
    option.setAttribute('value', data[i].value);
    option.text = data[i].choreName;
    const select = document.getElementById('js-chore-select');
    select.appendChild(option);
  };
}

function submitLogChore(client_id, totalValue) {
  $('#js-log-chore-button').on('click', function(event) {
    event.preventDefault();
    const select = document.getElementById('js-chore-select');
    let value = select.options[select.selectedIndex].value;

    if (value === 'selectChore') {
      $('.js-error-message').text('Please select a chore.');
    } else {
      const newTotal = parseFloat(value) + parseFloat(totalValue);
      addTotalValue(client_id, newTotal)
    };
  });
}

function addTotalValue(client_id, newTotal) {
  const url = apiUrl + `/api/users/client/value/${client_id}`;
  const data = {
    id: client_id,
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
  .then(getClientInfo(client_id, logAnotherChore))
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
      console.log(err.message);
    });
}

function logAnotherChore(data) {
  $('#js-log-chore-container').html(generateLogAnotherChore(data));
    onLogAnotherClick(data);
    onSwitchClient();
}

function generateLogAnotherChore(data) {
  return `
    <p>${data.name} now has a total allowance of: $${data.totalValue}</p>
    <input type="button" value="Log another chore?" id="js-log-another-button" class="hover button">
    <input type="button" value="Switch client?" id="js-switch-client-button" class="hover button">
    `
}

function onSwitchClient() {
  $('#js-switch-client-button').on('click', function(event) {
    event.preventDefault();
    renderHome();
  });
}

function onLogAnotherClick(data) {
  $('#js-log-another-button').on('click', function(event) {
    event.preventDefault();
    renderLogChorePage(data);
  });
}

function onPayPageClick() {
  $('#js-pay-allowance-page-button').on('click', function(event) {
    event.preventDefault();
    const selection = $('input:checked');
    const id = selection.val();
    getClientInfo(id, renderPayPage);
  });
}

function getClientInfo(client_id, callback) {
  const url = apiUrl + `/api/users/client/${client_id}`;

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
  .then(response => callback(response))
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function renderPayPage(data) {
  const client_id = data.id;
  const totalValue = data.totalValue;
  const name = data.name;
  $('#js-main-container').html(generateRenderPayPage(data));
    onPayAllowanceClick(client_id, totalValue, name);
}

function generateRenderPayPage(data) {
  return `
    <section role="section" id="js-pay-allowance-container" class="pay-allowance-container col-8">
      <p>Please enter an amount of equal or lesser value to pay out to the selected client.</p>
      <p>Pay out allowance to ${data.name}.  Current total allowance available is $${data.totalValue}.</p>
      <form>
        <label for="allowance">Enter amount to payout:</label>
          <input type="number" value="0" id="js-pay-allowance-text" autofocus required>
          <input type="submit" value="Pay Allowance" id="js-pay-allowance-button" class="pay-allowance-button hover button">
      </form>
      <p class="js-error-message"></p>
    </section>
    `
}

function onPayAllowanceClick(client_id, totalValue, name) {
  $('#js-pay-allowance-button').on('click', function(event) {
    event.preventDefault();
    const value = $('#js-pay-allowance-text').val();
    checkPayAmount(value, client_id, totalValue, name);
  });
}

function checkPayAmount(value, client_id, totalValue, name) {
  if (value.length == 0 || value > totalValue) {
    $('.js-error-message').text('Amount of allowance paid cannot be empty or cannot be more than the total Allowance.');
  } else {
    const newTotal = parseFloat(totalValue).toFixed(2) - parseFloat(value).toFixed(2);
    subtractClientTotal(client_id, newTotal, value, name);
  };
}

function subtractClientTotal(client_id, newTotal, value, name) {
  const url = apiUrl + `/api/users/client/value/${client_id}`;
  const data = {
    id: `${client_id}`,
    totalValue: `${newTotal}`
  }

  fetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      'Content-Type': 'application/json'
    }
  })
  .then(renderAfterPay(value, name))
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function renderAfterPay(value, name) {
  const amount = parseFloat(`${value}`).toFixed(2);
  $('#js-main-container').html(generateAfterPay(amount, name));
  okPaidClick();
}

function generateAfterPay(amount, name) {
  return `
    <section role="section" id="js-paid-container" class="paid-container col-8">
      <p>You have paid out $${amount} to ${name}.  Don't forget to pay them!</p>
      <button type="button" id="js-paid-ok-button" class="hover button">OK</button>
    </section>
  `
}

function okPaidClick() {
  $('#js-paid-ok-button').on('click', function(event) {
    event.preventDefault();
    renderHome();
  });
}

// function onEditClientClick() {
//   $('.js-go-edit-client-button').on('click', function(event) {
//     event.preventDefault();
//     renderEditClient();
//   })
// }

// function renderEditClient() {
//   $('#js-main-container').html(generateRenderEditClient());
//     getUserInfo(renderClient);
//     onClientCheck();
// }

// function generateRenderEditClient() {
//   return `
//     <section role="section" class="edit-client-container col-8" id="js-edit-client-container">
//       <p>Select a client to either edit or delete.</p>
//       <div>Clients:</div>
//       <form>
//         <fieldset>
//           <ul id="js-render-clients-list"></ul>
//           <input type="button" value="Edit" class="js-client-edit-button hover button">
//           <input type="button" value="Delete" class="js-client-delete-button hover">
//         </fieldset>
//       </form>
//       <p class="js-error-message"></p>
//     </section>
//     `
// }

// function renderClient(response) {
//   const data = response.client;
//   for (let i = 0; i < data.length; i++) {
//     let totalValue = parseFloat(`${data[i].totalValue}`).toFixed(2);
//     $('#js-render-clients-list').append(`
//       <li>
//       <label>
//         <input type="radio" name="clients" value="${data[i]._id}" class="js-client-radio" required />
//         <span>${data[i].name}, Total Amount: $${totalValue}</span>
//       </label>
//       </li>
//       `);
//     };
// }

// function onClientCheck() {
//   $('#js-render-clients-list').change('.js-client-radio', function() {
//     checkClientSelection();
//   });
// }
//
// function checkClientSelection() {
//   let selection = $('input:checked');
//   let id = selection.val();
//   onEditClientPageClick(id);
//   onDeleteClient(id);
// }

// function onEditClientPageClick(client_id) {
//   $('.js-client-edit-button').on('click', function(event) {
//     event.preventDefault();
//     getClientInfo(client_id, renderEditClientPage);
//   });
// }

function renderEditClientPage(data) {
  const client_id = data.id;
  $('#js-main-container').html(generateRenderEditClientPage(data));
  editClientSubmit(client_id);
}

function generateRenderEditClientPage(data) {
  return `
    <section role="section" id="js-edit-client-container" class="edit-client-container col-8">
      <p>Enter the clients updated name.</p>
      <p>Currently editing client: ${data.name}.</p>
      <form id="js-edit-client-name">
        <span>Edit name of client</span>
        <input type="text" value="${data.name}" id="js-edit-client-text" autofocus>
        <input type="submit" value="Submit" id="js-edit-client-submit" class="hover button">
      </form>
      <p class="js-error-message"></p>
    </section>
    `
}

function editClientSubmit(client_id) {
  $('#js-edit-client-submit').on('click', function(event) {
    event.preventDefault();
    const editName = $('#js-edit-client-text').val();

    if (checkClientValue(editName) === false) {
      updateClient(client_id, editName);
  } else {
    $('.js-error-message').text('Name cannot be empty.');
  }
  });
}

function updateClient(client_id, editName) {
  const url = apiUrl + `/api/users/client/${client_id}`;
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
  .then(renderHome())
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function checkClientValue(name) {
  return name.length == 0;
}

// function onDeleteClient(client_id) {
//   $('.js-client-delete-button').on('click', function(event) {
//     event.preventDefault();
//     deleteClient(client_id);
//   });
// }

function deleteClient(client_id) {
    const url = apiUrl + `/api/users/client/${client_id}`;

    fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(renderHome())
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function goHomeClick() {
  $('.js-go-home-button').on('click', function(event) {
    event.preventDefault();
    renderHome();
  });
}

function onAddClientClick() {
  $('.js-go-add-client-button').on('click', function(event) {
    event.preventDefault();
    renderAddClient();
  });
}

function renderAddClient() {
    $('#js-main-container').html(generateRenderAddClient());
    addClientClick();
  }

function generateRenderAddClient() {
  return `
    <section role="section" id="js-add-client-container" class="add-client-container col-8">
      <p>Enter the name of your new client.</p>
      <form id="js-add-client-form">
      <fieldset>
        <span>Name:</span>
        <input type="text" id="js-add-client-text" autofocus>
        <input type="submit" value="Add" id="js-add-client-button" class="hover button">
      </fieldset>
      </form>
      <p class="js-error-message"></p>
    </section>
    `
}

function addClientClick() {
  $('#js-add-client-button').on('click', function(event) {
    event.preventDefault();
    const newName = $('#js-add-client-text').val();

    if (checkNewClientName(newName) === true) {
      $('.js-error-message').text('Name cannot be empty');
    } else {
      addClient(newName);
    };
  });
}

function addClient(newName) {
  const url = apiUrl + '/api/users/client';
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
}

function checkNewClientName(newName) {
  return newName.length == 0;
}

function renderNewClient(response) {
  $('#js-add-client-container').html(generateRenderNewClient(response));
  addAnotherClient();
}

function generateRenderNewClient(response) {
  return `
    <p>${response.name} has been successfully created!</p><input type="submit" id="js-add-another-client-button" value="Add another?" class="hover button">
    <p class="js-error-message"></p>
    `
}

function addAnotherClient() {
  $('#js-add-another-client-button').on('click', function(event) {
    event.preventDefault();
    renderAddClient();
  });
}

function onAddChoreClick() {
  $('.js-go-add-chore-button').on('click', function(event) {
    event.preventDefault();
    renderAddChore();
  });
}

function renderAddChore() {
    $('#js-main-container').html(generateRenderAddChore());
    addChoreClick();
}

function generateRenderAddChore() {
  return `
    <section role="section" id="js-add-chore-container" class="add-chore-container col-8">
      <p>Enter the name of the new chore as well as the respective value for the chore.</p>
      <form id="js-add-chore-form">
      <fieldset>
        <span>Name of chore:</span>
        <input type="text" id="js-add-chore-text" autofocus>
        <span>Value of chore:</span>
        <input type="number" id="js-add-chore-value-number">
        <input type="submit" value="Add" id="js-add-chore-button" class="hover button">
        </fieldset>
      </form>
      <p class="js-error-message"></p>
    </section>
    `
}

function addChoreClick() {
  $('#js-add-chore-button').on('click', function(event) {
    event.preventDefault();
    const newChore = $('#js-add-chore-text').val();
    const newValue = $('#js-add-chore-value-number').val();

    if (checkNewChore(newChore, newValue) === false) {
      $('.js-error-message').text('Chore and/or Value cannot be empty.');
    } else {
      addChore(newChore, newValue);
    };
  });
}

function addChore(newChore, newValue) {
  const url = apiUrl + '/api/users/chore';
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
}

function checkNewChore(newChore, newValue) {
  if (newChore.length == 0 || newValue.length == 0) {
    return false;
  } else {
    return true;
  };
}

function renderNewChore(response) {
  $('#js-add-chore-container').html(generateRenderNewChore(response));
  addAnotherChore();
}

function generateRenderNewChore(response) {
  return `
    <p>${response.choreName} has been successfully created, with a value of $${response.value}!</p><input type="submit" id="js-add-another-chore-button" value="Add another?" class="hover button">
    <p class="js-error-message"></p>
    `
}

function addAnotherChore() {
  $('#js-add-another-chore-button').on('click', function(event) {
    event.preventDefault();
    renderAddChore();
  });
}

function onEditChoreClick() {
  $('.js-go-edit-chore-button').on('click', function(event) {
    event.preventDefault();
    renderEditChore();
  });
}

function renderEditChore() {
  $('#js-main-container').html(generateRenderEditChore());
    getUserInfo(renderChore);
    onChoreCheck();
}

function generateRenderEditChore() {
  return `
    <section role="section" id="js-edit-chore-list-container" class="edit-chore-list-container col-8">
      <p>Select a chore that you wish to edit or delete.</p>
      <div>List of chores:</div>
      <form>
        <fieldset>
          <ul id="js-render-chore-list"></ul>
          <input type="button" value="Edit" class="js-chore-edit-button hover button">
          <input type="button" value="Delete" class="js-chore-delete-button hover">
        </fieldset>
      </form>
      <p class="js-error-message"></p>
    </section>
    `
}

function renderChore(response) {
  const data = response.chore;
  for (let i = 0; i < data.length; i++) {
    let value = parseFloat(`${data[i].value}`).toFixed(2);
    $('#js-render-chore-list').append(`
      <li>
          <label">
            <input type="radio" name="chores" value="${data[i]._id}" class="js-chore-radio" required />
            <span>${data[i].choreName}, Value: $${value}</span>
          </label>
      </li>
      `);
  };
}

function onChoreCheck() {
  $('#js-render-chore-list').change('.js-chore-radio', function() {
    checkChoreSelection();
  });
}

function checkChoreSelection() {
  let selection = $('input:checked');
  let id = selection.val();
  onEditChorePageClick(id);
  deleteChore(id);
}

function onEditChorePageClick(chore_id) {
  $('.js-chore-edit-button').on('click', function(event) {
    event.preventDefault();
    getChoreInfo(chore_id, renderEditChorePage);
  });
}

function getChoreInfo(chore_id, callback) {
  const url = apiUrl + `/api/users/chore/${chore_id}`;

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
  .then(response => callback(response))
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function renderEditChorePage(data) {
  $('#js-main-container').html(generateEditChorePage(data));
    let chore_id = `${data.id}`;
    editChoreClick(chore_id);
}

function generateEditChorePage(data) {
  return `
    <section role="section" id="js-edit-chore-container" class="edit-chore-container col-8">
      <p>Here you can update the name of the chore as well as how much the chore's value.</p>
      <p>Currently editing ${data.choreName}.</p>
      <form id="js-edit-chore-prop">
        <span>Edit name of chore</span>
        <input type="text" value="${data.choreName}" id="js-edit-chore-text" autofocus>
        <span>Edit value of chore</span>
        <input type="number" value="${data.value}" id="js-edit-chore-value-number">
        <input type="submit" value="Submit" id="js-edit-chore-submit" class="hover button">
      </form>
      <p class="js-error-message"></p>
    </section>
    `
}

function editChoreClick(chore_id) {
  $('#js-edit-chore-submit').on('click', function(event) {
    event.preventDefault();
    const updatedChore = $('#js-edit-chore-text').val();
    const updatedValue = $('#js-edit-chore-value-number').val();

    if (checkEditChore(updatedChore, updatedValue) === false) {
        $('.js-error-message').text('Chore name or value cannot be empty.');
    } else {
      editChore(chore_id, updatedChore, updatedValue);
    }
  });
}

function editChore(chore_id, updatedChore, updatedValue) {
  const url = apiUrl + `/api/users/chore/${chore_id}`;
  const data = {
    id: chore_id,
    choreName: updatedChore,
    value: updatedValue
  }

  fetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      'Content-Type': 'application/json'
    }
  })
  .then(renderEditChore())
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function checkEditChore(name, value) {
  if (name.length == 0 || value.length == 0) {
    return false;
  } else {
    return true;
  };
}

function deleteChore(chore_id) {
  $('.js-chore-delete-button').on('click', function(event) {
    event.preventDefault();
    const url = apiUrl + `/api/users/chore/${chore_id}`;
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

function onSignUpClick() {
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
    <section role="section" class="signup-container col-8" id="js-signup-container">
    <div class="signup-center">
      <form id="js-signup-form" class="signup-form">
        <fieldset>
          <span class="block">First Name:</span>
          <input type="text" id="js-firstname-signup" class="center-input" autofocus>
          <span class="block">Last Name:</span>
          <input type="text" id="js-lastname-signup" class="center-input">
          <span class="block">User Name:</span>
          <input type="text" id="js-username-signup" class="center-input">
          <span class="block">Password:</span>
          <input type="password" id="js-password-signup" class="center-input">
          <input id="js-signup-button" type="submit" value="Sign-Up!"  class="hover button">
        </fieldset>
      </form>
    </div>
      <p class="js-error-message"></p>
    </section>
    `);
    signUpClick();
}

function signUpClick() {
  $('#js-signup-button').on('click', function(event) {
    event.preventDefault();
    const firstName = $('#js-firstname-signup').val();
    const lastName = $('#js-lastname-signup').val();
    const username = $('#js-username-signup').val();
    const password = $('#js-password-signup').val();
    const names = {
      'First Name': firstName,
      'Last Name': lastName,
      'User Name': username,
      'password': password
    }
    if (checkNames(names) === true) {
      if (checkPass(names.password) === true) {
        signUp(firstName, lastName, username, password);
      } else {
        $('.js-error-message').text('Password must be at least 8 characters long.')
      };
    } else {
      let missing = checkNames(names);
      $('.js-error-message').text(`${missing} cannot be empty.`)
    }
  })
}


function checkNames(names) {
  let missing = [];
  Object.keys(names).forEach(function(el) {
    if (names[el].length == 0) {
      missing.push(el);
    }
  });
  if (missing.length == 0) {
    return true;
  } else {
    return missing;
  }
}

function checkPass(data) {
  if (data.length < 8) {
    return false;
  } else {
    return true;
  }
}

function signUp(firstName, lastName, username, password) {
  const data = {
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: password

  }
  const url = apiUrl + '/api/users/signup';
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(res => {
    if (res.ok) {
      renderLoginPage();
    } else {
      $('.js-error-message').text('Username is already taken.')
    }
  })
  .catch(err => console.error('Error', err));
}

function onDemoClick() {
  $('#js-demo-button').on('click', function(event) {
    event.preventDefault();
      const username = 'demo';
      const password = 'password';
    demoLogin(username, password);
  })
}

function demoLogin(username, password) {
  const data = {
    username: username,
    password: password
  };

  const url = apiUrl + '/api/auth/login';
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
    localStorage.setItem('authToken', response.authToken);
    renderDemoWelcome();
  })
  .catch(err => console.error('Error', err));
}

function renderDemoWelcome() {
  $('#js-main-container').html(generateDemoWelcome());
  setNav();
  onGotItClick();
}

function generateDemoWelcome() {
  return `
  <section role="section" id="js-demo-welcome-container" class="demo-welcome-container col-8">
  <p>Welcome to Pay ME!  In the navigation bar you will find "Home", "Add Clients", "Add Chores", "Edit Chores" and "Logout".  </p>
        <ul id="js-instructions">
          <li>
            <span class="bold">Home:</span> This is where you'll log chores and pay out allowances.  Once you're set up this is where you'll spend most of your time, logging chores and paying out allowances.
          </li>
          <li>
            <span class="bold">Add Clients:</span> This is where you can add new clients.
          </li>
          <li>
            <span class="bold">Add Chores:</span> Here you can add chores and give them their respective dollar value.
          </li>
          <li>
            <span class="bold">Edit Chores:</span> You can edit the chore name and the value.
          </li>
        </ul>
        <div class="center">
        <button type="button" id="js-ok-button" class="hover button">Ok, got it!</button>
        </div>
    <p class="js-error-message"></p>
  </section>
  `
}

function onGotItClick() {
  $('#js-ok-button').on('click', function(event) {
    event.preventDefault();
    prepareDashboard();
  });
}

function checkForToken() {
  if (localStorage.getItem('authToken') !== null) {
    prepareDashboard();
  };
}

$(function() {
  onLoginClick();
  onSignUpClick();
  onDemoClick();
  logoClick();
  checkForToken();
})
