[![lifecycle](https://img.shields.io/badge/lifecycle-experimental-orange.svg)](https://www.tidyverse.org/lifecycle/#experimental)
[![NSF-XXXXXXX](https://img.shields.io/badge/NSF-1928366-blue.svg)](https://nsf.gov/awardsearch/showAward?AWD_ID=1928366)

# Annotation Engine neo4j API

This application is designed to allow users to generate simple annotations of material using web-based resources based on the API protocols defined in the W3C standards.

Annotations are generated as conformant to W3C annotation standards, and implemented using Neo4J.

## Contributions

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

*   [Simon Goring](http://goring.org) [![orcid](https://img.shields.io/badge/orcid-0000--0002--2700--4605-brightgreen.svg)](https://orcid.org/0000-0002-2700-4605)

## Application Setup

This application is developed using Express/Node.js to interact with a `neo4j` database.

### Installing neo4j

Instructions for installing `neo4j` on a Linux system can be found on the [neo4j documentation](https://neo4j.com/docs/operations-manual/current/installation/linux/debian/).  This documentation is written assuming the installation of the Neo4j Community Version.

The installation of neo4j results in the installation of a number of files that need to be modified throughout the use of Neo4j.  Those files are listed in [Neo4j's configuration documentation](https://neo4j.com/docs/operations-manual/current/configuration/file-locations/).

Once `neo4j` is installed you can type:

```
service neo4j start
```

And navigate a browser to `localhost:7474`.

### Installing nodejs and Express

If you are starting from this repository:  Ensure that you have [`npm` installed locally](https://www.npmjs.com/get-npm).   then clone (or fork/clone) the repository to a local directory and run the command.

```
npm install
```

This will ensure all the appropriate packages are downloaded and installed for the project.

## Endpoints

### Cookbook
* `ccdr`:
  - `keyword`: Search research data resources by keyword
  - `search`: Search for a research data resource by name
  - `code`: (`True`/**`False`**) Return linked code repositories
  - `summary`: (**`True`**/`False`) Return a summary of the linked code resources (number of repositories, number of sources)
  - `limit`: [30] Maximum number of records to return.
* `linked`:
  - `keywords`: A json array of keywords: [['climate', 'weather'],['botany', 'plants']]
  - `limit`: [30] Maximum number of records to return.
* `friends`:
  - `summary`: Number of unique users and number of annotations.
  - `orcid`: Find unique annotator.
