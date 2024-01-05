<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

session_start();

function fetch_standings($year, $leagueID) {
    $result = array();

    // Validate parameters
    if (empty($year) || empty($leagueID)) {
        http_response_code(400);
        $result['error'] = 'Година и идентификатор на лигата са задължителни полета';
        return $result;
    }

    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    if ($conn->connect_error) {
        http_response_code(500);
        $result['error'] = "Грешка при връзка с базата: " . $conn->connect_error;
        return $result;
    }

    $sql = "SELECT s.place, t.team_name, s.wins, s.draws, s.loses, s.goals_scored, s.goals_conceded, s.points
            FROM standings s
            JOIN teams t ON s.team_id = t.team_id
            WHERE s.league_id = ? AND s.season = ?";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("ii", $leagueID, $year);

        if ($stmt->execute()) {
            $stands = $stmt->get_result();
            
            if ($stands->num_rows > 0) {
                $standings = array();

                while ($row = $stands->fetch_assoc()) {
                    $standings[] = array(
                        'place' => $row['place'],
                        'team_name' => $row['team_name'],
                        'wins' => $row['wins'],
                        'draws' => $row['draws'],
                        'loses' => $row['loses'],
                        'goals_scored' => $row['goals_scored'],
                        'goals_conceded' => $row['goals_conceded'],
                        'points' => $row['points']
                    );
                }

                http_response_code(200);
                return $standings;
            } else {
                http_response_code(404);
                $result['error'] = "Няма данни за посочената година и лига";
            }
        } else {
            http_response_code(500);
            $result['error'] = "Неуспешно изпълнение на заявката";
        }
    } else {
        http_response_code(500);
        $result['error'] = "Грешка при подготовка на заявката: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();

    return $result;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    $year = $data['year'];
    $leagueID = $data['leagueID'];

    $result = fetch_standings($year, $leagueID);

    if (isset($result['error'])) {
        echo json_encode($result);
    } else {
        http_response_code(200);
        echo json_encode($result);
    }
}
?>