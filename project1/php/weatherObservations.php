<?php

$executionStartTime = microtime(true) / 1000;

$ch = curl_init();


$url = 'http://api.geonames.org/weatherJSON?&north=' . $_REQUEST['north'] . '&south=' . $_REQUEST['south'] . '&east=' . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . '&username=dkamran&maxRows=10';



curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 


$resp = curl_exec($ch); 


if ($e = curl_error($ch)) {
    echo $e;
} else {
    $decoded = json_decode($resp, true);
}

curl_close($ch);  




echo json_encode($decoded);

?>