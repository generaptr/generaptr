const request = require("supertest");
const should = require("should");
const app = require('../../src/server.js');
// This agent refers to PORT where program is running.


describe('Test api entrypoint', () => {
    it('should return a message', (done) => {
        request(app).get('/').then((response) => {
            response.body.message.should.equal('Api entrypoint');
            response.status.should.equal(200);
            done();
        })
    });
});