<?php

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$isoCode = $_GET['isoCode'];
$file = '../data/countryBorders.geo.json';

if (!file_exists($file)) {
    echo json_encode(['status' => ['code' => 'Failure', 'description' => 'GeoJSON file not found']]);
    exit;
}

$geoJsonData = json_decode(file_get_contents($file), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['status' => ['code' => 'Failure', 'description' => 'Failed to parse GeoJSON file']]);
    exit;
}

$selectedFeature = null;
foreach ($geoJsonData['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === strtoupper($isoCode)) {
        $selectedFeature = $feature;
        break;
    }
}

if ($selectedFeature) {
    echo json_encode(['status' => ['code' => 'Success', 'description' => 'Country found'], 'data' => $selectedFeature]);
} else {
    echo json_encode(['status' => ['code' => 'Failure', 'description' => 'Country not found']]);
}
?>
