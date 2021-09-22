'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

describe('tests for /keyword/resources', function() {
    describe('tests for get', function() {
        it('should respond 200 for "search results matching criteria"', function() {
            var response = request('get', 'http://localhost:3000/keyword/resources', { 
                'qs': {"keyword":"tempor","limit":28,"offset":38539862},
                'time': true
            });

            expect(response).to.have.status(200);
            return chakram.wait();
        });


        it('should respond 400 for "bad input parameter"', function() {
            var response = request('get', 'http://localhost:3000/keyword/resources', { 
                'qs': {"keyword":"deserunt in officia ut veniam","limit":22,"offset":28491289},
                'time': true
            });

            expect(response).to.have.status(400);
            return chakram.wait();
        });
    
    });
});