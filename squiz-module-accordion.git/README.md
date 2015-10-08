# Accordion

[Bower]: http://bower.io/
[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> An accessible [Squiz Boilerplate][] accordion with css :target fallback when JS is not present

## Overview

The accordion is a custom jQuery plugin (`UberAccordion`) designed to more easily handle expand and collapse behavior. This plugin isn't limited to accordions and can handle other expand/collapse or show/hide behavior when there is a link and a target div. Some potential uses include tabs, or content display toggles.

## Quick Start

You'll need the following:

* Container element
* At least 1 element to act as a button, preferably a hyperlink
* At least 1 target element, can be anything so long as it has been assigned an id

```html
<div class="accordion">
    <h2><a href="#targetid" class="accordion__item">A link</a></h2>
    <div id="targetid">A target</div>
</div>
```

To start the accordion:

```javascript
// button class is the only required option here, it needs to
// know where to find the accordion links to match them with the
// target ids
$('.accordion').UberAccordion({
    buttonClass: 'accordion__link'
});
```

## Options

### buttonClass

Type: `String`

The name of the button class (no . required). Each class found under the container will be bound with a new button click event to drive the accordion behavior.

### appliedClasses

Type: `Object`

A hash of applied class names. This shouldn't need to be changed, but if the default class names are an issue it's here. Checkout the `plugin.js` file for further insight into the class names used.

### autoExpand

Type: `Mixed`

An id to auto expand when first initialised

Values

* `null` no auto expansion
* `String` alocation.hash with the prefix #
* `Function` return the hash that should be expanded on init

**Function example:**

```javascript
    autoExpand: function($elem) {
        return this.$buttons.first().attr('href');
    }
```

### toggle

Type `Boolean`

Allow items to be toggled.
* **true** (default) successive clicks will toggle the visible state of the target element
* **false** initial click will set the target element visible, successive clicks are ignored

### multiple

Type: `Boolean`

Whether to allow multiple items to be expanded

* **true** (default) multiple
* **false** only a single element can be expanded at a time

### expandOnFocus

Type: `Boolean`

Whether to automatically expand an item when button gets keyboard focus, or any element inside the target has been focused.

* **true** Expand a target when button or internal element has been focused
* **false** (default) Do not expand

### preventDefaultButton

Type: `Boolean`
Default: `true`

Prevent the default button action (e.g hash change). If you don't prevent this the default browser scroll behavior to the target id will occur as button clicks may update the window.location.hash

### hashChange

Type: `Boolean`
Default: `true`

Whether this plugin should respond to hash change events

### onSelect

Type: `Function`

Each time an item is selected this function will be called passing the active $button and $target pair.

```javascript
onSelect: function($button, $target) {}
```

## Methods

### destroy

When you need to destroy the accordion and unbind it's internal events, e.g. accordion that responds to screen width changes.

```javascript
$('.accordion').UberAccordion('destroy');
```

### toggleActive

When you want to programmatically toggle the active state of an element

```javascript
$('.accordion').UberAccordion('toggleActive', '#targetid', true);
```