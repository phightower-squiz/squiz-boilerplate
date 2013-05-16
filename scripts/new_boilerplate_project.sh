#!/bin/bash

# Simple helper script that creates a new directory and runs all the grunt init
# and npm installation.

DEST_DIR=$1;

if [ -z "$1" ]; then
    echo "No directory name supplied"
    exit 0;
fi

if [ ! -d $DEST_DIR ]; then
    mkdir $DEST_DIR
fi

if [ ! -d $DEST_DIR ]; then
    echo "Could not create directory, check permissions"
    exit 0;
fi

cd $DEST_DIR;

FULL_DIR=`pwd`;

grunt-init boilerplate
npm install
grunt

echo "New boilerplate project ready at: $FULL_DIR"