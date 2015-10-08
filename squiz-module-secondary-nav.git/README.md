# Secondary Nav

[Bower]: http://bower.io/
[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> Secondary navigation pattern

## Overview

A common navigation pattern uses nested lists to control the grouping of multiple levels. This module uses 3 levels each with individual classes applied. Class names follow the [BEM](http://bem.info/) convention which may appear verbose at first but has the distinct advantage of being able to style each level of menu without worrying about cascaded styles from parent elements.

## Matrix Menus

This module includes a `parse.html` file which can be used as a starting point for getting this menu into a Matrix system along with it's *--active* and *--current* class modifiers.

```html
<nav class="nav">
    <ul class="nav__list">
        <li class="nav__item nav__item--active">
            <a href="#" class="nav__item-link">Link #1</a>
        </li>
    </ul>
</nav>
```