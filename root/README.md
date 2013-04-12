# Squiz Boilerplate

## Installation

Installation of the boilerplate first requires a few pre-requisites:

* Git: https://help.github.com/articles/set-up-git
* Node: http://howtonode.org/how-to-install-nodejs

### Install Grunt

Grunt is an automated build tool well suiting to JS related projects. Websites
fit well into this category and Grunt has been used here to help automate the
construction of HTML, CSS and JS fit for distribute from a series of source files.
http://gruntjs.com/

```
npm install -g grunt
npm install -g grunt-init
```

After the prerequites are sorted it's time to get the package and install it into
the path of user profile ~/.grunt-init/

```
git clone username@cvs.squiz.net:/data/git/squiz-boilerplate.git ~/.grunt-init/boilerplate
```

## Starting a new cutup

```
mkdir new_project && cd new_project
grunt-init boilerplate
npm install
```

These commands will create a new directory, initialise the boilerplate
with all of the necessary files. The grunt-init command will ask you a series of
questions which will help setting up the initial choices for the build.
Subsequent changes can be made to the projects Gruntfile.js which can be edited
and tweaked.

## Building the HTML, CSS & JS

In the project directory
```
grunt
```

This command will execute the default task for grunt and build all the required
code into a /dist directory.