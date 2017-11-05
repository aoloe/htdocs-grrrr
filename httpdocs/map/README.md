# black and white map for grrrr.ch

## the js-only version

- https://github.com/aoloe/leaflet-blackAndWhite based on the [grayscale filter by ilya zverev](https://github.com/aoloe/leaflet-blackAndWhite)
- gets the marks through ajax/json

### getting the files

- get the js and css files for [leaflet](http://leafletjs.com/):
  - `leaflet.js`
  - `leaflet.css`
  and put them in the `css/` and `js/` directories
- get the the js and css files for [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster):
  - `leaflet.markercluster.js`
  - `MarkerCluster.css`
  and put them in the `css/` and `js/` directories
- get the js file for the [black and white filter](https://github.com/aoloe/leaflet-blackAndWhite):
  - `TileLayer.BlackAndWhite.js`

### the files

- `index.html`
- `css/map.css`
- `js/map.js`
- `orte.json`

### the html file

```html
<html lang=en>
<head>
    <meta charset=utf-8>
    <title>GRRRR</title>
    <link rel="icon" href="../grr/grrrr_fuss.png" type="image/png">
    <link rel="stylesheet" href="//css/leaflet.css" />
    <link rel="stylesheet" href="//map/css/map.css">
    <link rel="stylesheet" href="//map/css/MarkerCluster.css">
    <style>
    </style>
</head>
<body>
    <div id="grrlogos" style="position:absolute; top:0px; left:0px; z-index:1000;"><a href="../index.html"><img id="grrrrnet" src="../grr/grrrrnetn.png" border="0" alt="GRRRRnet"></a><img SRC="../grr/grrrr_flugi.png" border="0"></div>

    <div id="map"></div>
    <div id="bild" style="z-index:1000;" onclick="GrrMap.hide(); return false;"></div>
	<script src="//map/js/leaflet.js"></script>
    <script src="//map/js/TileLayer.BlackAndWhite.js"></script>
	<script src="//map/js/leaflet.markercluster.js"></script>
    <script src="//map/js/map-clustered.js"></script>
    <script>
        GrrMap.init(47.397060, 8.488165, 10); // tüffenwies
        GrrMap.readMarkers('orte.json');
    </script>
</body>
</html>
```

### the json file

```json
[
  [52.336569, 4.876067, "../city/adam/adam_mahlerlaan.png", 0],
  [lon, lat, url, icon],
  [47.621, -122.322, "../seasf/index.html", 5, 51],
  [lon, lat, url, icon, iconShadow],
  [...]
```

- `lon`: the longitude of the point
- `lat`: the latitude of the point
- `url`: the url to the image or to to an html page
- `icon`: 0 for the arrow; a positive number for the "grr##" labels
- `iconShadow`: is it in use?

notes:

- the last item is not allowed to have a comma at the end.
- the json file can be validated with <https://jsonlint.com/>

### questions

- which minimal zoom and distance for the aggregation?

## todo:

- how to go all around the world twice and still see the markers
  - leaflet markers longitude wrapping
  - https://github.com/Leaflet/Leaflet.draw/issues/776
  - https://github.com/Leaflet/Leaflet/issues/1360
  - a solution could be to use geojson coordinates...

## the php version


