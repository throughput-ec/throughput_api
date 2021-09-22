'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

describe('tests for /keyword/repos', function() {
    describe('tests for get', function() {
        it('should respond 200 for "keywords matching the search criteria."', function() {
            var response = request('get', 'http://localhost:3000/keyword/repos', { 
                'time': true
            });

            expect(response).to.have.status(200);
            return chakram.wait();
        });


        it('should respond 400 for "bad input parameter"', function() {
            var response = request('get', 'http://localhost:3000/keyword/repos', { 
                'time': true
            });

            expect(response).to.have.status(400);
            return chakram.wait();
        });
    
    });
});