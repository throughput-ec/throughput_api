[![lifecycle](https://img.shields.io/badge/lifecycle-experimental-orange.svg)](https://www.tidyverse.org/lifecycle/#experimental) [![NSF-1928366](https://img.shields.io/badge/NSF-1928366-blue.svg)](https://nsf.gov/awardsearch/showAward?AWD_ID=1928366)
[![DOI](https://zenodo.org/badge/163697603.svg)](https://zenodo.org/badge/latestdoi/163697603)

# Annotation Engine `neo4j` API

This application is designed to allow users to generate simple annotations of material using web-based resources based on the API protocols defined in the W3C standards.

Annotations are generated as conformant to W3C annotation standards, and implemented using Neo4J.

## Contributions

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

- [Simon Goring](http://goring.org) [![orcid](https://img.shields.io/badge/orcid-0000--0002--2700--4605-brightgreen.svg)](https://orcid.org/0000-0002-2700-4605)

## Application Setup

This application is developed using Express/Node.js to interact with a `neo4j` database.

### Installing neo4j

Instructions for installing `neo4j` on a Linux system can be found on the [neo4j documentation](https://neo4j.com/docs/operations-manual/current/installation/linux/debian/). This documentation is written assuming the installation of the Neo4j Community Version.

The installation of neo4j results in the installation of a number of files that need to be modified throughout the use of Neo4j. Those files are listed in [Neo4j's configuration documentation](https://neo4j.com/docs/operations-manual/current/configuration/file-locations/).

Once `neo4j` is installed you can type:

```
service neo4j start
```

And navigate a browser to `localhost:7474`.

### Installing nodejs and Express

If you are starting from this repository: Ensure that you have [`npm` installed locally](https://www.npmjs.com/get-npm). then clone (or fork/clone) the repository to a local directory and run the command.

```
npm install
```

This will ensure all the appropriate packages are downloaded and installed for the project.

### Running the Application

Once `neo4j` and the node/express setup is complete the application can be run using `nodemon`.

## Endpoints

All endpoints come from `http://throughputdb.com/api/` and then:

### Research Databases:

- `http://throughputdb.com/api/ccdr` with query parameters:

  - `keyword`: Search research data resources (databases and catalogs) by defined keyword
  - `search`: Fulltext search for a research data resource by name and description.
  - `limit`: [30] Maximum number of records to return.
  - `offset`: [30] Maximum number of records to return.

#### Examples:

- <http://throughputdb.com/api/ccdr?keyword=climate>
- <http://throughputdb.com/api/ccdr?search=earthquake>

### Linked Code repositories

Code repositories linked to research databases:

- `http://throughputdb.com/api/ccdr/linked` with query parameters:

- `id`: Unique database identifiers (provided by `ccdr`)

- `limit`: [30] Maximum number of records to return.

- `offset`: [30] Maximum number of records to return.

#### Examples:

- <http://throughputdb.com/api/ccdr/linked?id=r3d100012498,r3d100012345>

### Keyword Searches

- `http://throughputdb.com/api/keywords`

  - `keyword`: A comma separated string of keywords: `climate,weather,botany`

  - `limit`: [30] Maximum number of records to return.

  - `offset`: [30] Maximum number of records to return.

### Summary Endpoints

- `http://throughputdb.com/api/summary/types` Returns the count of each object type in the database.
