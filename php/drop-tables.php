<?php

require_once 'config.php';
include_once 'logout.php';

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "DROP TABLE IF EXISTS standings";

if ($conn->query($sql) === TRUE) {
  echo "\nTable standings dropped successfully";
} else {
  echo "\nError dropping table: " . $conn->error;
}

$sql = "DROP TABLE IF EXISTS teams";

if ($conn->query($sql) === TRUE) {
  echo "\nTable teams dropped successfully";
} else {
  echo "\nError dropping table: " . $conn->error;
}

$sql = "DROP TABLE IF EXISTS users";

if ($conn->query($sql) === TRUE) {
  echo "\nTable users dropped successfully";
} else {
  echo "\nError dropping table: " . $conn->error;
}

$conn->close();
