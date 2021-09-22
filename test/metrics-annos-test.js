'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

describe('tests for /metrics/annos', function() {
    describe('tests for get', function() {
        it('should respond 200 for "Summary of weekly uploads/updates."', function() {
            var response = request('get', 'http://localhost:3000/metrics/annos', { 
                'time': true
            });

            expect(response).to.have.status(200);
            return chakram.wait();
        });


        it('should respond 400 for "bad input parameter"', function() {
            var response = request('get', 'http://localhost:3000/metrics/annos', { 
                'time': true
            });

            expect(response).to.have.status(400);
            return chakram.wait();
        });
    
    });
});