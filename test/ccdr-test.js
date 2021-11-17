'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

describe('tests for /ccdr', function() {
    describe('tests for get', function() {
        it('should respond 200 for "search results matching criteria"', function() {
            var response = request('get', 'http://localhost:3000/ccdr', { 
                'qs': {"name":"irure","search":"dolore","keyword":"ea dolor ad","limit":3,"offset":82027091},
                'time': true
            });

            expect(response).to.have.status(200);
            return chakram.wait();
        });


        it('should respond 400 for "bad input parameter"', function() {
            var response = request('get', 'http://localhost:3000/ccdr', { 
                'qs': {"name":"cillum Excepteur qui eiusmod anim","search":"ut est commodo laboris consectetur","keyword":"officia","limit":44,"offset":87750894},
                'time': true
            });

            expect(response).to.have.status(400);
            return chakram.wait();
        });
    
    });
});