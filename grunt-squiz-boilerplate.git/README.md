# Grunt Squiz Boilerplate

The primary [Grunt.js](http://gruntjs.com) task for handling template parsing in the Squiz Boilerplate. This task uses htmlparser2 to scan HTML for specially formatted comments resolving them into dynamic content. These are mostly for the combination of HTML, JS, CSS and Sass from a source directory to a target directory.

## Quick example

```
grunt.initConfig({
    'boilerplate-importer': {
        main: {
            options: {
                dest: 'dist'
            },
            files: {
                src: [
                    'source/html/*.html',
                    '!source/html/_*.html'
                ],
            }
        }
    }
});
```

## Options

### dest

Type: `String`
Default: `` If blank this will be the current working directory

The destination directory, e.g. `dist`

### sass

Type: `Hash`
Default:
```
{
    includePaths:   [],
    sourceMap:      false,
    sourceComments: false,
    outputStyle:    'nested'
}
```

These options are passed directly to [node-sass](https://github.com/sass/node-sass)

### filePrefixes

Type: `Hash`
Default: `{}`

A hash of key/values where the key is the prefix and the value is a `String` or an `Array` of strings containing the value of the prefix. An example:

```
{
    module: [
        'source/bower-components/squiz-module-',
        'source/modules/'
    ]
}
```

The prefix `module:` becomes available to all directive file paths and helps shortcut complex or repetitive directory configuration. It also allows passing of multiple paths in a single file pattern.

### filePrefixes filtering

An alternate syntax for providing custom filtering/sorting features over the files resolved by a file prefix.

```
{
    module: {
        prefixes: [
            'source/bower-components/squiz-module-',
            'source/modules/'
        ],
        // Sort/Filter an array of files
        filter: function(files) {
            return files;
        }
    }
}
```

### banner

Type: `Function`
Default: `function(file) { return null; }`

This function allows the insertion of banner content into concatenated build blocks at the top of each file. Custom logic can be added into the function to return a banner content conditional on the file path it is currently processing.

## Directives

The following is a list of the directive flavours that can be used

### import:js

Example:
```html
<!-- import:js path/to/jsFile.js -->
```

Outputs:
```html
<script src="path/to/jsFile.js"></script>
```

### import:css

Example:
```html
<!-- import:css path/to/style1.css -->
<!-- import:css path/to/style2.css { "media": "(min-width: 60em)" } -->
```

Outputs:
```html
<link rel="stylesheet" href="path/to/style1.css" />
<link rel="stylesheet" href="path/to/style2.css" media="(min-width: 60em)" />
```

### import:content

Example: (Where the content of the `file.html` is `<p>Awesome Example!</p>`)
```html
<!-- import:content path/to/file.html -->
```

Outputs:
```html
<p>Awesome Example!</p>
```

### import:browserify

[Browserify](https://github.com/substack/node-browserify) and [Browserify-Shim](https://github.com/thlorenz/browserify-shim) are run across the source files transforming any node style `require()` statements into usable code in the browser. Great for very large projects and complex dependency chains

**Note:** the `target` in options is mandatory

Example:
```html
<!-- import:js path/to/module.js {"target": "tmp/js/modules.js"} -->
```

Outputs:
```html
<script src="tmp/js/modules.js"></script>
```

### import:markdown

Takes [Github flavoured markdown](https://help.github.com/articles/github-flavored-markdown/) and transforms it into HTML. This is very useful for turning documentation into HTML.

Example:
```html
<!-- import:markdown path/to/README.md -->
```

### import:handlebars

Takes Handlebars templates and transforms it into HTML. This is very useful for taking a re-usable data source and constructing several templates.

Example:
```html
'<!-- import:handlebars path/to/template.hbs { "data": "path/to/data.json", "helpers": "path/to/helper.js" } -->'
```

**data** Should be a path to valid JSON format. Used as the context for the handlebars template.
**helpers** (optional) Path to additional JS files containing Handlebars helpers. These are required as Node modules when used so should be built accordingly (see the example in the tests in this repository).

### build:js

Example:
```html
<!-- build:js .tmp/js/file.js -->
    <!-- import:js path/to/1.js -->
    <script src="path/to/2.js"></script>
<!-- endbuild -->
```

Output:
```html
<script src=".tmp/js/file.js"></script>
```

Exports a file called `.tmp/js/file.js` with the combined content of both `path/to/1.js` and `path/to/2.js`. Leaves a 

### build:css

Example:
```html
<!-- build:css .tmp/styles/main.css { "media": "(min-width: 37.5em)" } -->
    <!-- import:css path/to/1.css -->
    <link rel="stylesheet" href="path/to/2.css" />
<!-- endbuild -->
```

Output:
```html
<link rel="stylesheet" href=".tmp/styles/main.css" media="(min-width: 37.5em)" />
```

Exports a file called `.tmp/styles/main.css` with the combined content of both `path/to/1.css` and `path/to/2.css`. The directive can be passed a JSON formatted array of options including `media` which will pass any values through onto the resulting link tag.

### build:sass

Example:
```html
<!-- build:sass dist:styles/global.css -->
    <!-- import:css source:styles/global.scss -->
    <!-- import:css module:**/css/variables.scss,module:**/css/global.scss -->
<!-- endbuild -->
```

Output:
```html
<link rel="stylesheet" href="styles/global.css" />
```

Exports a file called `styles/global.scss` in the directory(s) specified in the `dist:` prefix (see the Grunt task options for this plugin). The content of this file is a combination of all subsequent link tags (either manual or generated by import:css directives) and run a Sass processor over the top.

Note: the relative link path is generated on the assumption that the resulting file will be in the same directory as the HTML file this plugin generates. To stop this behavior the prefix can be dropped and replaced with a static path relative to the current working directory.

### Block options

`abspath` - Converts the path generated by the build directives to an absolute path by prefixing a forward slash. This can help if you are planning to serve the resulting template from a static web server instead of uploading to a Matrix system.

Example
```html
<!-- build:js dist:path/to/jsfile.js { "abspath": true } -->
    ...
<!-- endbuild -->
```

Output:
```html
<script src="/path/to/jsFile.js"></script>
```

# Change log

* `0.0.5` - Added browserify block
* `0.0.4` - Self closing tag support & suppress option
* `0.0.3` - Parser fixes (doctype parses correctly)
* `0.0.1` `0.0.2` - Internal testing for boilerplate HTML parser replacement from line by line regex