<?php

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url = 'https://restcountries.com/v2/alpha/' . urlencode($_REQUEST['countryCode']);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);

if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
    $output['status']['code'] = "Failure";
    $output['status']['name'] = "cURL Error";
    $output['status']['description'] = $error_msg;
    $output['data'] = null;
    $output['status']['response'] = $executionTime;
    echo json_encode($output);
    curl_close($ch);
    exit;
}

curl_close($ch);

$decodedResult = json_decode($result, true);

if (!$decodedResult) {
    $output['status']['code'] = "Failure";
    $output['status']['name'] = "JSON Decoding Error";
    $output['status']['description'] = "Failed to decode JSON";
    $output['data'] = null;
    $output['status']['response'] = $executionTime;
    echo json_encode($output);
    exit;
}

$executionEndTime = microtime(true);
$executionTime = ($executionEndTime - $executionStartTime);

$output['status']['code'] = "Success";
$output['status']['name'] = "API Call Successful";
$output['status']['description'] = "Data retrieved successfully";
$output['data'] = $decodedResult;
$output['status']['response'] = $executionTime . ' seconds';

echo json_encode($output); 

?>
