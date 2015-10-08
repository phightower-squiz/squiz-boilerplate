# Twitter Bootstrap

[Bower]: http://bower.io/
[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> Modular way to include twitter bootstrap into a project

## Overview

Bootstrap is configured by default in 'kitchen sink' mode. Edit the following files to customise the install to your project:

`css/variables.scss` - comment out the styles you don't need. Be careful of dependencies between files.
`import/_js.html` - If you don't want all bootstrap JS you will need to pull in individual files instead of the pre-built bootstrap.js that contains **everything**.

TL;DR: Please customise this if you use it, you aren't likely to need everything.