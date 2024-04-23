<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *'); 

$executionStartTime = microtime(true);

$ch = curl_init();
$url = 'https://newsapi.org/v2/top-headlines?country=' . $_REQUEST['country'] . '&apiKey=' . $_REQUEST['apiKey'];

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
curl_setopt($ch, CURLOPT_USERAGENT, 'script.js/1.0');

$result = curl_exec($ch);

if (curl_errno($ch)) {
    $output['status']['code'] = "Failure";
    $output['status']['name'] = "cURL Error";
    $output['status']['description'] = curl_error($ch);
    $output['data'] = null;
    echo json_encode($output);
    exit;
}

curl_close($ch);

$decodedResult = json_decode($result, true);

if (isset($decodedResult['status']) && $decodedResult['status'] !== 'ok') {
    $output['status']['code'] = "Failure";
    $output['status']['name'] = "API Error";
    $output['status']['description'] = $decodedResult['message'];
    $output['data'] = null;
    echo json_encode($output);
    exit;
}

$output['status']['code'] = "Success";
$output['status']['name'] = "API Call Successful";
$output['status']['description'] = "Data retrieved successfully";
$output['data'] = $decodedResult;
$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime) * 1000, 3, '.', '');

echo json_encode($output);

?>
