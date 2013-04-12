/*
 * grunt-init-boilerplate
 * https://gruntjs.com/
 */

'use strict';

// Basic template description.
exports.description = 'Generate scaffolding for the Squiz Boilerplate.';

// Template-specific notes to be displayed before question prompts.
exports.notes = 'This will setup a basic scaffold for the Squiz Boilerplate ' +
  'that can be used in conjunction with Grunt to create and manage design cutups.';

// Template-specific notes to be displayed after question prompts.
exports.after = 'All Done';

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = '*';

// The actual init template.
exports.template = function(grunt, init, done) {

  init.process({type: 'grunt'}, [
    // Prompt for these values.
    init.prompt('name', 'squiz_boilerplate'),
    init.prompt('description', ''),
    init.prompt('version', '0.0.1'),
    init.prompt('author_email', '<name>@squiz.com.au')
    /*
    init.prompt('repository'),
    init.prompt('homepage'),
    init.prompt('bugs'),
    init.prompt('licenses'),
    init.prompt('author_name'),
    
    init.prompt('author_url'),
    init.prompt('grunt_version'),
    init.prompt('node_version', grunt.package.engines.node)
    */
  ], function(err, props) {
    // Set a few grunt-plugin-specific properties.
    props.short_name = props.name;
    props.main = 'Gruntfile.js';
    props.npm_test = 'grunt test';
    props.keywords = ['gruntplugin'];
    props.devDependencies = {
      'sass': '*',
      'grunt-contrib-copy': '*',
      'grunt-contrib-concat': '*',
      'grunt-contrib-clean': '*',
      'grunt-contrib-jshint': '*',
      'grunt-contrib-watch': '*',
      'grunt-contrib-nodeunit': '*',
      'grunt-contrib-sass': '*'
    };
    props.peerDependencies = {
      'grunt': props.grunt_version
    };

    // Files to copy (and process).
    var files = init.filesToCopy(props);

    // Add properly-named license files.
    // init.addLicenseFiles(files, props.licenses);

    // Actually copy (and process) files.
    init.copyAndProcess(files, props);

    // Generate package.json file.
    init.writePackageJSON('package.json', props);

    // All done!
    done();
  });

};
