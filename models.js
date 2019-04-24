'use strict';

const bcrypt = require('bcryptsjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  id: String,
  userName: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: { type: String, default: ''},
  lastName: { type: String, default: ''},
});

const ClientSchema = mongoose.Schema({
  id: 'string',
  name: {
    type: 'string',
    unique: true
  },
  totalValue: 'number'
});

const ChoreSchema = mongoose.Schema({
  id: 'string',
  choreName: 'string',
  value: 'number'
})

const Clients = mongoose.model("Clients", clientSchema);

const Chores = mongoose.model("Chores", choreSchema);

module.exports = { Clients, Chores, User };
