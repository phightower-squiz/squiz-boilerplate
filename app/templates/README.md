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

## Install Yeoman

Yeoman is used to provide the boilerplate with automated generation and workflow tools in conjunction with Grunt and Bower.

```Shell
npm install -g yo
```

After the prerequites are sorted it's time to get the install the boilerplate generator:

```Shell
npm install -g git+https://gitlab.squiz.net/boilerplate/generator-squiz-boilerplate.git
```

# Starting a new cutup

```Shell
mkdir new_project && cd new_project
yo squiz-boilerplate
```

These commands will create a new directory, initialise the boilerplate with all of the necessary files. This command will ask you a series of questions which will help setting up the initial choices for the build. Subsequent changes can be made to the projects Gruntfile.js which can be tweaked for any custom
build options that the boilerplate doesn't already offer.

Running the initial `grunt` without any parameters will give you a basic build and confirm that all
of the pre-requisites have been installed correctly.

# Tasks

To call a specific task the syntax is as follows:
```Shell
grunt [task name]
```

***

```Shell
grunt
```
This is the default "build" task for the boilerplate and will read all source files and create a new directory. The destination directory is defined by the `config.json` "destination" property (defaults to `dist`).

```Shell
grunt build_js
grunt build_html
grunt build_css
grunt build_files
grunt build_docs
```
Each task can be broken down into individual components. If a change has been made to a smaller part of the boilerplate source then running an individual component task can save some time. This is used behind the scenes to perform different tasks when the file system is watched for changes.

***

```Shell
grunt watch
```
Watch the file system for changes and perform any builds based on the file type that was changed. For example editing a html file will only trigger the build_html task.

***

```Shell
grunt test
```
Run all associated tests for the Boilerplate including jshint, qunit and htmlcs. Each of these tasks can be run individually by using `grunt jshint`, `grunt qunit` or `grunt htmlcs`.

***

```Shell
grunt clean
```
This will remove any content output in the destination directory. Useful for purging the directory before a rebuild.

Note: this will remove the entire directory.

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