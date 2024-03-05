<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


$url = 'http://api.geonames.org/findNearbyPostalCodesJSON?formatted=true';
$url .= '&postalcode=' . urlencode($_REQUEST['postalcode']);
$url .= '&country=' . urlencode($_REQUEST['country']);
$url .= '&radius=' . urlencode($_REQUEST['radius']);
$url .= '&maxRows=' . urlencode($_REQUEST['maxRows']);
$url .= '&username=dkamran'; 
$url .= '&style=full';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);


$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode['postalCodes'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>
