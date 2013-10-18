Intro
-----

This lightweight plugin provides a wrapper around the google charts visualization library. It script loads the chart when the plugin is required so there is no need to include the google JS API in the source of your page. Works well with charts that might occur in any place within a site, especially for something like Matrix where design customisations may have to be used.

Use this module to progressively enhance a data table into a google chart.

Supplying Custom Configuration
------------------------------

There are 2 ways that the chart configuration options can be supplied, via the jQuery plugin in JS or via the DOM.

See all the parameters you can pass here: https://developers.google.com/chart/interactive/docs/customizing_charts

### Javascript

```javascript
$('.chart').google_chart({
    chart: {
        is3D: true
    }
});
```

### HTML

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

### Limitations

* Do not use cell merging, the cells must be the same number as the specified columns
* Only supports a single horizontal heading level to label columns

### Example

```html
<div class="chart" data-chart-type="PieChart" data-options='{
    "is3D": true
}' data-title="The number of file assets in the Matrix system grouped by type">
    <table class="chart-data">
        <thead>
            <tr>
                <th data-type="string">Asset Type</th>
                <th data-type="number">Count</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>PDF</td>
                <td>45</td>
            </tr>
            <tr>
                <td>Word</td>
                <td>20</td>
            </tr>
            <tr>
                <td>Excel</td>
                <td>120</td>
            </tr>
            <tr>
                <td>Image</td>
                <td>230</td>
            </tr>
            <tr>
                <td>Text</td>
                <td>4</td>
            </tr>
        </tbody>
    </table>
</div><!-- /.chart -->
```

HTML Data attributes
--------------------

HTML data attributes are sourced to allow the plugin to understand the requirements of the display of the chart. Here are a few of the data attributes available.

### Chart container element

The main chart container element supports the following data attributes:

`data-chart-type`

The chart type references the name of the chart function in the Google visualisation API. This includes 'PieChart', 'BarChart', 'ColumnChart', 'Timeline', 'LineChart' and 'Guage'. It corresponds directly to the function name in the API.

`data-options`

Supports valid JSON definition of the Google chart options supplied when rendering a chart. Allows the chart to be configured without having to edit the JS that invokes it, although it is not required.

`data-title`

An optional title to pass through to any generated HTML by the default chart outputter function.

### TH

The table header supports the following data attributes:

`data-type`

The type of data contained in the column. This corresponds to the supported google dataTable data types and includes things like 'number', 'string', and 'date'.

### TD

The data cell supports the following attributes:

`data-value`

Allows a value to be supplied for the data cell. If the attribute is not set it will default to the $.text() value of the cell.

CSS Classes
-----------

The following classes are available to help control the display and rendering of the chart:

### Chart container element (default: `chart`)

`chart-loaded` - Applied once the chart has successfully been loaded into the DOM

### The output element (default: `chart-output`)

`chart-error`  - If an error has been detected this will be applied to the output class to assist with styling.

### TH, TD, TR

`chart-ignore` - Rows and Cells in the data table can be skipped during the data load phase by applying this class.

```html
...
    <tr class="chart-ignore">
        <td>PDF</td>
        <td>45</td>
    </tr>
...
```

Note: It is required that the number of heading cells (columns) match the number of cells in each row. Google charts will throw an error if this isn't the case.

Plugin Options
--------------

When instantiating the chart plugin a number of options can be supplied to control the way the plugin behaves.

`chart` - JSON

The `chart` option takes a JSON formatted list of options to supply to the Google chart visualisation object. These will be merged with any options added to the `data-option` attribute of the container element, but any options here will take precedence.

`loaded` - Function

This option is a callback function that can be supplied to run any custom javascript once the chart load has been completed.

```javascript
$('.chart').google_chart({
    chart: {
        is3D: true
    }
})
```

`outputter` - Function

This function determines what HTML will be generated as a part of the plugin. By default it will output a `<figure>` element. Any element returned by this function will be used as the output destination for the Google Chart (the API will put the resulting SVG here).

There should be no need to change this unless there is a requirement to change the resulting HTML output to something other than a `<figure>` element.

`classes` - JSON

This allows any of the default classes applied to be overridden with custom classes. Any related CSS should be changed to suit.