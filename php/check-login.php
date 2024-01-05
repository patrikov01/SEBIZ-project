<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

session_start();


if (isset($_SESSION['username']) && isset($_SESSION['userid'])) {
  echo json_encode(array(
    'username' => $_SESSION['username'],
    'userid' => $_SESSION['userid']
  ));
  return;
}

echo json_encode(array(
  'username' => null,
  'userid' => null
));