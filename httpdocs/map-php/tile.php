<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

clearstatcache();

if (!function_exists('debug')) {
    function debug($label, $value) {
        // if ($_SERVER['REMOTE_ADDR'] == '178.195.77.72') {
            echo("<pre>$label: ".str_replace(array('<', '>'), array('&lt;', '&gt;'), print_r($value, 1))."</pre>");
            // echo("<pre>".print_r(debug_backtrace(), 1)."</pre>");
        // }
    }
}

define('TILE_CACHE_DIRECTORY', 'cache/');
define('TILE_CACHE_TIMEOUT', 86400); // the cache works for a day...
// define('TILE_CACHE_TIMEOUT', 480);

function load_tile($imgname, $filename)
{
    /* Attempt to open */

    $string = @file_get_contents($imgname);
    $im = @imagecreatefromstring($string);

    if ($im) {
        return $im;
    }

    $ch = curl_init();
    $timeout = 5;
    curl_setopt($ch, CURLOPT_URL,$imgname);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT,$timeout);
    $data = curl_exec($ch);
    curl_close($ch);
    /*
    $bgc = imagecolorallocate($im, 255, 255, 255);
    $im = @imagecreatefromstring($data);
    $tc  = imagecolorallocate($im, 0, 0, 0);
    imagefilledrectangle($im, 0, 0, 150, 30, $bgc);
    imagestring($im, 1, 5, 5, $imgname, $tc);
     */

    // echo('<pre>im: '.print_r($im, 1).'</pre>');
    // die();


    /* Create an error image */
    $im  = imagecreatetruecolor(150, 30);
    $bgc = imagecolorallocate($im, 255, 255, 255);
    $tc  = imagecolorallocate($im, 0, 0, 0);
    imagefilledrectangle($im, 0, 0, 150, 30, $bgc);
    imagestring($im, 1, 5, 5, 'Error loading ' . $imgname, $tc);

    return $im;
}

function get_cache_filename($z, $x, $y, $gray) {
    return TILE_CACHE_DIRECTORY.md5(sprintf('tile_%d_%d_%d_%d', $z, $x, $y, $gray)).'.png';
}

function cache_image($z, $x, $y, $gray, $image) {
    // chmod($save,0755);
    imagepng($image, get_cache_filename($z, $x, $y, $gray));
}

function load_cached($z, $x, $y, $gray) {
    $result = false;
    $filename = get_cache_filename($z, $x, $y, $gray);

    $filemtime = @filemtime($filename);  // returns FALSE if file does not exist
    if (($filemtime !== false) && (time() - $filemtime <= TILE_CACHE_TIMEOUT)){
        $result = imagecreatefrompng($filename);
    }
    // debug('result', $result);
    return $result;
} // is_cached()

function clear_cache() {
    $directory = opendir(TILE_CACHE_DIRECTORY);
    $time = time();
    while (($filename = readdir($directory)) !== false) {
        $filemtime = @filemtime($filename);  // returns FALSE if file does not exist
        error_log('trying to remove cache file '.$filename);
        if (!$filemtime || ($time - $filemtime >= TILE_CACHE_TIMEOUT)){
            unlink($filename);
        }
    } 
}

function get_grayscale($image, $gray) {
    $result = null;
    $width = imagesx($image);
    $height = imagesy($image);
    $image_gray = imagecreatetruecolor($width, $height);
    imagecolorallocate($image_gray, 0, 0, 0);
    for ($i = 0; $i < $width; $i++) {
      for ($j = 0; $j < $height; $j++) {
        $rgb = imagecolorat($image, $i, $j);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        //for gray mode $r = $g = $b
        $color = floor(($r + $g + $b)/3);
        if ($gray == 0) {
            // $color = ($r + $g + $b)*0.33;
            $color = max(array($r, $g, $b));
            $gray_color = imagecolorexact($image_gray, $color, $color, $color);
        } elseif ($color > $gray) {
            $gray_color = imagecolorexact($image_gray, 255, 255, 255);
        } else {
            $gray_color = imagecolorexact($image_gray, 0, 0, 0);
        }
        // $gray_color = imagecolorexact($image_gray, $color, $color, $color);
        imagesetpixel($image_gray, $i, $j, $gray_color);
       }
    }
    // $tc  = imagecolorallocate($img_gray, 0, 0, 0);
    // $tc  = imagecolorallocate($img_gray, 255, 255, 255);
    // imagestring($img_gray, 1, 5, 5, 'color'.$color, $tc);
    $result = $image_gray;
    return $result;
}

function get_blank_image() {
    $result = null;
    // @todo: return a white image? or black? or both?
    return $result;
}

$s = $_GET['s'];
$z = intval($_GET['z']);
$x = intval($_GET['x']);
$y = intval($_GET['y']);
$gray = array_key_exists('g', $_GET) ? intval($_GET['g']) : 50;

if (($z > 0) && ($x > 0) && ($y > 0)) {
    if (!$image_gray = load_cached($z, $x, $y, $gray)) {
        if ($image = load_tile("http://$s.tile.openstreetmap.org/$z/$x/$y.png", get_cache_filename($z, $x, $y, $gray))) {
            // @todo: only continue if an image has been loaded!
            $image_gray = get_grayscale($image, $gray);
            imagedestroy($image);
            cache_image($z, $x, $y, $gray, $image_gray);
        } else {
            error_log('creating a blank image '.$filename);
            $image_gray = get_blank_image();
        }
    }
} else {
    error_log('creating a blank image '.$filename);
    $image_gray = get_blank_image();

}

if (rand(0,1000) == 0) { // run it about each 1000 times
    clear_cache();
}

// debug('image_gray', $image_gray);

// ob_flush();
// @todo: only output the image if there was no ouptut until now...
if (!headers_sent()) {
    header('Content-Type: image/png');
    // imagepng($image_gray);
    imagepng($image_gray);
    imagedestroy($image_gray);
}
