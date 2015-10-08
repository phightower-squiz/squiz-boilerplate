# Parallax

[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> Parallax jQuery plugin that animates elements inside a relatively positioned container

## Overview

This parallax module allows background elements to be positioned inside other elements and animated relative to the user's scroll position. The nature of this behavior means that it generally doesn't work well cross browser, particular on older browsers such as IE <= 8 or PCs/Devices with low CPU/GPU. This is a custom written jQuery plugin to solve the parallax behavior on the Squiz website which was previously limited to animating background image positions.

This solution uses CSS transforms as it's go-to method meaning it is mostly suited towards later browsers, but it does fall back to animating top/left elements if no transforms are available. In addition to a preference to CSS transforms this plugin also **only** animates when the containing element is in the viewport which should help when many parallax elements are on a page.

**A note on performance**
Smooth mousewheel scrolling plugins have been used to improve the appearance of the scrolling effect on some browsers (IE), but these can tend to have negative flow on effects because they hijack the mousewheel scroll event. Use very carefully and if possible avoid using either this, or parallax in the first place.

**Another note on IE performance**
During testing 'Janking' has been found to be a common issue with parallax behavior on IE. Save yourself a headache and either:
* Used position: fixed backgrounds that mimick parallax behavior (requires vastly different code and solutions to the ones used here)'
* Disable parallax on IE all together (even IE 11)

Smooth scroll can help a bit with janking in IE on the mousewheel (may not remove it completely), but manual scrolling may still be an issue.

**A note on other libraries**
Extensive research was done on scrolling libraries at the time this was built and generally they are too heavyweight and rely on position fixed elements which makes the animation relative to the browser viewport. There are some parallax 'tricks' which use either CSS or swapping position fixed backgrounds which don't actually animate... These methods are better for performance but are very limiting.

## Requirements

This plugin expects [Modernizr](http://modernizr.com/) with *.prefixed()*, *csstransforms3d* and *csstransforms* enabled to be able to test which method it should use and apply for parallax animations. This is the default in the boilerplate, but if you've customised it then you should definitely pay attention to this.

## Options

**layerClassName** 
default: `parallax__layer`

The CSS class name of the layer element

**smoothScroll**
default: `false`

Whether to hijack the user's mousewheel scroll and implement an animated smooth scroll. This can have
unintented consequences, use with care. If you are using other smooth scrolling libraries leave this disabled.

**debounceScroll**
default: `0`

Debounce the scroll event (in milliseconds). E.g. a value of `50` will prevent the scroll event from triggering multiple times with a 50ms timeframe allowing only the last time to trigger. Use with care, higher values can result in 'janking' and it may take some time to find the sweetspot... if any.

**cacheOffset**
default: `false`

Whether to cache the offset values of the layer's parent elements. This means on first call to the parallax plugin (when it updates) it will cache the `offsetTop` calculation. This can reduce expensive browser paints with the offsetTop param but means that it will not re-calculate if the height of any element changes dynamically on the page.

**speed**
default: `.5`

The default speed of parallax layers when no `data-speed` attribute has been supplied

## Methods

### Init

To invoke the Parallaxer:

```javascript
var parallax = $('.parallax').SquizParallax({
    // Optional class name to target
    layerClassName: 'parallax__layer',
    // Optional default speed factor (can be overridden per layer with data attributes)
    speed: 0.5
});
```

### Destroy

To destroy the Parallaxer and unbind events:

```javascript
// If you assigned the parallaxer to a variable
parallax.destroy();

// if you didn't but you still want to kill it
$('.parallax').data('plugin_SquizParallax').destroy();
```

## Customisation

You can control the behavior of parallaxed layer elements (class: *.parallax__layer*) by using some `data-` attributes:

* **data-speed** Numerical value that adjusts the speed of the animation. 0 will position exactly as you scroll. Usually you will want a value between .2 and 1. A negative value will reverse the animation based on the scroll direction.
* **data-offset-top** The value in pixels to offset the element from the top of the scrolled position. Negative values are allowed, please only use whole numbers without units applied. Pixel values are assumed.
* **data-offset-side** Similar to top but indented from the left side. Negative values are also allowed.

## Example Parallaxed element

```html
<section class="parallax">
    <div class="parallax__layer parallax__layer-background parallax__layer--center" data-speed="0.5">
        <img src="http://placehold.it/768x420&amp;text=Background" alt="" width="768" />
    </div>
    <div class="parallax__layer parallax__layer-left parallax__layer-foreground" data-speed=".8" data-offset-top="230" data-offset-side="50">
        <img src="http://placehold.it/100x50/E8117F/ffffff&amp;text=Foreground" alt="" width="100" />
    </div>
    <div>
        <h3>Some overlay content</h3>

        <p>Your content remains static here while .parallax__layers are animated in the background</p>
    </div>
</section>
```