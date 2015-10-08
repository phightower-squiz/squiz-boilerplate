# Back to top

[Bower]: http://bower.io/
[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> Back to top link pattern for [Squiz Boilerplate][]

## Overview

An often used pattern is an anchor link to return the user to the top of the page. This module uses some simple HTML that can be used to achieve this along with some CSS to fix the link at the bottom of the page using `position: fixed;` for wider screens (in `medium.scss`).

**Note:** Make sure you either add the `id="top"` has been used on the page. This comes already set in the skip links module which is the ideal element to apply the id.

```html
<a href="#top" class="back-to-top">
    <span class="back-to-top__text">Back to the </span><span class="back-to-top__fallback">top</span><span class="visuallyhidden"> of this page</span>
</a>
```