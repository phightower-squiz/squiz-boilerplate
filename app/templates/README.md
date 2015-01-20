# <%= friendlyName %>

Status: <%= status %>

Static design templates for [<%= friendlyName %>]<% if (url) { %>(<%= url %>)<% } %>.

## Getting Started

If you have just checked out this repository, you will need to run some commands to get up and running.

First, navigate to the root folder of this project on your local drive:

```bash
cd /local/path/to/<% if (customDirectory) { %><%= customDirectory %><% } else { %><%= name %><% } %>
```

Install Node modules:

```bash
npm install
```

Install Bower modules:

```bash
bower install
```

Run Grunt to compile dist files:

```bash
grunt
```

Run a local web server to view the design templates:

```bash
grunt serve
```

View the files on the local web server using a browser:

http://localhost:9002

## Tasks

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

## Help

Reference articles on Squiz Boilerplate are available at the official wiki:

[Squiz Boilerplate Wiki](https://gitlab.squiz.net/boilerplate/squiz-boilerplate/wikis/home)