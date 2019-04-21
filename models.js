'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const clientSchema = mongoose.Schema({
  id: 'string',
  name: {
    type: 'string',
    unique: true
  },
  totalValue: 'number'
});

const choreSchema = mongoose.Schema({
  id: 'string',
  choreName: 'string',
  value: 'number'
})

const Clients = mongoose.model("Clients", clientSchema);

const Chores = mongoose.model("Chores", choreSchema);

module.exports = { Clients, Chores };
