<?php



$executionStartTime = microtime(true);

$url = 'http://api.geonames.org/wikipediaBoundingBoxJSON?north=' .  $_REQUEST['north'] . '&south='. $_REQUEST['south'] . '&east='.   $_REQUEST['east'] . '&west='.   $_REQUEST['west'] .'&maxRows=10&username=dkamran';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_URL, $url);


$result = curl_exec($ch); 

curl_close($ch); 

$decodedResult = json_decode($result, true);

$data = $decodedResult['geonames'];

echo json_encode($data);



?>