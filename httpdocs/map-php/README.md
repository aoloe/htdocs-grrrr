# Rendering the black and white tiles with PHP and GD

The map calls a local `tile.php` script as a proxy for the real tile requested from OSM.

The proxy converts the colors to black and white before creating the png image.
