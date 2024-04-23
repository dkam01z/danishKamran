<?php

header('Content-Type: application/json');

$executionStartTime = microtime(true);

$ch = curl_init();

$url = 'https://restcountries.com/v2/alpha/' . urlencode($_REQUEST['countryCode']);

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$result = curl_exec($ch);

if (!$result) {
    $error_msg = curl_error($ch);
    curl_close($ch);
    echo json_encode(['error' => 'CURL error: ' . $error_msg]);
    exit;
}

curl_close($ch);

$decodedResult = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Failed to decode JSON']);
    exit;
}

echo $result; 

$executionEndTime = microtime(true);
$executionTime = ($executionEndTime - $executionStartTime) . ' seconds';
?>
