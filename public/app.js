'use strict';

let USERS = {
  "users": [
      {
      id: "111aaa",
      username: "Bob",
      password: "password",
      firstName: "Bob",
      lastName: "Bobby"
    },
    {
      id: "222bbb",
      username: "Sally",
      password: "password",
      firstName: "Sally",
      lastName: "Student"
    }
  ]
}

let CLIENTS = {
  "clients": [
    {
      id: "111111",
      name: "John"
    },
    {
      id: "222222",
      name: "Billy"
    },
    {
      id: "333333",
      name: "Sarah"
    }
  ]
};

let CHORES = {
  "chores": [
    {
      id: "aaaaaa",
      chore: "Dishes",
      value: 2
    },
    {
      id: "bbbbbb",
      chore: "Take out trash",
      value: 1
    },
    {
      id: "cccccc",
      chore: "Litter Box",
      value: 3
    }
  ]
};

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

//function userLogin(username, password) {

//}

function renderSignUp() {
  $('#js-go-signup').on('click', function(event) {
    event.preventDefault();
    $('.js-homepage-container').addClass('hidden');
    $('.js-signup-container').removeClass('hidden');
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
    const firstName = $('#js-first-name').val();
    const lastName = $('#js-last-name').val();
    const username = $('#js-user-name').val();
    const password = $('#js-password').val();
    //add validation(ideally both)
    const data = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      password: password,
      user_id: user_id,

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
    .then(response => console.log('Success:', JSON.stringify(response)))
    .catch(err => console.error('Error', err));
  })
}

function editClient() {

}

$(function() {
  getAndRenderClients();
  getAndRenderChores();
  //userLogin(username, password);
  renderSignUp();
  logoClick();
})
