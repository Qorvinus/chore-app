'use strict';

localStorage.setItem('authToken', 'user_id');

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

function renderLogin() {
  $('#js-go-login-button').on('click', function(event) {
    event.preventDefault();
    $('.homepage-container').addClass('hidden');
    $('.login-container').removeClass('hidden');
    userLogin();
  });
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
    .then(res => res.json())
    //reroute successful login w/ jwtAuth to new dashboard function
    .then(response => renderDashboard(response))
    .catch(err => console.error('Error', err));
  });
}

function renderDashboard(response) {
  $('.login-nav').addClass('hidden');
  $('.dashboard-nav').removeClass('hidden');
  $('.login-container').addClass('hidden');
  $('.dashboard-container').removeClass('hidden');
  getClient();
  goHome();
  renderAddClient();
  renderAddChore();
  renderEditChore();
}

function getClient() {
  const url = 'http://localhost:8080/api/users/client';

  fetch(url, {
    method: 'GET',
    body: {
      user_id: localStorage.getItem('user_id')
    },
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
  })
  .then(res => res.json)
  .then(response => renderClient(response))
  .catch(err => console.error('Error', err));
}

function renderClient(response) {
  $('#js-render-clients-list').append(`<li>${response.name}, Total Amount: ${response.totalValue}<span class="hidden">${response.id}</span><input type="button" value="Edit" id="js-client-edit-button"><input type="button" value="Delete" id="js-client-delete-button"></li>`);
  let id = response.id;
  renderEditClient(id);
  deleteClient(id);
}

function renderEditClient(client_id) {
  $('#js-client-edit-button').on('click', function(event) {
    event.preventDefault();
    $('.js-dashboard-container').addClass('hidden');
    $('.js-edit-client-container').removeClass('hidden');
    editClient(client_id);
  });
}

function editClient(client_id) {
  $('#js-edit-client-submit').on('click', function(event) {
    event.preventDefault();
    const editName = $('#js-edit-client-text').val();
    const url = `http://localhost:8080/api/users/client/${client_id}`;
    const data = {
      user_id: localStorage.getItem('user_id'),
      client_id: client_id,
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
    .then(res => res.json())
    .then(response => reloadClient(response))
    .catch(err => console.error('Error', err));
  });
}

function deleteClient(client_id) {
  $('#js-client-delete-button').on('click', function(event) {
    event.preventDefault();
    const url = `http://localhost:8080/api/users/client/${client_id}`;

    fetch(url, {
      method: 'DELETE',
      body: {
        user_id: localStorage.getItem('user_id'),
        client_id: client_id
      },
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(response => reloadClient(response))
    .catch(err => console.error('Error', err));
  });
}

function reloadClient(response) {
  $('#js-render-clients-list').empty();
  getClient();
}

function goHome() {
  reloadClient();
}

function renderAddClient() {
  $('.js-go-add-client-button').on('click', function(event) {
    event.preventDefault();
    //need to figure out better way to unhide current container
    $('.dashboard-container').addClass('hidden');
    $('.add-client-container').removeClass('hidden');
    addClient();
    //call functions for add client page
  });
}

function addClient() {
  const newName = $('#js-add-client-text').val();
  const url = 'http://localhost:8080/api/users/client';
  const data = {
    user_id: localStorage.getItem('user_id'),
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
  .then(res => res.json())
  .then(response => renderNewClient(response))
  .catch(err => console.error('Error', err));
}

function renderNewClient(response) {
  $('#js-render-client-success').html(`<p>${response.name} has been successfully created!</p><input type="button" id="js-add-another-client" value="Add another?">`)
  addAnotherClient();
}

function addAnotherClient() {
  $('#js-add-another-client').on('click', function(event) {
    event.preventDefault();
    renderAddClient();
    $('#js-render-client-success').empty();
  });
}

function renderAddChore() {
  $('.js-go-add-chore-button').on('click', function(event) {
    event.preventDefault();
    $('.dashboard-container').addClass('hidden');
    $('.add-chore-container').removeClass('hidden');
    addChore();
  })
}

function addChore() {
  $('#js-add-chore-button').on('click', function(event) {
    event.preventDefault();
    const newChore = $('#js-add-chore-text').val();
    const newValue = $('#js-add-chore-value-number').val();
    const url = 'http://localhost:8080/api/users/chore';
    const data = {
        user_id: localStorage.getItem('user_id'),
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
    .then(res => res.json())
    .then(response => renderNewChore(response))
    .catch(err => console.error('Error', err));
  });
}

function renderNewChore(response) {
  $('#js-render-chore-success').html(`<p>${response.choreName} has been successfully created, with a value of $${response.value}!</p><input type="button" id="js-add-another-chore" value="Add another?">`);
  addAnotherChore();

}

function addAnotherChore() {
  $('#js-add-another-chore').on('click', function(event) {
    event.preventDefault();
    renderAddChore();
    $('#js-render-chore-success').empty();
  });
}

function renderEditChore() {
  $('.js-go-edit-chore-button').on('click', function(event) {
    event.preventDefault();
    $('.dashboard-container').addClass('hidden');
    $('.edit-chore-list-container').removeClass('hidden');
    getChore();
  });
}

function getChore() {
  const url = 'http://localhost:8080/api/users/chore';

  fetch(url, {
    method: 'GET',
    body: {
      user_id: localStorage.getItem('user_id')
      },
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
  })
  .then(res => res.json())
  .then(response => renderChore(response))
  .catch(err => console.error('Error', err));
}

function renderChore(response) {
  $('#js-chore-list').append(`<li>${response.choreName}, $${response.value}<span class="hidden">${response.id}</span><input type="button" value="Edit" id="js-chore-edit-button"><input type="button" value="Delete" id="js-chore-delete-button"></li>`);
  let id = response.id;
  renderEditChore(id);
  deleteChore(id);
}

function renderEditChore(chore_id) {
  $('#js-chore-edit-button').on('click', function(event) {
    event.preventDefault();
    $('.edit-chore-list-container').addClass('hidden');
    $('.edit-chore-container').removeClass('hidden');
    editChore(chore_id);
  });
}

function editChore(chore_id) {
  $('#js-edit-chore-submit').on('click', function(event) {
    event.preventDefault();
    const editChore = $('#js-edit-chore-text').val();
    const editValue = $('#js-edit-chore-value-number').val();
    const url = `http://localhost:8080/api/users/client/${client_id}`;
    const data = {
      user_id: localStorage.getItem('user_id'),
      chore_id: chore_id,
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
    .then(res => res.json())
    .then(response => reloadChore(response))
    .catch(err => console.error('Error', err));
  });
}

function deleteChore(chore_id) {
  $('#js-chore-delete-button').on('click', function(event) {
    event.preventDefault();
    const url = `http://localhost:8080/api/users/chore/${chore_id}`;

    fetch(url, {
      method: 'DELETE',
      body: {
        user_id: localStorage.getItem('user_id'),
        chore_id: chore_id
      },
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(response => reloadChore(response))
    .catch(err => console.error('Error', err));
  });
}

function reloadChore(response) {
  $('#js-chore-list').empty();
  getChore();
}

function renderSignUp() {
  $('#js-go-signup-button').on('click', function(event) {
    event.preventDefault();
    $('.homepage-container').addClass('hidden');
    $('.signup-container').removeClass('hidden');
    signUp();
  });
}

function logoClick() {
  $('#logo').on('click', function(event) {
    event.preventDefault();
    location.reload()
  });
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
    .then(res => res.json())
    //reroute successful signup to new page successful sign up, => login
    .then(response => console.log('Success:', JSON.stringify(response)))
    .catch(err => console.error('Error', err));
  });
}

function editClient() {

}

$(function() {
  // getAndRenderClients();
  // getAndRenderChores();
  renderLogin();
  renderSignUp();
  logoClick();
})
