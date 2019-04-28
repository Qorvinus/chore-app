'use strict';

let USERS = {
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
}

let CLIENTS = {
    {
      id: "111111",
      name: "John"
    },
    {
      id: "222222",
      user: "Billy"
    },
    {
      id: "333333",
      user: "Sarah"
    }
};

let CHORES = {
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
};

function getUsers(callback) {
  setTimeout(function() {
    callback(CLIENTS)
  }, 1);
}

function renderUsers(CLIENTS) {
  for (let i = 0; i < CLIENTS.clients.length; i++) {
    $('#js-render-users').append(`<input type="button" value="${CLIENTS.clients[i].name}>"`);
  };
}

function getAndRenderUsers() {
  getUsers(renderUsers);
}

//function for testing, reloads page
function reloadPage() {
  $('#js-reload').on('click', function(event) {
    event.preventDefault();
    location.reload();
  })
}

$(function() {
  getAndRenderUsers();
  reloadPage();
})
