<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

session_start();

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
  echo "Connection failed: " . $conn->connect_error;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $rawData = file_get_contents("php://input");

  $data = json_decode($rawData, true);

  $username = $data['username'];
  $name = $data['name'];
  $email = $data['email'];
  $password = $data['password'];
  $confirmPassword = $data['confirmPassword'];
  $cardNumber = $data['cardNumber']; 
  $expiryDate = $data['expiryDate']; 
  $cvv = $data['cvv']; 

  $response = array();

  if (empty($username) || empty($name) || empty($email) || empty($password) || empty($confirmPassword) || empty($cardNumber) || empty($expiryDate) || empty($cvv)) {
    http_response_code(400);
    $response['error'] = 'Всички полета са задължителни!';
    echo json_encode($response);
    return;
  }

  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    $response['error'] = 'Невалиден формат на имейл адреса!';
    echo json_encode($response);
    return;
  }

  if ($password !== $confirmPassword) {
    http_response_code(400);
    $response['error'] = 'Паролите не съвпадат!';
    echo json_encode($response);
    return;
  }

  if (strlen($password) < 8 || !preg_match('/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/', $password)) {
    http_response_code(400);
    $response['error'] = 'Паролата трябва да е минимум 8 символа и да съдържа поне една цифра, малка и голяма буква!';
    echo json_encode($response);
    return;
  }

  $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
  $stmt->bind_param("s", $username);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    http_response_code(400);
    $response['error_field'] = 'username';
    $response['error'] = 'Потребителско име вече е заето!';
    echo json_encode($response);
    return;
  }

  $stmt->close();

  $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
  $stmt->bind_param("s", $email);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    http_response_code(400);
    $response['error_field'] = 'email';
    $response['error'] = 'Имейлът вече е зает!';
    echo json_encode($response);
    return;
  }

  $stmt->close();

  $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

  $stmt = $conn->prepare("INSERT INTO users (username, name, email, password_hash, card_number, expiry_date, cvv) VALUES (?, ?, ?, ?, ?, ?, ?)");
  $stmt->bind_param("sssssss", $username, $name, $email, $hashedPassword, $cardNumber, $expiryDate, $cvv);
  if ($stmt->execute()) {
    http_response_code(201);
    $_SESSION['username'] = $username;
    $_SESSION['userid'] = $conn->insert_id;
    
    $response['message'] = "New record created successfully";
    echo json_encode($response);
  } else {
    http_response_code(500);
    $response['error'] = "Грешка: " . $stmt->error;
    echo json_encode($response);
  }

  $stmt->close();
}

$conn->close();
