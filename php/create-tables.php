<?php
require_once 'config.php';

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    card_number VARCHAR(255) NOT NULL,
    expiry_date VARCHAR(255) NOT NULL,
    cvv VARCHAR(255) NOT NULL
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'users' created successfully";
} else {
    echo "Error creating 'users' table: " . $conn->error;
}

$sql = "CREATE TABLE IF NOT EXISTS teams (
    team_id INT PRIMARY KEY,
    team_name VARCHAR(255)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'teams' created successfully";
} else {
    echo "Error creating 'teams' table: " . $conn->error;
}

$sql = "CREATE TABLE IF NOT EXISTS standings (
    league_id INT NOT NULL,
    season INT NOT NULL,
    team_id INT NOT NULL,
    place INT NOT NULL,
    wins INT NOT NULL,
    draws INT NOT NULL,
    loses INT NOT NULL,
    goals_scored INT NOT NULL,
    goals_conceded INT NOT NULL,
    points INT NOT NULL,
    PRIMARY KEY (league_id, season, team_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'standings' created successfully";
} else {
    echo "Error creating 'standings' table: " . $conn->error;
}

$conn->close();
