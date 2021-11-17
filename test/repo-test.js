'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

describe('tests for /repo', function() {
    describe('tests for get', function() {
        it('should respond 200 for "search results matching criteria"', function() {
            var response = request('get', 'http://localhost:3000/repo', { 
                'qs': {"name":"dolore","search":"sed","keyword":"quis Duis do","limit":34,"offset":80261704},
                'time': true
            });

            expect(response).to.have.status(200);
            return chakram.wait();
        });


        it('should respond 400 for "bad input parameter"', function() {
            var response = request('get', 'http://localhost:3000/repo', { 
                'qs': {"name":"laborum in nulla quis dolor","search":"ut irure ea qui","keyword":"officia adipisicing dolore reprehenderit","limit":49,"offset":26385121},
                'time': true
            });

            expect(response).to.have.status(400);
            return chakram.wait();
        });
    
    });
});