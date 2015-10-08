# Pagination

[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> Pagination compatible with Matrix

## Overview

This pagination module has some basic starter styles for output that is achievable with Matrix asset listings. You'll need to customise the asset listing pagination formatting in order to match the markup used by this module.

## Matrix

### Page Contents

Use the following code in the *Page Contents* bodycopy of the asset listing (You may want to create a raw HTML div to hold this markup to make it more manageable and less prone to accidental overwrites in the wysiwyg)
```html
<ul class="pagination">
    <li class="pagination__item">%previous_page%</li>
    %page_list%
    <li class="pagination__item">%next_page%</li>
</ul>
```

### Page Link Format

Use the following code in the *Page Link Format* on the details screen of the asset listing
```html
<li class="pagination__item"><a class="pagination__link" href="%page_link%">%page_number%</a></li> 
```

### Current Page Format

Use the following code in the *Current Page Format* on the details screen of the asset listing
```html
<li class="pagination__item pagination__item--current">%page_number%</li>
```