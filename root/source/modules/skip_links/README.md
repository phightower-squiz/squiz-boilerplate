# Skip Links

## ARIA

When aria is implemented by the browser then aria-hidden=true is used to hide the
skip links from the browser. This should only be used when aria landmark roles have
been properly implemented.
More reading in this comment: http://groups.drupal.org/node/142334#comment-473709

## CSS

List style is reset to remove any visible markup from the list. The skip links use
a show/hide when the links are focussed to restore the link to view in (default)
top left of the screen.

## Related BP articles

https://central.squiz.net/imp/best-practice/accessibility/skip-links
https://central.squiz.net/imp/best-practice/accessibility/screen-hidden-content