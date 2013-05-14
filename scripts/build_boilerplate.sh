#!/bin/bash

DEST_DIR=/var/www/scaffold4122/data/public/scaffold/releases/squiz_boilerplate;
DEST_SERVER=scaffold.squiz.net;

# The temporary directory
TMP_DIR=~/.tmp/
if [ ! -d $TMP_DIR ]; then
    mkdir $TMP_DIR
fi
cd $TMP_DIR


# Clean any existing content
if [ -d boilerplate_scaffold_build ]; then
    rm -rf boilerplate_scaffold_build
fi
mkdir boilerplate_scaffold_build && cd boilerplate_scaffold_build

# Get the latest copy of the boilerplate.
grunt-init boilerplate

if [ ! -d source/ ]; then
    echo "Grunt init failed to checkout directory"
    exit 0;
fi

# Install dependencies
npm install

# Basic Build
grunt build --modules=skip_links --dest=build_basic

# "Everything" build
grunt build --dest=build_all

# Create the tarball
tar -zcf build.tar.gz tasks/ lib/ build_basic/ build_all/ source/ .gitignore .svnignore Gruntfile.js package.json README.md modules.json

if [ ! -f build.tar.gz ]; then
    echo "Unable to build tarball"
    exit 0;
fi

# Copy the file up to the server replacing any existing build
scp build.tar.gz squiz@$DEST_SERVER:$DEST_DIR/build-latest.tar.gz;
