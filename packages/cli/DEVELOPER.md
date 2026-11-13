# Building and Testing generaptr

This document describes how to set up your development environment to build and test generaptr-cli.
It also explains the basic mechanics of using `git`, `node`, and `npm`.

* [Prerequisite Software](#prerequisite-software)
* [Getting the Sources](#getting-the-sources)
* [Installing NPM Modules](#installing-npm-modules)
* [Building](#building)
* [Running Tests Locally](#running-tests-locally)

See the [contribution guidelines](https://github.com/generaptr/generaptr-cli/blob/develop/CONTRIBUTING.md)
if you'd like to contribute to generaptr-cli.

## Prerequisite Software

Before you can build and test generaptr-cli, you must install and configure the
following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version `>=7.5.0`) which is used to run a development web server,
  run tests, and generate distributable files. We also use Node's Package Manager, `npm`
  (version `>=4.0.0`), which comes with Node. Depending on your system, you can install Node either from
  source or as a pre-packaged bundle.

## Getting the Sources

Fork and clone the generpatr-cli repository:

1. Login to your GitHub account or create one by following the instructions given
   [here](https://github.com/signup/free).
2. [Fork](http://help.github.com/forking) the [main generaptr-cli
   repository](https://github.com/generaptr/generaptr-cli).
3. Clone your fork of the generaptr-cli repository and define an `upstream` remote pointing back to
   the generaptr-cli repository that you forked in the first place.

```shell
# Clone your GitHub repository:
git clone git@github.com:<github username>/generaptr-cli.git

# Go to the generaptr-cli directory:
cd generaptr-cli

# Add the main generaptr-cli repository as an upstream remote to your repository:
git remote add upstream https://github.com/generaptr/generaptr-cli.git
```
## Installing NPM Modules

Next, install the JavaScript modules needed to build and test generaptr-cli:

```shell
# Install generaptr-cli project dependencies (package.json)
npm install
```

## Building

To build generaptr-cli run:

```shell
npm run link
```


## Running Tests Locally

To run tests:

```shell
$ npm test                   # Run all generpatr-cli tests
```

You should execute the test suites before submitting a PR to github.

All the tests are executed on our Continuous Integration infrastructure and a PR could only be merged once the tests pass.

- Travis CI fails if any of the test suites described above fails or linting issues are found.

## Linting/verifying your source code

You can check that your code is properly formatted and adheres to coding style by running:

``` shell
$ npm run lint
```
