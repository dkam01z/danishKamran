<?php

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$apiKey = urlencode($_REQUEST['apiKey']);
$currencyCode = urlencode($_REQUEST['currencyCode']);
$url = "https://v6.exchangerate-api.com/v6/{$apiKey}/latest/{$currencyCode}";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);

if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
    curl_close($ch);

    $output = [
        'status' => [
            'code' => "Failure",
            'name' => "cURL Error",
            'description' => $error_msg,
            'response' => ''
        ],
        'data' => null
    ];

    echo json_encode($output);
    exit;
}

curl_close($ch);

$decodedResult = json_decode($result, true);

if (isset($decodedResult['error'])) {
    $output = [
        'status' => [
            'code' => "Failure",
            'name' => "API Error",
            'description' => $decodedResult['error'],
            'response' => ''
        ],
        'data' => null
    ];

    echo json_encode($output);
    exit;
}

$executionEndTime = microtime(true);
$executionTime = number_format($executionEndTime - $executionStartTime, 3, '.', '');

$countryCodes = array_keys($decodedResult['conversion_rates'] ?? []);

$output = [
    'status' => [
        'code' => "Success",
        'name' => "API Call Successful",
        'description' => "Data retrieved successfully",
        'response' => $executionTime . ' seconds'
    ],
    'countryCodes' => $countryCodes,
    'data' => $decodedResult
];

echo json_encode($output);

?>
