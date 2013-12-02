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

    // Custom prompt for client name
    {
      name: 'client_name',
      message: 'Who is the client?',
      "default": 'Squiz',
      validator: /^[\w\-\.\_]+$/,
      warning: 'Must be only letters, numbers, dashes, dots or underscores. (If this is not for a client, leave the default at Squiz)'
    },

    {
      name: 'client_project',
      message: 'What is the name of the client project?',
      "default": 'Internet Site',
      validator: /^[\w\-\.\s\_]+$/,
      warning: 'Must be only letters, numbers, dashes, spaces, dots or underscores.'
    },

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
      'sass':                   '~0.5.0',
      'underscore':             '~1.4.4',
      'grunt-contrib-copy':     '0.4.x',
      'grunt-contrib-concat':   '0.3.x',
      'grunt-contrib-clean':    '0.5.x',
      'grunt-contrib-jshint':   '0.6.x',
      'grunt-contrib-watch':    '0.5.x',
      'grunt-contrib-qunit':    '0.2.x',
      'grunt-contrib-sass':     '0.5.x',
      'grunt-contrib-uglify':   '0.2.x',
      'grunt-html-validation':  '~0.1.5',
      'grunt-jsbeautifier':     '0.2.3',
      'grunt-markdown':         '0.4.x',
      'grunt-prettify':         '0.3.x',
      'grunt-replace':          '0.5.x',
      'grunt-lib-phantomjs':    '0.4.0'
    };
    props.peerDependencies = {
      'grunt': props.grunt_version
    };

    // Files to copy (and process).
    var files = init.filesToCopy(props);

    // Add properly-named license files.
    // init.addLicenseFiles(files, props.licenses);

    // Sort out image files, they need to be separated from the
    // process function
    init.copyAndProcess(files, props, {
      noProcess: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.ico', '*.ttf', '*.otf', '*.svg', '*.woff', '*.eot']
    });

    // Generate package.json file.
    init.writePackageJSON('package.json', props);

    // All done!
    done();
  });

};
