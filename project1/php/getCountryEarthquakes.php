<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$executionStartTime = microtime(true);

$url = 'https://secure.geonames.org/earthquakesJSON?' .
       'north=' . urlencode($_REQUEST['north']) .
       '&south=' . urlencode($_REQUEST['south']) .
       '&east=' . urlencode($_REQUEST['east']) .
       '&west=' . urlencode($_REQUEST['west']) .
       '&username=dkamran';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo json_encode([
        'status' => 'error',
        'message' => curl_error($ch),
        'code' => curl_errno($ch)
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$decoded = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to parse JSON',
        'code' => json_last_error()
    ]);
    exit;
}

echo json_encode([
    'status' => 'success',
    'data' => $decoded,
    'executionTime' => microtime(true) - $executionStartTime
]);

?>
