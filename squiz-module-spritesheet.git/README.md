# Spritesheet

[Bower]: http://bower.io/
[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> Spritesheet Sass styles & mixins

**Note:** The included `spritesheet.ai` file is a sample template used by the design team to generate a final file.

## Overview

This spritesheet is expected to match the order in which icons are placed on an SVG spritesheet by the Squiz design team. There will still need to be some manual modifications by the implementer to get this in place, but this module offers a very solid starting point.

Checkout the sprite sheet the designers use in the file `spritesheet.ai` (Adobe Illustrator) file. You can take this file from a designer and export both svg and png versions of the sheet to replace the example spritesheet located in this module under `css/files/sprites.*`

## Variables

### $sprites__icon-grid-size

The grid size of the spritesheet in pixels (e.g. 50px).

**Note:** The spritesheet must be laid out in a grid in order for this to work properly. This means each new image starts at the top left corner of the grid coordinate

### $sprites__sheet-width

The overall width of the spritesheet in pixels (e.g. 400px). This is used to help calculate the scale of the image if it should be scaled down (or up).

### $sprites__sheet-height

The total height of the spritesheet in pixels (e.g. 1000px). This is used to help calculate the scale of the image if it should be scaled down (or up).

### $sprites__src-png

The name of the sprite png file (e.g. "sprite.png"). This is required.

### $sprites__src-svg

The name of the sprite svg file (e.g. "sprite.svg"). This is not required, but must be left as a blank string if there is no svg file for it.

### $sprites__icons

This is the most important variable to consider with the spritesheet. It identifies the location of each image in the spritesheet by column and row index (starting at 0), and specifies a height and width for the image. This variable is a list and due to limitations with lists in Sass 3.2 it is formatted in a particiular way to 'cheat' as an associative array.

Icons are given positional information with the following format:
```scss
$sprites__icons:
    search, // Icon Name (formatted as suitable for css class)
    (0,     // Row index (starting at 0)
     0,     // Column index (starting at 0)
     23,    // Width (pixel)
     23)    // Height (pixel)

;// End of the list
```

## Mixins

### sq-sprite-bg

The mixin that generates the background image url & defaults. Can be used to generate a generic class that is re-usable across multiple icons. The example classes generated in the Sass loop located in `global.scss` will demonstrate how this is best used.

### sq-sprite

This mixin is designed to shortcut the application of the following CSS properties: background, background-image, background-position, background-size (if scale is something other than 1), width and height.

* **$name** The name of the icon in the `$sprites__icons` list
* **$scale** The scale of the icon (default is 1), e.g. .5 is 50% of original size

```scss
.my-sprite {
    @include sq-sprite-bg();
    @include sq-sprite(search);
}
```

### sq-sprite-pseudo

This mixin is designed to shortcut the application of the same CSS properties as `sq-sprite` but applying them as a *:before* or *:after* pseudo element. This would be the most common usage of the sprite mixins allowing an icon to be placed before or after an element.

* **$name** The name of the icon in the `$sprites__icons` list
* **$elem** The position of the pseudo element (either **before** or **after**).
* **$scale** The scale of the icon (default is 1), e.g. .5 is 50% of original size

```scss
.my-sprite {
    @include sq-sprite-pseudo(search);
}
```

## Example HTML

```html
<span class="sq-icon sq-icon__search"></span>
```