<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

session_start();

function change_username($conn, $newUsername)
{
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    $newUsername = $data['newUsername'];
    $userId = $_SESSION['userid'];  // Assuming you have the user's ID in the session

    // Perform a SQL UPDATE query to update the username in the database
    $stmt = $conn->prepare("UPDATE users SET username = ? WHERE id = ?");
    $stmt->bind_param("si", $newUsername, $userId);

    if ($stmt->execute()) {
      // Successfully updated the username
      http_response_code(200);
      $response['message'] = "Username updated successfully";
      echo json_encode($response);
    } else {
      // Error updating the username
      http_response_code(500);
      $response['error'] = "Error updating username: " . $stmt->error;
      echo json_encode($response);
    }

    $stmt->close();
  }
}

// Assuming you have a function to establish the database connection in config.php
$conn = getDBConnection();

change_username($conn, $_POST['newUsername']);

$conn->close();

?>