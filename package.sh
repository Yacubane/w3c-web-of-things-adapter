#!/bin/bash

# Clean up previous releases
rm -rf *.tgz

# Prepare sha256sum file of package content
sha256sum manifest.json package.json *.js LICENSE README.md >SHA256SUMS

# Install node dependancies
npm install --production
rm -rf node_modules/.bin
find node_modules \( -type f -o -type l \) -exec sha256sum {} \; >>SHA256SUMS

# Create tar package
TARFILE=$(npm pack)
tar xzf ${TARFILE}
rm ${TARFILE}
cp -r node_modules ./package
tar czf ${TARFILE} package

# Clean working directiores and files
rm -rf package node_modules
rm -f SHA256SUMS

echo "Created ${TARFILE}"
