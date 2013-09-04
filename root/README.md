# Installation

Installation of the boilerplate first requires a few pre-requisites:

* Ruby (Sass)
* Git: https://help.github.com/articles/set-up-git
* Node: http://howtonode.org/how-to-install-nodejs

## Install Sass

After Ruby is installed on your system you can use Ruby's gem package manager
to install the Sass compiler:

```Shell
gem install sass
```

## Install Grunt

Grunt is a task based build tool well suiting to web projects. Grunt has been
used here to help automate the construction of HTML, CSS and JS fit for
distribute from a series of source files.
http://gruntjs.com/

```Shell
npm install -g grunt
npm install -g grunt-init
```

After the prerequites are sorted it's time to get the package and install it into
the path of user profile ~/.grunt-init/

Replace 'username' with your Squiz network username.
```Shell
git clone username@cvs.squiz.net:/data/git/squiz-boilerplate.git ~/.grunt-init/boilerplate
```

# Starting a new cutup

```Shell
mkdir new_project && cd new_project
grunt-init boilerplate
npm install
```

These commands will create a new directory, initialise the boilerplate
with all of the necessary files. The grunt-init command will ask you a series of
questions which will help setting up the initial choices for the build.
Subsequent changes can be made to the projects Gruntfile.js which can be edited
and tweaked.

# Building the HTML, CSS & JS

In the project directory
```Shell
grunt
```

This command will execute the default task for grunt and build all the required
code into a /dist directory.

# Revision History

## `0.9a` - Alpha release
* Added new HTML prettify task
## `1.0`  - First verion release
* New configuration file `config.json` that replaces `modules.json`.
* Grunt tasks split into separate css, html, css, files and documentation to improve performance of the watch task
* New dynamic file location replacements with the `@@files` variable in CSS and HTML files. Default is `mysource_files` instead of `files`
* Dynamic generation of CSS link tags based on `config.json`
* Removed individual example file generation for simplicity and performance
* Removed module numbering system in generated files for simplicity and performance
* Added new JS beautify task
* Added new Markdown to HTML document generation for docs
* Replaced some of the previously complicated and custom file concatenation with default grunt concat task
