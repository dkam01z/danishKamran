<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);
include("config.php");
header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    echo json_encode([
        'status' => ['code' => "300", 'name' => "failure", 'description' => "Database unavailable", 'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"],
        'data' => []
    ]);
    exit;
}

$id = $_POST['id'];

function hasDependencies($conn, $id) {
    $query = $conn->prepare('SELECT COUNT(*) AS count FROM personnel WHERE departmentID = ?');
    if ($query) {
        $query->bind_param('i', $id);
        $query->execute();
        $query->bind_result($count);
        $query->fetch();
        $query->close();
        return $count > 0;
    } else {
        error_log("SQL Error: " . $conn->error);
        return null; 
    }
}

$dependenciesExist = hasDependencies($conn, $id);

if (is_null($dependenciesExist)) {
    $output = ['status' => ['code' => "500", 'name' => "error", 'description' => "SQL Error: " . $conn->error], 'data' => []];
} elseif ($dependenciesExist) {
    $output = ['status' => ['code' => "400", 'name' => "executed", 'description' => "Deletion failed: Dependencies exist"], 'data' => []];
} else {
    $query = $conn->prepare('DELETE FROM department WHERE id = ?');
    if ($query && $query->bind_param('i', $id) && $query->execute()) {
        $output = ['status' => ['code' => "200", 'name' => "ok", 'description' => "Department deleted successfully", 'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"], 'data' => []];
    } else {
        $output = ['status' => ['code' => "500", 'name' => "error", 'description' => "Failed to delete department: " . $conn->error], 'data' => []];
    }
    $query ? $query->close() : null;
}

mysqli_close($conn);
echo json_encode($output);
?>
