<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


include("config.php");

header('Content-Type: application/json; charset=UTF-8');


$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}


$locationID = $_POST['locationID'];
$departmentID = $_POST['departmentID'];


$queryStr = '
    SELECT 
        p.id, 
        p.lastName, 
        p.firstName, 
        p.jobTitle, 
        p.email, 
        d.id as departmentID, 
        d.name as departmentName,
        l.id as locationID, 
        l.name as locationName
    FROM 
        personnel p
    LEFT JOIN 
        department d ON d.id = p.departmentID
    LEFT JOIN 
        location l ON l.id = d.locationID
';


$whereClauses = [];
$params = [];
$types = '';

if ($locationID) {
    $whereClauses[] = 'd.locationID = ?';
    $params[] = $locationID;
    $types .= 'i';
}

if ($departmentID) {
    $whereClauses[] = 'p.departmentID = ?';
    $params[] = $departmentID;
    $types .= 'i';
}

if (!empty($whereClauses)) {
    $queryStr .= ' WHERE ' . implode(' AND ', $whereClauses);
}


$query = $conn->prepare($queryStr);
if ($query === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query preparation failed: " . $conn->error;
    $output['data'] = [];
    echo json_encode($output);
    mysqli_close($conn);
    exit;
}


if (!empty($params)) {
    $query->bind_param($types, ...$params);
}

$query->execute();


if ($query->errno) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed: " . $query->error;	
    $output['data'] = [];
    echo json_encode($output); 
    mysqli_close($conn);
    exit;
}


$result = $query->get_result();
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}


if (empty($data)) {
    $output['status']['code'] = "204";
    $output['status']['name'] = "no content";
    $output['status']['description'] = "No matching records found";
    $output['data'] = [];
} else {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $data;
}


echo json_encode($output);


$query->close();
mysqli_close($conn);

?>
