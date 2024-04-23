<?php

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$ch = curl_init();
$url = 'http://api.geonames.org/searchJSON?country=' . urlencode($_REQUEST['countryCode']) . '&cities=cities15000&username=dkamran&maxRows=10';

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);

if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
    curl_close($ch);

    $output = [
        'status' => [
            'code' => "Failure",
            'name' => "cURL Error",
            'description' => $error_msg
        ],
        'data' => null
    ];

    echo json_encode($output);
    exit;
}

curl_close($ch);

$decodedResult = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    $output = [
        'status' => [
            'code' => "Failure",
            'name' => "JSON Parse Error",
            'description' => 'Failed to parse JSON: ' . json_last_error_msg()
        ],
        'data' => null
    ];

    echo json_encode($output);
    exit;
}

$executionEndTime = microtime(true);
$executionTime = number_format($executionEndTime - $executionStartTime, 3, '.', '');

$output = [
    'status' => [
        'code' => "Success",
        'name' => "API Call Successful",
        'description' => "Data retrieved successfully",
        'response' => $executionTime . ' seconds'
    ],
    'data' => $decodedResult
];

echo json_encode($output);

?>
