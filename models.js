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

UserSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.has(password, 10);
};

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

const Clients = mongoose.model("Clients", ClientSchema);

const Chores = mongoose.model("Chores", ChoreSchema);

const User = mongoose.model("User", UserSchema)

module.exports = { Clients, Chores, User };
