# Revision History

## `3.0.3`
* New modules: Text Underline, Time ago jQuery plugin, Mediaelement.js helper, Legal List styles
* Updated modules: Spritesheet improved to reduce duplicate CSS, Parallax module updated for performance improvements
* General updates: Improved README generated, Change log split into separate file

## `3.0.2`
* Parse file no longer included in parser due to uncertain results parsing non HTML content (i.e Matrix design tags).

## `3.0.1`
* Box sizing set to `border-box` using the inheritance method to all elements
* Fixed some module qunit tests to pass jenkins daily CI tests

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