'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const ChoreSchema = mongoose.Schema({
  choreName: String,
  value: Number
})

const ClientSchema = mongoose.Schema({
  name: {
    type: String,
  },
  chores: [ChoreSchema], //this is embeding schema, change to reference instead.
  totalValue: Number
});

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
  lastName: String,
  client: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
  chore: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chore'}]
});

// [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clients' }]

UserSchema.methods.serialize = function() {
  return {
    id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    client: this.client
  };
};

UserSchema.methods.validatePassword = function(password) {
  const currentUser = this;
  return bcrypt.compare(password, currentUser.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const Client = mongoose.model("Clients", ClientSchema);

const Chore = mongoose.model("Chores", ChoreSchema);

const User = mongoose.model("User", UserSchema)

module.exports = { Client, Chore, User };