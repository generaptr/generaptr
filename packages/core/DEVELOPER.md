# Building and Testing generaptr

This document describes how to set up your development environment to build and test generaptr.
It also explains the basic mechanics of using `git`, `node`, and `npm`.

* [Prerequisite Software](#prerequisite-software)
* [Getting the Sources](#getting-the-sources)
* [Installing NPM Modules](#installing-npm-modules)
* [Building](#building)
* [Running Tests Locally](#running-tests-locally)

See the [contribution guidelines](https://github.com/generaptr/generaptr/blob/develop/CONTRIBUTING.md)
if you'd like to contribute to generaptr.

## Prerequisite Software

Before you can build and test generaptr, you must install and configure the
following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version `>=7.5.0`) which is used to run a development web server,
  run tests, and generate distributable files. We also use Node's Package Manager, `npm`
  (version `>=4.0.0`), which comes with Node. Depending on your system, you can install Node either from
  source or as a pre-packaged bundle.

## Getting the Sources

Fork and clone the generpatr repository:

1. Login to your GitHub account or create one by following the instructions given
   [here](https://github.com/signup/free).
2. [Fork](http://help.github.com/forking) the [main generaptr
   repository](https://github.com/generaptr/generaptr).
3. Clone your fork of the generaptr repository and define an `upstream` remote pointing back to
   the generaptr repository that you forked in the first place.

```shell
# Clone your GitHub repository:
git clone git@github.com:<github username>/generaptr.git

# Go to the generaptr directory:
cd generaptr

# Add the main generaptr repository as an upstream remote to your repository:
git remote add upstream https://github.com/generaptr/generaptr.git
```
## Installing NPM Modules

Next, install the JavaScript modules needed to build and test generaptr:

```shell
# Install generaptr project dependencies (package.json)
npm install
```

## Building

To build generaptr run:

```shell
typings install

npm run verify
```

* Results are put in the lib folder.

## Running Tests Locally

To run tests:

```shell
$ npm test                   # Run all generpatr tests
```

You should execute the test suites before submitting a PR to github.

All the tests are executed on our Continuous Integration infrastructure and a PR could only be merged once the tests pass.

- Travis CI fails if any of the test suites described above fails or linting issues are found.

## Linting/verifying your source code

You can check that your code is properly formatted and adheres to coding style by running:

``` shell
$ npm run lint
```
