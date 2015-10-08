# Off Canvas Nav

[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate
[Hammerjs]: http://hammerjs.github.io/

> Accessible off canvas navigation jquery plugin adding touch support with [Hammerjs][]

## Overview

This plugin incorporates several methods discussed in the associated [best practice topic](https://squizmap.squiz.net/imp-bp/4623) using CSS transforms for animation (no fallbacks, better not to use it when tranforms are not available - IE 8 and lower).

It supports swipe left and right to open and close the menu, tap support outside of the nav area to close and either nav contained within an element or global fixed position nav.

For accessibilty it supports some aria attributes that attempt to describe expanded state of the nav element and button roles & control assignments.

The plugin is invoked on the button element which is associated to a nav element via the aria-controls attribute.

Example:
```html
$('.off-canvas__toggle').SquizOffCanvas(options);
```

## Data attributes

### data-swipe

Whether the nav should respond to swipe left or right events to open/close

Default: `false`

Example:
```html
<button class="off-canvas__toggle" aria-controls="off-canvas__nav-global" data-swipe="true">Menu</button>
```

### data-tap

Whether the nav should respond to a tap event outside of the nav to close it

Default: `false`

Example:
```html
<button class="off-canvas__toggle" aria-controls="off-canvas__nav-global" data-tap="true">Menu</button>
```

## Options

The following is a list of options that can be passed to the plugin

| Option | Default | Description |
| ------ | ------- | ----------- |
| classes.container | off-canvas | The class of the container (plugin searches for this) |
| classes.closeButton | off-canvas__close | The class of the close button inside the nav (searches for this) |
| classes.navActive | off-canvas--active | The class applied to the nav when active |
| classes.toggleActive | off-canvas__toggle--active | The class applied to the toggle button when active |
| classes.left | off-canvas__nav--left | The modifier class for left aligned nav |
| classes.right | off-canvas__nav--right | The modifier class for right aligned nav |
| swipeElem | document.body | The element to detect swipe events on |
| tapElem | document.body | The element to detect tap events on |

## Methods

The plugin object has the following methods available. You can access the instantiated object using the following example:

```javascript
var plugin = $('.off-canvas__toggle').data('plugin_SquizOffCanvas');
// call methods, e.g.
plugin.destroy();
```

### init

Initialise/Re-initialise the plugin

### isActive

Returns a boolean based on the current active state of the nav

### open

Open the nav

### close

Close the nav

### toggle

Toggle the state of the nav between open & close

### destroy

Destroy the nav plugin by unbinding it's events