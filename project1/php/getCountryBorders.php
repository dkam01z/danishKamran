<?php
$isoCode = $_GET['isoCode']; 
$geoJsonData = json_decode(file_get_contents('../data/countryBorders.geo.json'), true);

$selectedFeature = null;
foreach ($geoJsonData['features'] as $feature) {
    if ($feature['properties']['iso_a2'] == $isoCode) {
        $selectedFeature = $feature;
        break;
    }
}

if ($selectedFeature) {
    echo json_encode($selectedFeature);
} else {
    echo json_encode(['error' => 'Country not found']);
}
?>
