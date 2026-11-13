#!/usr/bin/env bash

# Publishes generaptr to NPM based on the current version in package.json
# This script must be run with yarn: "yarn run publish:local"

set -e

rm -rf tempPublish
mkdir tempPublish

git clone git@github.com:generaptr/generaptr.git tempPublish
cd tempPublish
git checkout $npm_package_version

yarn install --pure-lockfile
npm install typescript@2.4.2
typings install
yarn run verify

# courtesy of https://stackoverflow.com/a/3232082/3124288
read -r -p "Are you sure you want to publish version $npm_package_version? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
    npm publish --tag latest
else
    echo "Publishing aborted"
fi

cd ..
rm -rf tempPublish
