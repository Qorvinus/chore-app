'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String
});

UserSchema.methods.serialize = function() {
  return {
    id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName
  };
};

UserSchema.methods.validatePassword = function(password) {
  const currentUser = this;
  return bcrypt.compare(password, currentUser.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const ChoreSchema = mongoose.Schema({
  choreName: String,
  value: Number
})

const ClientSchema = mongoose.Schema({
  //id will be created by mongo
  name: {
    type: String,
    unique: true
  },
  chores: [ChoreSchema],
  totalValue: Number
});

const Clients = mongoose.model("Clients", ClientSchema);

const Chores = mongoose.model("Chores", ChoreSchema);

const User = mongoose.model("User", UserSchema)

module.exports = { Clients, Chores, User };
