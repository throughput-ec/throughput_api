'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

describe('tests for /repo', function() {
    describe('tests for get', function() {
        it('should respond 200 for "search results matching criteria"', function() {
            var response = request('get', 'http://localhost:3000/repo', { 
                'qs': {"name":"dolor adipisicing dolore ex","search":"sit dolore anim","keyword":"non reprehenderit dolore mollit tempor","limit":31,"offset":79596129},
                'time': true
            });

            expect(response).to.have.status(200);
            return chakram.wait();
        });


        it('should respond 400 for "bad input parameter"', function() {
            var response = request('get', 'http://localhost:3000/repo', { 
                'qs': {"name":"enim veniam consequat mollit cillum","search":"ut minim exercitation adipisicing mollit","keyword":"dolore anim aute mollit","limit":9,"offset":82743202},
                'time': true
            });

            expect(response).to.have.status(400);
            return chakram.wait();
        });
    
    });
});