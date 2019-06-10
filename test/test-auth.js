'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
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

describe('Auth endpoints', function() {
  const username = 'exampleUser';
  const password = 'examplePassword';
  const firstName = 'Example';
  const lastName = 'User';
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

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName
      })
    );
  });

  afterEach(function() {
    return User.remove({});
  });

  describe('/api/auth/login', function() {
    it('Should reject requests with no credentials', function() {
      return chai
        .request(app)
        .post('/api/auth/login')
        .then((res) => {
          expect(res).to.have.status(400);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
    it('Should reject requests with incorrect username', function() {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({ username: 'wrongUsername', password })
        .then((res) => {
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
    it('Should reject requests with incorrect password', function() {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({ username, password: 'wrongPassword' })
        .then((res) => {
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (!(err instanceof chai.AssertionError)) {
            throw err;
          }
        });
    });
    it('Should return a valid auth token', function() {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
        });
    });
  });

  describe('/api/auth/refresh', function() {
    it('Should reject requests with no credentials', function() {
      return chai
        .request(app)
        .post('/api/auth/refresh')
        .then((res) => {
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
    it('Should reject requests with an invalid token', function() {
      const token = jwt.sign(
        {
          username,
          firstName,
          lastName
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
    it('Should reject requests with an expired token', function() {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          },
          exp: Math.floor(Date.now() / 1000) -10
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username
        }
      );

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
    it('Should return a valid auth token with a newer expiry date', function(done) {
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

              let oldToken = res.body.authToken;

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${oldToken}`)
        .end((err, res) => {
            res.should.have.status(200);
            expect(res).to.be.an('object');
            const newToken = res.body.authToken;
            expect(newToken).to.be.a('string');
            done();
          });
        });
      });
    });
  });
});
