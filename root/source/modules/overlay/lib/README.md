# Simple Overlay Helper

```
var overlay = new $.module_overlay();
overlay.show(); // Display the overlay
overlay.hide(); // Hide the overlay
```

By default the overlay helper detaches and attaches the overlay element to the
body of the page. This behaviour can be overridden.

## Examples

### Changing the overlay element.
```
overlay.settings.elem = $('<div class="overlay">Something custom</div>');
```

### Setting content for the element
```
overlay.settings.elem.html('My custom content');
```

### Changing the show and hide behavior
```
// Change the hide/show behavior to a fade In/Out
var overlay = new $.module_overlay({
    show: function($elem, $parent) {
        $elem.stop().fadeIn();
    },
    hide: function($elem, $parent) {
        $elem.stop().fadeOut();
    }
});

// Or
overlay.settings.show = function($elem, $parent) {
    $elem.stop().fadeIn();
};
overlay.settings.hide = function($elem, $parent) {
    $elem.stop().fadeOut();
};
```

### Changing the parent
```
var overlay = new $.module_overlay({
    parent: $('#some-other-parent')
});
```