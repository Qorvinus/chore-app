'use strict';

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
          <input id="js-login-button" class="login-button hover" type="submit" value="Log in">
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
  $('h1').addClass('hidden');
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
      <div>Clients:</div>
      <form>
        <fieldset>
          <ul id="js-render-clients-home"></ul>
          <input type="button" value="Log Chore" id="js-log-chore-page-button" class="hover">
          <input type="button" value="Pay Allowance" id="js-pay-allowance-page-button" class="hover">
        </fieldset>
      </form>
      <span class="js-error-message"></span>
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
      let totalValue = parseFloat(`${client[i].totalValue}`).toFixed(2);
      $('#js-render-clients-home').append(`
        <li>
        <label>
          <input type="radio" name="clients" value="${client[i]._id}" class="js-clients-home-radio" required />
            <span>${client[i].name}, Allowance: $${totalValue}</span>
        </label>
        </li>
        `);
    };
    onClientHomeCheck();
}

function onClientHomeCheck() {
  $('.js-clients-home-radio').change(function() {
    checkClientHomeSelection();
  });
}

function checkClientHomeSelection() {
  let selection = $('input:checked');
  let id = selection.val();
  renderLogChorePageClick(id);
  renderPayPageClick(id);
}

function renderLogChorePageClick(client_id) {
  $('#js-log-chore-page-button').on('click', function(event) {
    event.preventDefault();
    getClientInfoLog(client_id, renderLogChorePage);
  });
}


//pass function to call getClientInfo as a parameter, it will then callback
function getClientInfoLog(client_id, callback) {
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
  .then(response => callback(response))
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function renderLogChorePage(data) {
  const client_id = data.id;
  const totalValue = data.totalValue;
  $('#js-main-container').html(`
    <section role="section" id="js-log-chore-container" class="log-chore-container">
      <p>Add instructions</p>
      <p>Adding a new chore log to ${data.name}.</p>
      <form>
        <label for="select-chore">Select chore to add:</label>
          <select name="select-chore" id="js-chore-select" class="drop-down" required>
            <option value="selectChore" selected>Select Chore</option>
          </select>
          <input type="submit" value="Log Chore" id="js-log-chore-button" class="log-chore-button hover">
      </form>
      <div class="js-error-message"></div>
    </section>
    `);
    getChores(client_id, totalValue);
}

function getChores(client_id, totalValue) {
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
  .then(response => populateChores(response.chore, client_id, totalValue))
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function populateChores(data, client_id, totalValue) {
  for (let i = 0; i < data.length; i++) {
    const option = document.createElement('option');
    option.setAttribute('value', data[i].value);
    option.text = data[i].choreName;
    const select = document.getElementById('js-chore-select');
    select.appendChild(option);
  };
  onChoreChange(client_id, totalValue)
}

function onChoreChange(client_id, totalValue) {
  $('#js-chore-select').change(function() {
    const select = document.getElementById('js-chore-select');
    const value = select.options[select.selectedIndex].value;
    submitLogChore(value, client_id, totalValue);
  });
}
//submitLogChore never happens if there's no change, need a better order of operations...

function submitLogChore(value, client_id, totalValue) {
  $('#js-log-chore-button').on('click', function(event) {
    event.preventDefault();
    if (value === 'selectChore') {
      $('.js-error-message').text('Please select a chore');
    } else {
    const newTotal = parseFloat(value) + parseFloat(totalValue);
    console.log(newTotal);
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
    .then(getClientAnother(client_id))
    .catch(err => {
        $('.js-error-message').text(`Something went wrong: ${err.message}`);
      });
    };
  });
}

function getClientAnother(client_id) {
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
  .then(response => logAnotherChore(response))
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function logAnotherChore(data) {
  $('#js-log-chore-container').html(`
    <p>${data.name} now has a total allowance of: $${data.totalValue}</p>
    <input type="button" value="Log another chore?" id="js-log-another-button" class="hover">
    `);
    logAnotherClick(data);
}

function logAnotherClick(data) {
  $('#js-log-another-button').on('click', function(event) {
    event.preventDefault();
    renderLogChorePage(data);
  });
}

function renderPayPageClick(client_id) {
  $('#js-pay-allowance-page-button').on('click', function(event) {
    event.preventDefault();
    getClientPay(client_id);
  });
}

function getClientPay(client_id) {
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
  .then(response => renderPayPage(response))
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function renderPayPage(data) {
  const client_id = data.id;
  const totalValue = data.totalValue;
  $('#js-main-container').html(`
    <section role="section" id="js-pay-allowance-container" class="pay-allowance-container">
      <p>Add instructions</p>
      <p>Pay out allowance to ${data.name}.</p>
      <form>
        <label for="allowance">Enter amount to payout:</label>
          <input type="number" value="0" id="js-pay-allowance-text" required>
          <input type="submit" value="Pay Allowance" id="js-pay-allowance-button" class="pay-allowance-button hover">
      </form>
      <div class="js-error-message"></div>
    </section>
    `);
    payAllowanceClick(client_id, totalValue);
}

function payAllowanceClick(client_id, totalValue) {
  $('#js-pay-allowance-button').on('click', function(event) {
    event.preventDefault();
    const value = $('#js-pay-allowance-text').val();
    checkPayAmount(value, client_id, totalValue);
  });
}

function checkPayAmount(value, client_id, totalValue) {
  if (value.length == 0) {
    $('.js-error-message').text('Amount of allowance paid cannot be empty.');
  } else {
    updateClientTotal(value, client_id, totalValue);
  };
}

function updateClientTotal(value, client_id, totalValue) {
  const newTotal = parseFloat(totalValue) - parseFloat(value);
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
  .then(renderHome())
  .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
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
          <input type="button" value="Edit" class="js-client-edit-button hover">
          <input type="button" value="Delete" class="js-client-delete-button hover">
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
    let totalValue = parseFloat(`${data[i].totalValue}`).toFixed(2);
    $('#js-render-clients-list').append(`
      <li>
      <label>
        <input type="radio" name="clients" value="${data[i]._id}" class="js-client-radio" required />
        <span>${data[i].name}, Total Amount: $${totalValue}</span>
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
  .then(response => renderEditClientPage(response))
  .catch(err => {
    $('.js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

function renderEditClientPage(data) {
  const client_id = data.id;
  $('#js-main-container').html(`
    <section role="section" id="js-edit-client-container" class="edit-client-container">
      <p>Add instructions</p>
      <p>Currently editing client: ${data.name}.</p>
      <form id="js-edit-client-name">
        <span>Edit name of client</span>
        <input type="text" value="${data.name}" id="js-edit-client-text">
        <input type="submit" value="Submit" id="js-edit-client-submit" class="hover">
      </form>
      <span class="js-error-message"></span>
    </section>
    `);
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
    $('.js-error-message').text('Name cannot be empty.');
  }
  });
}

function checkClientValue(name) {
  if (name.length == 0) {
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
          <input type="submit" value="add" id="js-add-client-button" class="hover">
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

    if (newName.length == 0) {
      $('.js-error-message').text('Name cannot be empty');
    } else {
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
  };
  });
}

function renderNewClient(response) {
  $('#js-render-client-success').html(`
    <p>${response.name} has been successfully created!</p><input type="button" id="js-add-another-client-button" value="Add another?" class="hover">
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
          <input type="submit" value="add" id="js-add-chore-button" class="hover">
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

    if (newChore.length == 0 || newValue.length == 0) {
      $('.js-error-message').text('Chore and/or Value cannot be empty.');
    } else {
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
  };
  });
}

function renderNewChore(response) {
  $('#js-render-chore-success').html(`
    <p>${response.choreName} has been successfully created, with a value of $${response.value}!</p><input type="button" id="js-add-another-chore-button" value="Add another?" class="hover">
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
          <input type="button" value="Edit" class="js-chore-edit-button hover">
          <input type="button" value="Delete" class="js-chore-delete-button hover">
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
        <input type="submit" value="Submit" id="js-edit-chore-submit" class="hover">
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
  if (name.length == 0 || value.length == 0) {
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
        <input id="js-signup-button" type="submit" value="Sign-Up!"  class="hover">
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
