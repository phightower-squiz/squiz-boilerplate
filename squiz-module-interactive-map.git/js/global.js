/*globals L*/
(function($, L){
    if (!$('#map').length) {
        return;
    }

    var map = new L.Map('map', {center: new L.LatLng(51.51, -0.11), zoom: 9});
    var googleLayer = new L.Google('ROADMAP');
    map.addLayer(googleLayer);
}(jQuery, L));
