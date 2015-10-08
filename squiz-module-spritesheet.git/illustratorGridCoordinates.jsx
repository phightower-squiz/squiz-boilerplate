/**
 * Generates a named layer with Grid coordinate labels in Adobe Illustrator CC
 */

// The size of the grid to generate
var gridSize = 50;
var gridCols = 8;
var gridRows = 20;
var coordLayerName = "Grid Coordinates";

function addText(ref, content, x, y) {
    var pointTextRef = ref.textFrames.add();
    pointTextRef.contents = content;
    pointTextRef.top = y;
    pointTextRef.left = x;
    pointTextRef.selected = false;
    return pointTextRef;
}

if(documents.length > 0) {
    var sourceDoc = activeDocument;

    var coordLayer = sourceDoc.layers.add();
    coordLayer.name = coordLayerName;

    var xCount = 0;
    var yCount = 0;
    var xMax   = gridCols;
    var yMax   = gridRows;
    var xPos   = 0;
    var yPos   = 0;
    var text;

    // Character styles
    var charStyle = sourceDoc.characterStyles.getByName("Grid");
    if (!charStyle) {
        charStyle = sourceDoc.characterStyles.add("Grid");
    }
    var charAttr = charStyle.characterAttributes
    charAttr.size = 8;

    while (yCount < yMax) {
        xCount = 0;
        while (xCount < xMax) {
            xPos = xCount*gridSize;
            yPos = yCount*gridSize;

            // Create a text frame with the coordinates
            text = addText(coordLayer, yCount + ", " + xCount, xPos, -yPos);
            text.opacity = 50;

            // Apply the character style
            charStyle.applyTo(text.textRange);

            redraw();
            xCount += 1;
        }
        yCount += 1;
    }

} else {
    alert("Create a document with at least 1 page item before running this script.");
}