#!/bin/bash

# Creates a test fixture project and executes jsdoc
# This is intended to test the project from the ground-up

rm -rf /fixture-test
cp /project/test/fixture/project /fixture-test -R
cd /fixture-test

# Copy the Example Configs
cp /project/example/config /fixture-test/config -R

# Copy the Example Scripts
cp /project/example/scripts /fixture-test/scripts -R

# Set Permissions
chown vagrant:vagrant /fixture-test -R
chown 0777 /fixture-test -R

# Link to global c2cs-jsdoc instance
npm link c2cs-jsdoc

# Defer to example script
npm run-script docs
#cd /fixture-test
#ls -la
