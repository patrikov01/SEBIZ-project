<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

session_start();

function validate_user_credentials($username, $password) {
  $result = array();

  if (empty($username) || empty($password)) {
    http_response_code(400);
    $result['error'] = 'Всички полета трябва да се попълнят';
  }

  $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  if ($conn->connect_error) {
    http_response_code(500);
    $result['error'] = "Грешка при връзка с базата: " . $conn->connect_error;
  }

  $sql = "SELECT id, username, password_hash FROM users WHERE username = ?";

  if ($stmt = $conn->prepare($sql)) {
    $stmt->bind_param("s", $username);

    if ($stmt->execute()) {
      $stmt->store_result();

      if ($stmt->num_rows == 1) {
        $stmt->bind_result($id, $username, $hashed_password);

        if ($stmt->fetch()) {
          if (password_verify($password, $hashed_password)) {
            http_response_code(200);
            $result['userid'] = $id;
            $result['username'] = $username;
            return $result;
          } else {
            http_response_code(404);
            $result['error'] = "Паролата не е вярна!";
          }
        }
      } else {
        http_response_code(404);
        $result['error'] = "Потребител с такова име не съществува!";
      }
    } else {
      http_response_code(500);
      $result['error'] = "Нещо се обърка...";
    }

    $stmt->close();
    return $result;
  }

  $conn->close();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $rawData = file_get_contents("php://input");

  $data = json_decode($rawData, true);
  $username = $data['username'];
  $password = $data['password'];

  $response = array();
  $result = validate_user_credentials($username, $password);

  if (isset($result['error'])) {
    echo json_encode($result);
    return;
  }

  if (isset($result['userid']) && isset($result['username'])) {
    $_SESSION["username"] = $result['username'];
    $_SESSION["userid"] = $result['userid'];
  }

  http_response_code(200);
  echo json_encode($result);
}