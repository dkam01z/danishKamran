<?php

$geoJsonData = json_decode(file_get_contents('../data/countryBorders.geo.json'), true);

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

header('Content-Type: application/json');
echo json_encode($countries);
?>
