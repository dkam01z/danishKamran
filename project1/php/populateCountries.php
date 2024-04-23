<?php

header('Content-Type: application/json');

$filePath = '../data/countryBorders.geo.json';
if (!file_exists($filePath)) {
    echo json_encode(['error' => 'File not found']);
    exit;
}

$jsonData = file_get_contents($filePath);
if ($jsonData === false) {
    echo json_encode(['error' => 'Failed to read file']);
    exit;
}

$geoJsonData = json_decode($jsonData, true);
if ($geoJsonData === null) {
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

$countries = [];
foreach ($geoJsonData['features'] as $feature) {
    $countries[] = [
        'name' => $feature['properties']['name'],
        'iso_a2' => $feature['properties']['iso_a2']
    ];
}

usort($countries, function($a, $b) {
    return strcmp($a['name'], $b['name']);
});

echo json_encode($countries);
?>
