'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

describe('tests for /ccdr', function() {
    describe('tests for get', function() {
        it('should respond 200 for "search results matching criteria"', function() {
            var response = request('get', 'http://localhost:3000/ccdr', { 
                'qs': {"name":"pariatur veniam proident","search":"laboris culpa eu deserunt incididunt","keyword":"et","limit":3,"offset":60727122},
                'time': true
            });

            expect(response).to.have.status(200);
            return chakram.wait();
        });


        it('should respond 400 for "bad input parameter"', function() {
            var response = request('get', 'http://localhost:3000/ccdr', { 
                'qs': {"name":"ex magna","search":"cupidatat aute dolor proident","keyword":"in dolore sunt consectetur","limit":39,"offset":45685440},
                'time': true
            });

            expect(response).to.have.status(400);
            return chakram.wait();
        });
    
    });
});