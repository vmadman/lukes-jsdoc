#!/bin/bash

echo "--"
echo "Building Docs..."
echo "--"

# Clean Existing Docs
rm -rf doc/html

# Execute JSDoc
node node_modules/lukes-jsdoc/node_modules/jsdoc/jsdoc.js --configure config/html-minimal.json

# Show the JSDoc Output
cd doc/html
ls -la
