'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { User, Chore, Client } = require('../users');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

const signUpInfo = {
  'username': 'test',
  'firstName': 'firstName',
  'lastName': 'lastName',
  'password': 'password'
}

const loginInfo = {
  'username': 'test',
  'password': 'password'
}

const signUpInfoB = {
  'username': 'testB',
  'firstName': 'firstNameB',
  'lastName': 'lastNameB',
  'password': 'passwordB'
}

const loginInfoB = {
  'username': 'testB',
  'password': 'passwordB'
}

describe('Users endpoint', function() {
  const username = 'exampleUser';
  const password = 'examplePassord';
  const firstName = 'Example';
  const lastName = 'User';
  const usernameB = 'exampleUserB';
  const passwordB = 'examplePassordB';
  const firstNameB = 'ExampleB';
  const lastNameB = 'UserB';
  const newClient = 'newClient';
  const newChore = 'newChore';

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function(done) {
    User.remove({}, (err) => {
      console.error(err);
      done();
    });
  });

  afterEach(function() {
  });

  describe('/api/users/signup Endpoint', function() {
    describe('POST', function() {
      it('Should reject users with missing username', function() {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            password,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with missing password', function() {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with non-string username', function() {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username: 1234,
            password,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with non-string password', function() {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password: 1234,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            epxect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with non-string first name', function() {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password,
            firstName: 1234,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('firstName');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with non-string last name', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password,
            firstName,
            lastName: 1234
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('lastName');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with non-trimmed username', function() {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username: ` ${username} `,
            password,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with non-trimmed password', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password: ` ${password} `,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with empty username', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username: '',
            password,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 1 characters long'
            );
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with password less than eight characters', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password: '1234567',
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 8 characters long'
            );
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with password greater than 72 characters', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password: new Array(73).fill('a').join(''),
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at most 72 characters long'
            );
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should reject users with duplicate username', function () {
        return User.create({
          username,
          password,
          firstName,
          lastName
        })
          .then(() =>
            chai.request(app).post('/api/users/signup').send({
              username: username,
              password: password,
              firstName: firstName,
              lastName: lastName
            })
          )
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Username already taken'
            );
            expect(res.body.location).to.equal(`${username}`);
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            };
          });
      });
      it('Should create a new user', function() {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'id',
              'chore',
              'client'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });
      it('Should trim firstName and lastName', function () {
        return chai
          .request(app)
          .post('/api/users/signup')
          .send({
            username,
            password,
            firstName: ` ${firstName} `,
            lastName: ` ${lastName} `
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'id',
              'chore',
              'client'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
          });
      });
    });


    describe('GET', function() {
      it('Should return an empty array initially', function() {
        return chai
          .request(app)
          .get('/api/users/users')
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(0);
          });
      });
      //can remove after testing complete
      it('Should return an array of users', function() {
        return User.create(
          {
            username,
            password,
            firstName,
            lastName
          },
          {
            username: usernameB,
            password: passwordB,
            firstName: firstNameB,
            lastName: lastNameB
          }
        )
        .then(() =>
          chai.request(app).get('/api/users/users'))
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(2);
            expect(res.body[0]).to.deep.equal({
              username,
              firstName,
              lastName,
              id: res.body[0].id,
              chore: res.body[0].chore,
              client: res.body[0].client
            });
            expect(res.body[1]).to.deep.equal({
              username: usernameB,
              firstName: firstNameB,
              lastName: lastNameB,
              id: res.body[1].id,
              chore: res.body[1].chore,
              client: res.body[1].client
            });
          });
      });
    });
  });

  describe('/api/users/client Endpoint', function() {

    describe('POST', function() {
    it('Should reject a missing field', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfo)
        .end((err, res) => {
          res.should.have.status(201);
          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfo)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;
              chai.request(app)
                .post('/api/users/client')
                .set('Authorization', `Bearer ${token}`)
                .send({ })
                .end((err, res) => {
                  expect(res).to.have.status(422);
                  expect(res.body.reason).to.equal('ValidationError');
                  expect(res.body.message).to.equal('Missing field');
                  expect(res.body.location).to.equal('name');
                  done();
                });
            });
        });
      });
    });

    describe('POST', function() {
    it('Should return the new client', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfo)
        .end((err, res) => {
          res.should.have.status(201);
          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfo)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;
              chai.request(app)
                .post('/api/users/client')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  name: `${newClient}`
                })
                .end((err, res) => {
                  res.should.have.status(201);
                  expect(res.body).to.be.a('object');
                  expect(res.body.name).to.be.equal(`${newClient}`);
                  done();
                });
            });
        });
      });
    });

    describe('GET', function() {
    it('Should return client information', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfo)
        .end((err, res) => {
          res.should.have.status(201);
          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfo)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;
              chai.request(app)
                .post('/api/users/client')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  name: `${newClient}`
                })
                .end((err, res) => {
                  res.should.have.status(201);
                  expect(res.body).to.be.a('object');
                  expect(res.body.name).to.be.equal(`${newClient}`);

                let client = res.body;

                chai.request(app)
                  .get(`/api/users/client/${client.id}`)
                  .set('Authorization', `Bearer ${token}`)
                  .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                  });
                });
              });
            });
        });
    });

    describe('PUT', function() {
    it('Should update client name', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfo)
        .end((err, res) => {
          res.should.have.status(201);
          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfo)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;
              chai.request(app)
                .post('/api/users/client')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  name: `${newClient}`
                })
                .end((err, res) => {
                  res.should.have.status(201);
                  expect(res.body).to.be.a('object');
                  expect(res.body.name).to.be.equal(`${newClient}`);

                let client = res.body;
                const updatedName = 'newName'

                chai.request(app)
                  .put(`/api/users/client/${client.id}`)
                  .set('Authorization', `Bearer ${token}`)
                  .send({
                    id: client.id,
                    name: updatedName
                  })
                  .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body.name).to.equal(updatedName);
                    done();
                  });
                });
              });
            });
        });
    });

    describe('DELETE', function() {
    it('Should delete client', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfo)
        .end((err, res) => {
          res.should.have.status(201);

          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfo)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;
              chai.request(app)
                .post('/api/users/client')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  name: `${newClient}`
                })
                .end((err, res) => {
                  res.should.have.status(201);
                  expect(res.body).to.be.a('object');
                  expect(res.body.name).to.be.equal(`${newClient}`);

                let client = res.body;

                chai.request(app)
                  .delete(`/api/users/client/${client.id}`)
                  .set('Authorization', `Bearer ${token}`)
                  .end((err, res) => {
                    expect(res).to.have.status(204);
                    done();
                });
              });
            });
        });
      });
    });

    describe('PUT', function() {
      it('Should update the totalValue of a client', function(done) {
        chai.request(app)
          .post('/api/users/signup')
          .send(signUpInfo)
          .end((err, res) => {
            res.should.have.status(201);
            chai.request(app)
              .post('/api/auth/login')
              .send(loginInfo)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('authToken');

                let token = res.body.authToken;

                chai.request(app)
                  .post('/api/users/client')
                  .set('Authorization', `Bearer ${token}`)
                  .send({
                    name: `${newClient}`
                  })
                  .end((err, res) => {
                    res.should.have.status(201);
                    expect(res.body).to.be.a('object');
                    expect(res.body.name).to.be.equal(`${newClient}`);

                  let client = res.body;
                  const newTotal = 30;

                  chai.request(app)
                  .put(`/api/users/client/value/${client.id}`)
                  .set('Authorization', `Bearer ${token}`)
                  .send({
                    id: `${client.id}`,
                    totalValue: newTotal
                  })
                  .end((err, res) => {
                    console.log(res.body);
                    expect(res).to.have.status(204);
                    done();
                  });
                });
              });
          });
      });
    });
  });

  describe('/api/users/chore Endpoint', function() {

    describe('POST', function() {
    it('Should reject a missing field choreName', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfoB)
        .end((err, res) => {
          res.should.have.status(201);
          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfoB)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;

              chai.request(app)
                .post('/api/users/chore')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  value: 3
                })
                .end((err, res) => {
                  expect(res).to.have.status(422);
                  expect(res.body.reason).to.equal('ValidationError');
                  expect(res.body.message).to.equal('Missing field');
                  expect(res.body.location).to.equal('choreName');
                  done();
                });
            });
        });
      });
    });

    describe('POST', function() {
    it('Should reject a missing field value', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfoB)
        .end((err, res) => {
          res.should.have.status(201);
          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfoB)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;
              chai.request(app)
                .post('/api/users/chore')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  choreName: newChore
                })
                .end((err, res) => {
                  expect(res).to.have.status(422);
                  expect(res.body.reason).to.equal('ValidationError');
                  expect(res.body.message).to.equal('Missing field');
                  expect(res.body.location).to.equal('value');
                  done();
                });
            });
        });
      });
    });

    describe('POST', function() {
    it('Should return the new chore', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfoB)
        .end((err, res) => {
          res.should.have.status(201);
          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfoB)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;
              chai.request(app)
                .post('/api/users/chore')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  choreName: newChore,
                  value: 3
                })
                .end((err, res) => {
                  res.should.have.status(201);
                  expect(res.body).to.be.a('object');
                  expect(res.body.choreName).to.be.equal(`${newChore}`);
                  expect(res.body.value).to.be.equal(3);
                  done();
                });
            });
        });
      });
    });

    describe('GET', function() {
    it('Should return chore information', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfoB)
        .end((err, res) => {
          res.should.have.status(201);
          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfoB)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;

              chai.request(app)
                .post('/api/users/chore')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  choreName: newChore,
                  value: 3
                })
                .end((err, res) => {
                  res.should.have.status(201);
                  expect(res.body).to.be.a('object');
                  expect(res.body.choreName).to.be.equal(`${newChore}`);
                  expect(res.body.value).to.be.equal(3);

                let chore = res.body;

                chai.request(app)
                  .get(`/api/users/chore/${chore.id}`)
                  .set('Authorization', `Bearer ${token}`)
                  .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                  });
                });
              });
            });
        });
    });

    describe('PUT', function() {
    it('Should update chore information', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfoB)
        .end((err, res) => {
          res.should.have.status(201);
          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfoB)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;

              chai.request(app)
                .post('/api/users/chore')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  choreName: newChore,
                  value: 3
                })
                .end((err, res) => {
                  res.should.have.status(201);
                  expect(res.body).to.be.a('object');
                  expect(res.body.choreName).to.be.equal(`${newChore}`);
                  expect(res.body.value).to.be.equal(3);

                let chore = res.body;
                console.log(chore);

                chai.request(app)
                  .put(`/api/users/chore/${chore.id}`)
                  .set('Authorization', `Bearer ${token}`)
                  .send({
                    id: chore.id,
                    choreName: 'updatedChore',
                    value: 5
                  })
                  .end((err, res) => {
                    expect(res).to.have.status(204);
                    done();
                  });
                });
              });
            });
        });
    });

    describe('DELETE', function() {
    it('Should delete client', (done) => {
      chai.request(app)
        .post('/api/users/signup')
        .send(signUpInfoB)
        .end((err, res) => {
          res.should.have.status(201);

          chai.request(app)
            .post('/api/auth/login')
            .send(loginInfoB)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('authToken');

              let token = res.body.authToken;

              chai.request(app)
                .post('/api/users/chore')
                .set('Authorization', `Bearer ${token}`)
                .send({
                  choreName: newChore,
                  value: 3
                })
                .end((err, res) => {
                  res.should.have.status(201);
                  expect(res.body).to.be.a('object');
                  expect(res.body.choreName).to.be.equal(`${newChore}`);
                  expect(res.body.value).to.be.equal(3);

                let chore = res.body;

                chai.request(app)
                  .delete(`/api/users/chore/${chore.id}`)
                  .set('Authorization', `Bearer ${token}`)
                  .end((err, res) => {
                    expect(res).to.have.status(204);
                    done();
                });
              });
            });
        });
      });
    });
  });

  describe('/api/users/user', function() {

    describe('GET', function() {
      it('Should retrieve user info', (done) => {
        chai.request(app)
          .post('/api/users/signup')
          .send(signUpInfo)
          .end((err, res) => {
            res.should.have.status(201);
            chai.request(app)
              .post('/api/auth/login')
              .send(loginInfo)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('authToken');

                let token = res.body.authToken;
                chai.request(app)
                  .get('/api/users/user')
                  .set('Authorization', `Bearer ${token}`)
                  .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                  });
              });
          });
      });
    });
  });

});
