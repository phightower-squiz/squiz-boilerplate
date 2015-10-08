# Skip Links

[Bower]: http://bower.io/
[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> Skip links allow users to skip to large blocks of commonly accessed content on a HTML page (e.g. navigation and content), particularly for users restricted to keyboard navigation.

## Overview

This module follows the best practice techniques outlaid in the associated [Squiz Central Article](https://central.squiz.net/imp/best-practice/accessibility/skip-links) to construct keyboard navigation links to landmark areas of the page.

**Note:** these skip links are for devices & browsers that don't support the aria landmark roles. You will need to (and should be) using these roles and HTML 5 elements to identify those areas of the page.

```html
<div id="top" class="skip-links" aria-hidden="true">
    <ul class="skip-links__list">
        <li class="skip-links__item"><a class="skip-links__link" href="#main">Skip to content</a></li>
        <li class="skip-links__item"><a class="skip-links__link" href="#main-navigation">Skip to navigation</a></li>
    </ul>
</div><!-- /.skip-links -->
```

## Usage

This module should be inserted as the first element that will gain keyboard focus on the page (at the top).

**Example import directive**
```html
<!-- import:content module:skip-links/html/index.html -->
```