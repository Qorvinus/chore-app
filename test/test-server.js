'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe("index page", function() {
    it("should exist on GET", function() {
        return chai
            .request(app)
            .get("/")
            .then(function(res) {
                expect(res).to.have.status(200);
            });
    });
});
