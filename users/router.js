'use strict';

const express = require('express');

const passport = require('passport');

const { User, Client, Chore } = require('./models');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/signup', (req, res, next) => {
  const requireFields = ['username', 'password', 'firstName', 'lastName'];
  const missingField = requireFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
        req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
        req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { username, password, firstName = '', lastName = '' } = req.body;

  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: username
        });
      }

      return User.hashPassword(password);
    })
    .then(hash => {
      const newUser = {
        username,
        password: hash,
        firstName,
        lastName
      }
      return User.create(newUser);
      console.log(newUser);
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'})
      next(err);
    })
});

router.post('/client', jwtAuth, (req, res) => {
  const requireFields = ['user_id', 'name'];
  const missingField = requireFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  User
    .findById(req.body.user_id)
    .then(user => {
      if (user) {
        Client
          .create({
            name: req.body.name,
            totalValue: 0
          })
          .then(client => {
            return User.findByIdAndUpdate(user.id, {$push:{'client': client.id}})
          })
          .then(client => res.status(201).json(client.serialize()))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
          });
      } else {
        const message = 'User not found';
        console.error(message);
        return res.status(400).send(message);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
})

router.put('/client/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['name', 'chore'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Client
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedClient => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
})

router.delete('client/:id', jwtAuth, (req, res) => {
  User
    .findById(req.body.user_id)
    .then(user => {
      if (user) {
        Client
          .findByIdAndRemove(req.body.client_id)
          .then(() => {
            console.log(`Deleted client with id ${req.body.client_id}`);
            res.status(204).end();
          });
      };
    });
})

router.get('/client', jwtAuth, (req, res) => {
  User
    .findById(req.body.user_id)
    .then(user => {
      if (user) {
        Client
          .find()
          .then(clients => {
            res.json(clients.map(client => client.serialize()));
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
          });
      };
    });
})

router.post('/chore', jwtAuth, (req, res) => {
  const requireFields = ['choreName', 'value'];
  const missingField = requireFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  User
    .findById(req.body.user_id)
    .then(user => {
      if (user) {
        Chore
          .create({
            choreName: req.body.choreName,
            value: req.body.value
          })
          .then(chore => {
            return User.findByIdAndUpdate(user.id, {$push:{'chore': chore.id}})
          })
          .then(user => res.status(201).json(user.serialize()))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
          });
      } else {
        const message = 'User not found';
        console.error(message);
        return res.status(400).send(message);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      });
})

router.put('/chore/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['choreName', 'value'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Chore
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedChore => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
})

router.delete('/chore/:id', jwtAuth, (req, res) => {
  User
    .findById(req.body.user_id)
    .then(user => {
      if (user) {
        Chore
          .findByIdAndRemove(req.body.chore_id)
          .then(() => {
            console.log(`Deleted chore with id ${req.body.chore_id}`);
            res.status(204).end();
          });
      };
    });
})

router.put('/client/value/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['totalValue'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Client
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedClient => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error ' }));
})

//remove me later after testing complete
router.get('/users', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
})

module.exports = { router };
