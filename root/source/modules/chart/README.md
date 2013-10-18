Supplying Custom Configuration
------------------------------

There are 2 ways that the chart configuration options can be supplied, via the jQuery plugin in JS or via the DOM.

See options here: https://developers.google.com/chart/interactive/docs/customizing_charts

```javascript
$('.chart').google_chart({
    chart: {
        is3D: true
    }
});
```

or HTML:

```html
<div class="chart" data-chart-type="Gauge" data-options='{
    "redFrom": 90, "redTo": 100,
    "yellowFrom":75, "yellowTo": 90,
    "minorTicks": 5
}'>

</div>
```

Data Source
-----------

The source for the data is a HTML table in the DOM. It should be well formatted and requires <thead> and <tbody> wrappers around the head and body of the table so that the plugin can determine which cells represent column headings and which cells represet content.

Limitations

* Do not use cell merging, the cells must be the same number as the specified columns
* Only supports a single horizontal heading level to label columns