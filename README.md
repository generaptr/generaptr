![](http://i.imgur.com/yCRAubA.png)
========

[![Build Status](https://travis-ci.org/cupsadarius/generaptr.svg)](http://travis-ci.org/cupsadarius/generaptr) [![Join the chat at https://gitter.im/generaptr/proposals](https://badges.gitter.im/generaptr/proposals.svg)](https://gitter.im/generaptr/proposals?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

-------
### Generaptr is a node cli package that:

* for relational databases
  reads the database schema and generates a valid *.raml file containing the models and api.
* for non-relational databases
  based on already existing models generates a valid *.raml file containing the api.
* for a valid *.raml file
  generates the models and the CRUD api

-------
## Docs

* [RFC: Approach for generating api's from relational databses.](./docs/rfc/ForRelationalDatabases.md)
* [RFC: Approach for generating api's from non-relational databses.](./docs/rfc/ForNonRelationalDatabases.md)

-------
## Global dependencies

```
node >= v7.5.0
npm >= v3.10.10
```

-------
## Research

* [RAML](http://raml.org)
* [Commander.js](https://github.com/tj/commander.js)
