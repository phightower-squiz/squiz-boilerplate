# Breadcrumbs

[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> An accessible breadcrumb pattern for [Squiz Boilerplate][]

```html
<nav class="breadcrumbs">
    <p id="breadcrumb__label" class="visuallyhidden">You are here:</p>
    <ol class="breadcrumbs__list" aria-labelledby="breadcrumb__label">
        <li class="breadcrumbs__item">
            <a href="/" class="breadcrumbs__link">Home</a>
            <span class="breadcrumbs__divider" aria-hidden="true">&gt;</span>
        </li>
        <li class="breadcrumbs__item breadcrumbs__current">Current Page</li>
    </ol>
</nav>
```

Check out the `matrix/parse.html` file for a Matrix design area example you can use to output this format.