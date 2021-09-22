'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

describe('tests for /keywords', function() {
    describe('tests for get', function() {
        it('should respond 200 for "keywords matching the search criteria."', function() {
            var response = request('get', 'http://localhost:3000/keywords', { 
                'qs': {"keyword":"ad do ipsum dolor","limit":19,"offset":55572599},
                'time': true
            });

            expect(response).to.have.status(200);
            return chakram.wait();
        });


        it('should respond 400 for "bad input parameter"', function() {
            var response = request('get', 'http://localhost:3000/keywords', { 
                'qs': {"keyword":"est cillum ut","limit":38,"offset":31522623},
                'time': true
            });

            expect(response).to.have.status(400);
            return chakram.wait();
        });
    
    });
});