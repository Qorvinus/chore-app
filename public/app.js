'use strict';

let USERS = {
  "users": [
      {
      id: "111aaa",
      userName: "Bob",
      password: "password",
      firstName: "Bob",
      lastName: "Bobby"
    },
    {
      id: "222bbb",
      userName: "Sally",
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

//function userLogin(userName, password) {

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

}

$(function() {
  getAndRenderClients();
  getAndRenderChores();
  //userLogin(userName, password);
  renderSignUp();
  logoClick();
})
