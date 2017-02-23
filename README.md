![](http://i.imgur.com/yCRAubA.png)
# generaptr - REST without stress [![](https://circleci.com/gh/cupsadarius/generaptr.svg?style=svg)](https://circleci.com/gh/cupsadarius/generaptr)

### Generaptr is a node cli package that:
* for relational databases
  reads the database schema and generates a valid *.raml file containing the models and api.
* for non-relational databases
  based on already existing models generates a valid *.raml file containing the api.
* for a valid *.raml file
  generates the models and the CRUD api

## Docs

* [RFC: Approach for generating api's from relational databses.](./docs/rfc/ForRelationalDatabases.md)
* [RFC: Approach for generating api's from non-relational databses.](./docs/rfc/ForNonRelationalDatabases.md)


## Global dependencies

* node >= v7.5.0
* npm >= v3.10.10