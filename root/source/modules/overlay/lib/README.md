# Simple Overlay Helper

```
var $overlay = $('#overlay');
$overlay.overlay();

// Programmatically trigger show/hide
var overlay = $.data($overlay.get(0), 'overlay');
overlay.show(); // Display the overlay
overlay.hide(); // Hide the overlay
```

By default the overlay helper detaches and attaches the overlay element to the
body of the page. This behaviour can be overridden.

## Arguments

### Parent element

The default parent can be changed. If not specified it will be the document body
```
$overlay.overlay({
    parent: $('#some-other-element')
});
```

### Toggle element

A toggle element can be specified and a click event will be bound that toggles
the show/hide function of the overlay
```
$overlay.overlay({
    toggle: $('a.toggle')
});
```

### Callbacks

2 callbacks are provided to bind custom functions when the overlay is shown/hidden
```
$overlay.overlay({
    onShow: function() {
        alert('shown');
    },
    onHide: function() {
        alert('hidden');
    }
});
```

### Vertical alignment

Some control can be provided over the vertical alignment behaviour of any child
.overlay-modal elements (default to true)
```
$overlay.overlay({
    verticalModalAlign: false
});
```

### Resize delay

Provides control over the resize event bound to the vertical alignment. Enter a
value in milliseconds. Requires vertical alignment to be enabled
```
$overlay.overlay({
    resizeDelay: 100
});
```

### Class names

These shouldn't need to be changed, but can be if necessary
```
$overlay.overlay({
    hiddenClass: 'overlay-hidden',
    modalClass: 'overlay-modal',
    closeClass: 'overlay-modal-close',
});
```

### Custom show/hide functions

The show and hide functions can be overridden. Be careful with this, the default
functions do some class application and modal handling
```
$overlay.overlay({
    show: function() {
        this.$elem.fadeIn();
    },//end show()

    // Default hide function.
    hide: function() {
        this.$elem.fadeOut();
    }//end hide()
});
```