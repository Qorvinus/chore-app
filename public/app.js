'use strict';

localStorage.setItem('authToken');

function getClients(callback) {
  setTimeout(function() {
    callback(CLIENTS)
  }, 1);
}

function getChores(callback) {
  setTimeout(function() {
    callback(CHORES)
  }, 1);
}

function renderClients(data) {
  for (let i = 0; i < data.clients.length; i++) {
    $('#js-render-clients').append(`<input type="button" value="${data.clients[i].name}">`);
  };
}

function renderChores(data) {
  for (let i = 0; i < data.chores.length; i++) {
    $('#js-render-chores').append(`<li>${data.chores[i].chore}: $${data.chores[i].value}`)
  }
}

function getAndRenderClients() {
  getClients(renderClients);
}

function getAndRenderChores() {
  getChores(renderChores);
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
  })
}

function renderDashboard(response) {
  $('.login-nav').addClass('hidden');
  $('.dashboard-nav').removeClass('hidden');
  goHome();
  addClient();
  addChore();
  logout();
}

function goHome() {
  //reload home dashboard
  //edit/put clients
  //edit/put chores
  //edit/put client totalValue
}

function addClient() {
  $('#js-add-client').on('click', function(event) {
    event.preventDefault();
    //change DOM to show add client page
    //call functions for add client page
  })
}

function addChore() {
  //add chores, post chore
}

//maybe don't need, could possibly use <a href="http://localhost:8080/logout">Logout</a> use anchor**
function logout() {
  const url = 'http://localhost:8080/logout';
  const data = 'logout()';
  fetch(url, {
    method: 'GET',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function renderSignUp() {
  $('#js-go-signup-button').on('click', function(event) {
    event.preventDefault();
    $('#js-homepage-container').addClass('hidden');
    $('#js-signup-container').removeClass('hidden');
    signUp();
  })
}

function logoClick() {
  $('#logo').on('click', function(event) {
    event.preventDefault();
    location.reload()
  })
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
  })
}

function editClient() {

}

$(function() {
  getAndRenderClients();
  getAndRenderChores();
  userLogin();
  renderSignUp();
  logoClick();
})
