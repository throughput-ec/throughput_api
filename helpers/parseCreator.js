/* parseCreator:
   Takes input that claims to be from creator data and parses it into an
    object that contains the key terms defined below, and modeled in the data
    model for the Annotation Engine.
*/

function parseCreator(input) {

  var fields = ['identifier', 'PropertyID', 'firstName',
                'lastName', 'name', 'createTime', 'uid']

  create = JSON.parse(input);

  if (typeof(create) === 'string') {
    var creator = {
      identifier: create,
      PropertyID: "orcid"
    }
    return creator;
  } else {
    if (typeof(create) === 'object') {
      var allGood = Object.keys(creator).map(x => fields.includes(x)).every(x => x);

      if (allGood == True) {
        Object.keys(creator).filter(x => !fields.includes(x))
        .map(y => delete creator[y])
      }
    }
    return creator;
  }

}

module.exports.parseCreator = parseCreator;
