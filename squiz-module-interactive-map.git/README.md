# Interactive Map

[Leaflet]: http://leafletjs.com/
[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> Interactive Map using [Leaflet][] to abstract map interactions allowing for multiple layers and mobile friendly interactions

## Overview

The example in this module is setup using some [Leaflet Plugins](http://leafletjs.com/plugins.html) to bring basic Google map functionality.

## Usage

Maps are generally not deployed on every page of a website. With this in mind this module uses `import/_head.html` and `import/_foot.html` to instruct the boilerplate to create specific CSS and JS files that can be included on a *page specific* basis in a site.

Head example
```html
<!-- build:css dist:styles/leaflet.css -->
    <!-- import:css bower:leaflet/dist/leaflet.css -->
<!-- endbuild -->
```

Foot example
```html
<script src="http://maps.google.com/maps/api/js?v=3.2&amp;sensor=false"></script>
<!-- build:js dist:js/leaflet.min.js -->
    <!-- import:js bower:leaflet/dist/leaflet.js -->
    <!--@@ Google maps plugin @@-->
    <!-- import:js bower:leaflet-plugins/layer/tile/Google.js -->
<!-- endbuild -->
```

**Note:** You'll need slightly different code if you want to run an alternate map tile layer (e.g. Bing Maps, OpenStreetMap etc). This example just uses Google maps because it's a common choice.