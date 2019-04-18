'use strict';

function getUsers(callback) {
  setTimeout(function() {
    callback(USERS)
  }, 100);
}

function renderUsers(data) {
  for (index in data.USERS) {
    $('#js-render-users').append(`<input type="button" value="${data.USERS[index].text}>"`);
  };
}

// what does this do, and how?  The getUsers(renderUsers), strange to me to pass the function in a function like this.
function getAndRenderUsers() {
  getUsers(renderUsers);
}

$(function() {
  getAndRenderUsers();
})
