![](http://i.imgur.com/yCRAubA.png)
========

[![npm](https://badge.fury.io/js/generaptr.svg)](http://badge.fury.io/js/generaptr)[![Build Status](https://travis-ci.org/cupsadarius/generaptr.svg)](http://travis-ci.org/cupsadarius/generaptr) [![Join the chat at https://gitter.im/generaptr/proposals](https://badges.gitter.im/generaptr/proposals.svg)](https://gitter.im/generaptr/proposals?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Coverage Status](https://coveralls.io/repos/github/cupsadarius/generaptr/badge.svg?branch=develop)](https://coveralls.io/github/cupsadarius/generaptr?branch=develop)

Generaptr is a node cli package that helps when starting up a package by generating boilerplate code for Express api.

-------
## Table of Contents
    1. [Documentation](#documentation)
        1.[Minimum Requirements](#minimum-requirements)
        2.[Installation](#instalation)
        3.[Examples](#examples)
    2.[Support](#support)
    3.[Code of Conduct](#code-conduct)
    4.[Contributing](#contributing)
    5.[License](#license)
    6.[References](#references)

## Goal and Philosophy
* for relational databases
  reads the database schema and generates a valid *.raml file containing the models and api.
* for non-relational databases
  based on already existing models generates a valid *.raml file containing the api.
* for a valid *.raml file
  generates the models and the CRUD api


## [Documentation](#documentation)
<a name="documentation"></a>
### [Minimum Requirements](#minimum-requirements)
<a name="minimum-requirements"></a>
The package was developed under `node 7.5` so a minimum requirement would be:
* `node >= v7.5.0`
* `npm >= v3.10.10`
### [Installation](#instalation)
<a name="instalation"></a>

``` shell
npm install generaptr
```

### [Examples](#examples)
<a name="examples"></a>
## [Support](#support)
<a name="support"></a>
You should expect mostly good support for the CLI below. This does not mean we won't
look at issues found on other command line - feel free to report any!

- **Mac OS**:
  - Terminal.app
  - iTerm
- **Windows**:
  - cmd.exe
  - Powershell
  - Cygwin
- **Linux (Ubuntu, openSUSE, Arch Linux, etc)**:
  - gnome-terminal (Terminal GNOME)
  - konsole
## [Code of Conduct](#code-conduct)
<a name="code-conduct"></a>

See [Code of Conduct](./CODE_OF_CONDUCT.md) for more information.
## [Contributing](#contributing)
<a name="contributing"></a>

**Unit test**
Unit test are written in [Mocha](https://mochajs.org/) and [Assert](https://nodejs.org/api/assert.html). Please add a unit test for every new feature or bug fix. `npm test` to run the test suite.

**Documentation**
Add documentation for every API change. Feel free to send typo fixes and better docs!

## [License](#license)
<a name="license"></a>

Copyright (c) 2017 Darius Cupsa (twitter: [@cupsadarius](https://twitter.com/cupsadarius))
Licensed under the GPL-3.0 license.
## [References](#references)
<a name="references"></a>
* [RAML](http://raml.org)
* [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/)
* [Express.js](https://expressjs.com)

