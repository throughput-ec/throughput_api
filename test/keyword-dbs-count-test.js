'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

describe('tests for /keyword/dbs/count', function() {
    describe('tests for get', function() {
        it('should respond 200 for "search results matching criteria"', function() {
            var response = request('get', 'http://localhost:3000/keyword/dbs/count', { 
                'qs': {"keyword":"in Lorem elit ad"},
                'time': true
            });

            expect(response).to.have.status(200);
            return chakram.wait();
        });


        it('should respond 400 for "bad input parameter"', function() {
            var response = request('get', 'http://localhost:3000/keyword/dbs/count', { 
                'qs': {"keyword":"esse"},
                'time': true
            });

            expect(response).to.have.status(400);
            return chakram.wait();
        });
    
    });
});