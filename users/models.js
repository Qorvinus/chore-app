'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const ChoreSchema = mongoose.Schema({
  choreName: String,
  value: Number
})

// const ClientChoreSchema = mongoose.Schema({
//   choreName: String,
//   value: Number
// })

const ClientSchema = mongoose.Schema({
  name: String,
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

ChoreSchema.methods.serialize = function() {
  return {
    id: this._id,
    choreName: this.choreName,
    value: this.value
  };
}

ClientSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name,
    totalValue: this.totalValue
  };
}

UserSchema.methods.serialize = function() {
  return {
    id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    client: this.client,
    chore: this.chore
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

// const ClientChore = mongoose.model("ClientChore", ClientChoreSchema);

module.exports = { Client, Chore, User };
