<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/getAllDepartments.php

	// remove next two lines for production	
	
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




	$query = 'SELECT d.id, d.name as departmentName, l.name as locationName 
          FROM department d 
          LEFT JOIN location l ON (l.id = d.locationID)
          WHERE d.name LIKE ? OR l.name LIKE ?
          ORDER BY d.name, l.name';

	$stmt = $conn->prepare($query);

	if (!$stmt) {
		$output = [
			'status' => [
				'code' => "500",
				'name' => "error",
				'description' => "Statement preparation failed: " . $conn->error
			],
			'data' => []
		];
		mysqli_close($conn);
		echo json_encode($output);
		exit;
	}
	
	$searchTerm = "%" . $_REQUEST['txt'] . "%";
	
	$stmt->bind_param("ss", $searchTerm, $searchTerm);

	$stmt->execute();
	$result = $stmt->get_result();
	
	if (!$result) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
   
  $data = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($data, $row);

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $data;
	
	mysqli_close($conn);

	echo json_encode($output); 

?>