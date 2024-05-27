<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);
include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output = [
        'status' => [
            'code' => "300",
            'name' => "failure",
            'description' => "database unavailable",
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

$id = $_POST['id'];
$entity = $_POST['entity'];

function hasDependencies($conn, $id, $entity, &$count) {
    if ($entity === 'Department') {
        $stmt = $conn->prepare('SELECT COUNT(personnel.id) AS count FROM personnel WHERE departmentID = ?');
    } else if ($entity === 'Location') {
        $stmt = $conn->prepare('SELECT COUNT(department.id) AS count FROM department WHERE locationID = ?');
    } else {
        return false;
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    return $count > 0;
}

$count = 0;
if (hasDependencies($conn, $id, $entity, $count)) {
    $stmt = $conn->prepare('SELECT name FROM ' . strtolower($entity) . ' WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->bind_result($name);
    $stmt->fetch();
    $stmt->close();

    $output = [
        'status' => [
            'code' => "400",
            'name' => "executed",
            'description' => "Cannot delete, dependencies exist"
        ],
        'data' => [
            'name' => $name,
            'count' => $count
        ]
    ];
} else {
    $output = [
        'status' => [
            'code' => "200",
            'name' => "ok",
            'description' => "No dependencies found"
        ],
        'data' => [
            'count' => $count
        ]
    ];
}

mysqli_close($conn);
echo json_encode($output);
?>
