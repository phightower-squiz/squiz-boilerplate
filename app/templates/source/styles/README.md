[Sass]: http://sass-lang.com/

All boilerplate stylesheets are generated using [Sass][]. Here you will find the documentation for the styles that are available *out-of-the-box* and the features of Sass you can use to help shortcut your own styles.

# Utility Classes

The following utility classes are available to use and are specified in the `source/styles/imports/utilities.scss` file.

**.visuallyhidden**

A class that lets you hide content from display, but does not hide from screen readers. Can be combined with **.focusable** to restore the element to view with keyboard focus, e.g.

```html
<div class="visuallyhidden focusable">I will show when focussed</div>
```

See also: **%screen-hide**

Alias: **.sr-only**

---

**.sr-only**

See: **.visuallyhidden**

---

**.clearfix**

Clears floats for the element

See: **%clearfix**

---

**.hidden**

Hide from both screenreaders and browsers: h5bp.com/u

---

**.invisible**

Hide visually and from screenreaders, but maintain layout

---

**.video-container**

16:9 Ratio container for embedded video. This container is suitable for something like youtube videos.

---

# Variables

Global variables for [Sass][] can be found in the `source/styles/imports/variables.scss` file. These variables can be changed, or added to for anything in the boilerplate that needs to have a variable globally identified. By default this only contains a few:

```scss
// Base font
$base-font-scale: 1;  // The font scale multiplier (e.g. 2 = 32px/2em/2rem)
$base-font-pixel: 16; // Used for font size calculations & conversions
$base-font-colour: #373737;

// Selection highlighting
$content-selection-highlight: #b3d4fc;
```

# Placeholders

**%screen-hide**

Visually hide content on the screen

---

**%screen-show**

Restore visually hidden content to view

---

**%clearfix**

Clears floats for the element

See: **.clearfix**

---

**%list-reset**

Reset the margins, padding and list style of an list element (e.g ul or ol)

See mixin: **sq-list-reset**

---

**%inline-block**

Set the display of an element to *inline-block*

See mixin: **sq-inline-block**

---

**%border-box**

Set the box-sizing of an element to *border-box*

See mixin: **sq-border-box**

---

**%flex-box**

Set the display of an element to flex (or table where flexbox is not available).

---

**%ir**

Image replacement technique

---

# Mixins

## sq-font-size

REM unit font sizing with pixel fall back

This technique will allow external font sizes to be set for html and respected if REMs are supported (everything but IE8 and older).

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $sizeValue | 1 | The size to scale the font relative to `$base-font-pixel` |


Usage:

```scss
.my-element {
    @include sq-font-size(2);
}
```

Outputs:

```css
.my-element {
    font-size: 32px;
    font-size: 2rem;
}
```

---

## sq-rem-attr

Take the value of any css property and give it a rem value alternative with pixel fallback

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $attr | *blank* | The css property to set |
| $sizeValue | 1 | The size to scale the font relative to `$base-font-pixel` |

Usage:

```scss
.my-element {
    @include sq-rem-attr('line-height', 2);
}
```

Outputs:

```css
.my-element {
    line-height: 32px;
    line-height: 2rem;
}
```

---

## sq-transition

Prefixed CSS transitions

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $params | all 1s ease | Arguments that pass directly to the transition property |

Usage:

```scss
.my-element {
    @include sq-transition(opacity .5s ease-in-out);
}
```

Output:
```scss
.my-element {
    -webkit-transition: opacity .5s ease-in-out;
       -moz-transition: opacity .5s ease-in-out;
            transition: opacity .5s ease-in-out;
}
```

---

## sq-transform

Prefixed CSS transforms

See: **sq-transition**

---

## sq-rotate

Prefixed rotation transform with IE compatible filter property

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $deg | *blank* | Degree to rotate |

Usage:

```scss
.my-element {
    // Rotate 90 degress clockwise
    @include sq-rotate(90);
}
```

---

## sq-border-box

Prefixed border box

See: **%border-box%% for alternative placeholder implementation.

Usage:

```scss
.my-element {
    @include sq-border-box;
}
```

## sq-box-shadow

Prefixed box shadow

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $params | *blank* | Arguments to pass direcly to box-shadow property |

Usage:

```scss
.my-element {
    @include sq-box-shadow(4px 4px 4px 4px #000);
}
```

---

## sq-block-glowing-effect

Glow effect that can be used to gloss up elements using box-shadow and transitions to mimick the glow. Taken from Foundation

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $selector | :focus | The CSS selector the effect will trigger on |
| $fade-time | 300ms | Default transition time |
| $glowing-effect-color | blue | The colour of the glowing effect |

---

## sq-border-radius

Prefixed border radius, if needed. This is largely unnecessary now with modern browser support, but kept in place to avoid breaking any older code

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $radius | 4px | The radius to curve the corners |

--

## sq-rounded

Prefixed border radius allowing individual corners to be set

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $vert | *blank* | Either `top` or `bottom` |
| $horz | *blank* | Either `left` or `right` |
| $radius | 4px | The radius to curve the corners |

Usage:

```scss
.my-element {
    @include sq-rounded(top left 6px);
}
```

---

## sq-opacity

Prefixed opacity with filters for IE compatibility

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $value | *blank* | A value between 0 and 100. 100 = opaque, 0 = transparent |

Usage:

```scss
.my-element {
    // 50% transparency
    @include sq-opacity(50);
}
```

---

## sq-svg-background

SVG background image applied with PNG fallback where svg support is not available. This mixin uses applied Modernizr class .no-svg {} to display the fallback.

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $suffixless-url | *blank* | A url without the file extension |

Usage:

```scss
.my-element {
    @include sq-svg-background('path/to/mysprite');
}
```

Output:

```css
.my-element {
    background-image: url("path/to/mysprite.svg");

}
.no-svg .my-element {
    background-image: url("path/to/mysprite.png");
}
```
---

## sq-flex-box

Shortcut to give a containing element prefixed flex display and falls back to table display if flexbox is not supported (detected with Modernizr classes)

See: **%flex-box**

Usage:

```scss
.row {
    @include sq-flex-box;
}
```

---

## sq-flex

Flex elements inside their flex box container (See **sq-flex-box**). Uses table cell formatting if flexbox is not supported by the browser (detected with Modernizr classes)

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $values | *blank* | Values to pass directly to the flex property |

**Note:** Values are not translated into table-cell alternatives if flexbox is not supported, the functionality is different.

Usage:

```scss
.column {
    @include sq-flex(0 1 auto);
}
```

---

## sq-arrow

CSS arrow helper that can generate a triangle with a solid colour.

| Variable | Default | Description |
| -------- |:-------:| ----------- |
| $direction | top | Possible values `top`, `bottom`, `left`, `right` |
| $colour | #000 | CSS colour to use (can use any unit supported by border-color) |
| $size | 5px | Size of the arrow (can use any unit supported by border-width) |
| $height | 0px | Scale the size of the arrow point, the higher the value the 'pointier' the arrow |

Usage:

```scss
.arrow {
    @include sq-arrow(bottom, rgba(0,0,0,.5), 6px, 1px);
}
```

---

## sq-inline-block

Apply inline block styles along with an IE hack to support inline block

See: **%sq-inline-block**

Usage:

```scss
.my-element {
    @include sq-inline-block;
}
```

Output:

```css
.my-element {
    display: inline-block;
    *display: inline;
    zoom: 1;
}
```

---

## sq-list-reset

Strip margins, padding and list styles from an element

See: **%sq-list-reset**

Usage:

```scss
ul {
    @include sq-list-reset;
}
```

Output:

```css
ul {
    margin: 0;
    padding: 0;
    list-style: none;
}
```