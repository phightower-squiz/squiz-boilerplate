# Installation

Installation of the boilerplate first requires a few pre-requisites:

* Git: https://help.github.com/articles/set-up-git
* Node: http://howtonode.org/how-to-install-nodejs

## Install Yeoman

Yeoman is used to provide the boilerplate with automated generation and workflow tools in conjunction with Grunt and Bower.

```
npm install -g yo
```

After the prerequites are sorted it's time to get the install the boilerplate generator:

```
npm install -g git+https://gitlab.squiz.net/boilerplate/generator-squiz-boilerplate.git
```

## Installing from existing repository

If this is an existing project and you've checked it out of a Git repository and want to get it up and running then after cloning this repository you will need to run the following:

```
npm install
bower install
grunt
```

# Tasks

To call a specific task the syntax is as follows:
```
grunt [task name]
```

***

```
grunt
```

This is the default "build" task for the boilerplate and will read all source files and create a new directory. The destination directory is defined by the `config.json` "dest" property (defaults to `dist`).

***

```
grunt watch
```

Watch the file system for changes and perform any builds based on the file type that was changed.

```
grunt serve
```

Starts a HTTP server to allow proper previewing of files in the `dist` directory. If live reload is available appropriate scripts are injected to allow for dynamic browser refreshes.

***

```
grunt test
```

Run all associated tests for the Boilerplate including jshint, qunit and htmlcs.

***

```
grunt optimise
```

Run optimisation tasks including svgmin, imagemin, uglifyjs and beautification tasks. This should be run before transferring the files to a production system.

***

```
grunt clean
```

This will remove any content output in the destination directory. Useful for purging the directory before a rebuild. **Note:** this will remove the entire directory.

# Revision History

## `3.0.0`
* Fixed an issue where selecting an IE 8 compatible project still resulted in jQuery 2.+ being installed
* Removal of bootstrap and bourbon as generator options, these have been moved to external modules to be included as required.
* Mixins adjusted to be more consistent and also to allow the option of using a mixin vs a placeholder. With some instances of usage libsass got confused and broke rules out of containing @media queries.
* Incorporated a bunch of changes from more recent best practice into the boilerplate template
* HTML Parser has been re-written removing `grunt-usemin` and a few other now redundant packages. This brings some changes to the way the import and build directives are used which has prompted the major semver number update.
* Added `import:markdown` parser
* Added `import:browswerify` parser
* Huge batch of updated modules to support the updated parsing syntax
* New documentation option that parses local README.md to create a documentation site build at `docs`. Can be run by adding the argument `--docs` to the end of any grunt command.
* Added a `--file` argument that can be supplied the name of a html file located in `source/html`. When used only this file will be built which can save on unnecessary processing time if there are many files and `grunt serve` is being used.

## `2.1.0`
* Added deferred module loading for `test` and `optimise` grunt tasks
* Bourbon added as an install oppion
* Now prompts to create a directory via the generator
* Version checking performed every 2 days to warn if the generator is out of date when it is run

## `2.0.7`
* Favicon re-worked to pass validation
* X-Compatible-UA meta tag removed to pass validation (add in only if necessary)

## `2.0.5`
* Removed redundant root folder
* Fixed sq-flex table cell fallback formatting

## `2.0.0rc1` - Yeoman generator conversion

* Grunt init replaced with [Yeoman](http://yeoman.io) Generator
* Keyword replacement syntax changed from `@@` to `{{` and `}}` delimiters. Entire keyword system has been replaced
* New HTML directives added to allow for more flexible customisation of the final build process
* Sass pre-processor changed to compass to improve performance and give access to compass mixins
* Directory structure altered to remove the need for `core` and `libs`.
* Dependency management passed over to [Bower](http://bower.io) for both external libraries and internal modules. Each module now exists in it's own git repository.
* Added core support for Bootstrap Sass allowing for customised components from this framework to be used seamlessly with the boilerplate
* Modules themselves have changed to reduce duplication between bootstrap components and reviewed to reduce complexity
* Re-usable fragments of HTML introduced as a keyword replacement allowing for multiple HTML source files to re-use elements of templated HTML already processed by the boilerplate during builds.
* Option to install IE 8 compatible version. For those cut ups that don't require IE 8 a single CSS file containing `@media` queries can be generated.
* Split modules into 'custom' and 'shared' clearly identifying those modules managed as bower dependencies.

## `1.x`  - First release

* New configuration file `config.json` that replaces `modules.json`.
* Grunt tasks split into separate css, html, css, files and documentation to improve performance of the watch task
* New dynamic file location replacements with the `@@files` variable in CSS and HTML files. Default is `mysource_files` instead of `files`
* Dynamic generation of CSS link tags based on `config.json`
* Removed individual example file generation for simplicity and performance
* Removed module numbering system in generated files for simplicity and performance
* Added new JS beautify task
* Added new Markdown to HTML document generation for docs
* Replaced some of the previously complicated and custom file concatenation with default grunt concat task

## `0.9a` - Alpha release

* Added new HTML prettify task