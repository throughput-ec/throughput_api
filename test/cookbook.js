const expect    = require("chai").expect;
const fetch = require("node-fetch");

describe("repo_lister.vue and lister.vue calls:", function() {
  it("Returns a `citation` of length 1 when one Database ID is passed:", async () => {
    let cite = await fetch('http://localhost:3000/api/citations?ids=r3d100010313', {method:'GET'});
    let response =  await cite.json();

    expect(response.data).to.contain.all.keys('citation');
    expect(response.data.citation).to.have.lengthOf(1);
  });
  it("Returns a `citation` of length n when a list of database IDs are passed:", async () => {
    let cite = await fetch('http://localhost:3000/api/citations?ids=r3d100010313,r3d100010316,r3d100012277', {method:'GET'});
    let response =  await cite.json();

    expect(response.data).to.contain.all.keys('citation');
    expect(response.data.citation).to.have.lengthOf(3);
  });
  it("Returns a `citation` of length 1 when a repo ID is passed:", async () => {
    let cite = await fetch('http://localhost:3000/api/citations?ids=80521204,52386946,56258788', {method:'GET'});
    let response =  await cite.json();

    expect(response.data).to.contain.all.keys('citation');
    expect(response.data.citation).to.have.lengthOf(3);
  });
});

describe("keyword_search.vue calls:", function() {
  this.timeout(5000);
  it("Returns a list of all keywords associated with data catalogs:", async () => {
    let cite = await fetch('http://localhost:3000/api/ccdrs/keywords?limit=99999', {method:'GET'});
    let response =  await cite.json();

    expect(response.data).to.contain.all.keys('data');
    expect(response.data.data).to.have.lengthOf.at.least(1);
    expect(response.data.data[0]).to.contain.all.keys('keywords', 'count');
  });
  it("Returns a data catalog when searched by name:", async () => {
    let cite = await fetch('http://localhost:3000/api/ccdr?name=Neotoma', {method:'GET'});
    let response =  await cite.json();

    expect(response.data).to.contain.all.keys('data');
    expect(response.data.data).to.have.lengthOf.at.least(1);
    expect(response.data.data[0]).to.contain.all.keys('created', 'contact', 'name', 'description', 'id', 'url', 'count', 'keywords');
  });
  it("Returns code repositories associated with a database:", async () => {
    this.timeout(5000);
    let cite = await fetch('http://localhost:3000/api/ccdrs/repos?ccdrs=r3d100011291', {method:'GET'});
    let response =  await cite.json();

    expect(response.data).to.contain.all.keys('data');
    expect(response.data.data).to.have.lengthOf.at.most(25);
    expect(response.data.data[0]).to.contain.all.keys('created', 'name', 'description', 'id', 'url', 'ccdrs');
  });
  it('Returns databases associated with particular keyword sets:', async () => {
    this.timeout(5000);
    let cite = await fetch('http://localhost:3000/api/keywords/ccdrs?keywords=climate,soil&limit=1000', {method:'GET'});
    let response =  await cite.json();

    expect(response.data).to.contain.all.keys('data');
    expect(response.data.data).to.have.lengthOf.at.most(1000);
    expect(response.data.data[0]).to.contain.all.keys('created', 'name', 'description', 'id', 'url', 'keywords');
    expect(response.data.data[0].keywords).to.contain.any.members(['climate', 'soil']);
  });
});
