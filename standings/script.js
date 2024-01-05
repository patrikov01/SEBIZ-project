const standingsBaseURL = "https://v3.football.api-sports.io/standings"
const fixturesBaseURL = "https://v3.football.api-sports.io/fixtures"
const goalscorersBaseURL = "https://v3.football.api-sports.io/players/topscorers"
const noStandingsFoundErrorString = "Няма намерено класиране!"
const noGoalscorersFoundErrorString = "Няма намерени голмайстори!"
const apiKey = 'a043a9f061a1db81b67a8d7e4385c2ed'
const standingsHeaderValues = ['Място', 'Наименувание', 'П', 'Р', 'З', 'Вкарани голове', 'Допуснати голове', 'Голова разлика', 'Точки']
const goalscorersHeaderValues = ['Място', 'Име', 'Националност', 'Мачове', 'Голове', 'Минути/гол', 'Дузпи', 'Асистенции', 'Общ принос'];

const footballLeaguesMapToBg = new Map([
  [39, "Висшата лига"], //id of the league for the name
  [140, "Ла Лига"],
  [135, "Серия А"],
  [78, "Бундеслигата"],
  [61, "Френската лига едно"],
  [172, "Ефбет лига"]
]);

window.onload = async function () {
  isLogged = await checkLogin()
  if(!isLogged) {
    window.location.href = `../landing/landing.html`
    return
  }

  if (window.location.href.includes("index")) {
    await fetchStandings()
  }
}

function buildApiUrl(baseURL, ...params) {
  const queryParams = new URLSearchParams();

  for (let i = 0; i < params.length; i += 2) {
    if (params[i + 1] !== undefined) {
      queryParams.set(params[i], params[i + 1].toString())
    }
  }

  return `${baseURL}?${queryParams.toString()}`;
}

function displayNoStandingsFound(errorMessage) {
  const parentElement = document.getElementById("standings-helper")

  if (parentElement.children.length === 1) {
    const paragraph = document.createElement("p");
    paragraph.id = "no-standings";
    paragraph.textContent = `${errorMessage} Проверете въведените лига и година!`;

    parentElement.appendChild(paragraph);
}
}

function parseStandings(data, seasonYear) {
  if(data["results"] == 0) {
    displayNoStandingsFound(noStandingsFoundErrorString)
    return
  }
  var allStandings = data["response"][0]["league"]["standings"]
  var standings = allStandings[allStandings.length - 1]

  teamsStandings = []

  standings.forEach(teamData => {
    const teamStandings = {
      season: seasonYear,
      place: teamData.rank,
      name: teamData.team.name,
      teamID: teamData.team.id,
      wins: teamData.all.win,
      draws: teamData.all.draw,
      losses: teamData.all.lose,
      goalsScored: teamData.all.goals.for,
      goalsConceded: teamData.all.goals.against,
      goalDifference: teamData.goalsDiff,
      points: teamData.points,  
    };
  
    teamsStandings.push(teamStandings);
  });
  
  displayStandings(teamsStandings)
}

async function fetchResults(apiURL) {
  try {
    const response = await fetch(apiURL, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey
      }
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    return false
  }
}

async function fetchStandings() {
  const urlParams = new URLSearchParams(window.location.search)
  const leagueId = urlParams.get("league")
  const season = urlParams.get("season")
  const nextYear = season % 100 + 1

  var standingsHeader = document.getElementById("standings-header")
  standingsHeader.textContent = `Класиране на ${footballLeaguesMapToBg.get(parseInt(leagueId))} за сезон ${season}-${nextYear}`

  const apiUrl = buildApiUrl(standingsBaseURL, "season", season, "league", leagueId)

  try {
    var data = await fetchResults(apiUrl)
    console.log(data)
    if (data === false) {
      displayNoStandingsFound(noStandingsFoundErrorString)
      return;
    }

    parseStandings(data, season)
  } catch (error) {
    console.error(error)
  }
}

function displayFixtures(teamFixtures) {
  const fixtureTable = document.getElementById('fixtures-container')

  teamFixtures.forEach(fixture => {
    const fixtureRow = document.createElement('div')
    fixtureRow.classList.add('fixture-row')

    var result = `${fixture.homeGoals} - ${fixture.awayGoals}`

    const homeTeamCell = createTableCell(fixture.home, 'fixture-cell')
    const resultCell = createTableCell(result, 'fixture-cell')
    const awayTeamCell = createTableCell(fixture.away, 'fixture-cell')

    fixtureRow.appendChild(homeTeamCell)
    fixtureRow.appendChild(resultCell)
    fixtureRow.appendChild(awayTeamCell)

    fixtureTable.appendChild(fixtureRow)
  });
}

function createTableCell(content, className) {
  const cell = document.createElement('div')
  cell.classList.add(className)
  cell.textContent = content
  return cell
}

function parseFixtures(data) {
  var fixtures = data.response

  const teamFixtures = fixtures
    .filter(teamFixture => (
      teamFixture.teams?.home?.name !== null &&
      teamFixture.goals?.home !== null &&
      teamFixture.teams?.away?.name !== null &&
      teamFixture.goals?.away !== null
    ))
    .map(teamFixture => ({
      home: teamFixture.teams.home.name,
      homeGoals: teamFixture.goals.home,
      away: teamFixture.teams.away.name,
      awayGoals: teamFixture.goals.away
    }))

  displayFixtures(teamFixtures)
}

async function fetchFixtures(event) {
  const clickedRow = event.target.parentNode

  teamID = clickedRow.getAttribute("teamID")
  season = clickedRow.getAttribute("season")
  
  const apiUrl = buildApiUrl(fixturesBaseURL, "season", season, "team", teamID)

  try {
    var data = await fetchResults(apiUrl)
    var results = data.results
    console.log(data)
    if (data === false || results === 0) {
      displayError("Грешка: Не са налични мачове за съответния отбор!")
      return
    }

    parseFixtures(data)
    window.location.href = "#fixtures"
  } catch (error) {
    console.error(error)
  }
}

function displayStandings(leagueStandings) {
  clearPlacesTable();

  const stangingsContainer = document.getElementById("standing-container-nested")
  stangingsContainer.style.display = "block" 
  const table = document.getElementById("standings");
  const tableBody = table.querySelector("tbody");

  table.classList.remove("disabled");

  leagueStandings.forEach(function (team) {
    const newRow = document.createElement("tr")
    const placeCell = document.createElement("td")
    const nameCell = document.createElement("td")
    const winsCell = document.createElement("td")
    const drawsCell = document.createElement("td")
    const lossesCell = document.createElement("td")
    const goalsScoredCell = document.createElement("td")
    const goalsConcededCell = document.createElement("td")
    const goalDifferenceCell = document.createElement("td")
    const pointsCell = document.createElement("td")

    placeCell.textContent = team.place
    nameCell.textContent = team.name
    winsCell.textContent = team.wins
    drawsCell.textContent = team.draws
    lossesCell.textContent = team.losses
    goalsScoredCell.textContent = team.goalsScored
    goalsConcededCell.textContent = team.goalsConceded
    goalDifferenceCell.textContent = team.goalDifference
    pointsCell.textContent = team.points

    newRow.setAttribute("teamID", team.teamID)
    newRow.setAttribute("season", team.season)

    newRow.appendChild(placeCell)
    newRow.appendChild(nameCell)
    newRow.appendChild(winsCell)
    newRow.appendChild(drawsCell)
    newRow.appendChild(lossesCell)
    newRow.appendChild(goalsScoredCell)
    newRow.appendChild(goalsConcededCell)
    newRow.appendChild(goalDifferenceCell)
    newRow.appendChild(pointsCell)

    newRow.onclick = fetchFixtures

    tableBody.appendChild(newRow)
  });
}

function displayGoalscorers(goalscorers) {
  clearPlacesTable();

  const stangingsContainer = document.getElementById("standing-container-nested")
  stangingsContainer.style.display = "block" 
  const table = document.getElementById("standings");
  const tableBody = table.querySelector("tbody");

  table.classList.remove("disabled");

  goalscorers.forEach(function (player) {
    const newRow = document.createElement("tr")
    const placeCell = document.createElement("td")
    const nameCell = document.createElement("td")
    const nationalityCell = document.createElement("td")
    const appearencesCell = document.createElement("td")
    const goalsCell = document.createElement("td")
    const minsPerGoalCell = document.createElement("td")
    const penaltiesCell = document.createElement("td")
    const assistsCell = document.createElement("td")
    const allContributionCell = document.createElement("td")

    placeCell.textContent = player.place
    nameCell.textContent = player.name
    nationalityCell.textContent = player.nationality
    appearencesCell.textContent = player.appearences
    goalsCell.textContent = player.goalsScored
    minsPerGoalCell.textContent = player.minutesPerGoal
    penaltiesCell.textContent = player.penaltiesScored
    assistsCell.textContent = player.assistsMade
    allContributionCell.textContent = player.allContribution

    newRow.appendChild(placeCell)
    newRow.appendChild(nameCell)
    newRow.appendChild(nationalityCell)
    newRow.appendChild(appearencesCell)
    newRow.appendChild(goalsCell)
    newRow.appendChild(minsPerGoalCell)
    newRow.appendChild(penaltiesCell)
    newRow.appendChild(assistsCell)
    newRow.appendChild(allContributionCell)

    tableBody.appendChild(newRow)
  });
}

function parseGoalscorers(data) {
  console.log(data)
  var goalscorers = data.response

  players = []

  goalscorers.forEach(playerData => {
    var stats = playerData.statistics
    var goals = 0
    var penalties = 0
    var assists = 0
    var minutes = 0
    var apps = 0

    stats.forEach(stat => {
      apps += stat.games.appearences
      goals += stat.goals.total
      penalties += stat.penalty.scored
      assists += stat.goals.assists
      minutes += stat.games.minutes
    })

    const player = {
      place: players.length + 1,
      name: playerData.player.name,
      nationality: playerData.player.nationality,
      appearences: apps,
      goalsScored: goals,
      minutesPerGoal: Math.round(minutes / goals),
      penaltiesScored: penalties,
      assistsMade: assists,
      allContribution: goals + assists 
    };
  
    players.push(player);
  })

  displayGoalscorers(players)
}

async function fetchGoalScorers() {
  const urlParams = new URLSearchParams(window.location.search)
  const leagueId = urlParams.get("league")
  const season = urlParams.get("season")
  const nextYear = season % 100 + 1

  var standingsHeader = document.getElementById("standings-header")
  standingsHeader.textContent = `Голмайстори на ${footballLeaguesMapToBg.get(parseInt(leagueId))} за сезон ${season}-${nextYear}`

  const apiUrl = buildApiUrl(goalscorersBaseURL, "season", season, "league", leagueId)

  try {
    var data = await fetchResults(apiUrl)

    if (data === false || data.results === 0) {
      displayNoStandingsFound(noGoalscorersFoundErrorString)
      return
    }

    parseGoalscorers(data, season)
  } catch (error) {
    console.error(error)
  }
}


function sortTable(columnIndex) {
  const table = document.getElementById("standings")

  if (table.classList.contains("disabled")) {
    return
  }

  const tableBody = table.querySelector("tbody")
  const rows = Array.from(tableBody.querySelectorAll("tr"))
  const sortOrder = getSortOrder(columnIndex, table)

  rows.sort((rowA, rowB) => {
    const valueA = parseCellValue(rowA.cells[columnIndex])
    const valueB = parseCellValue(rowB.cells[columnIndex])
    return compareValues(valueA, valueB) * sortOrder
  })

  clearPlacesTable()

  rows.forEach((row) => {
    tableBody.appendChild(row)
  })

  updateSortIndicator(columnIndex, sortOrder, table)
}

function getSortOrder(columnIndex, table) {
  const sortedColumn = table.getAttribute("data-sorted-column")

  if (sortedColumn === columnIndex.toString()) {
    return changeSortOrder(table)
  }
  return (columnIndex === 0 || columnIndex === 1) ? 1 : -1
}

function changeSortOrder(table) {
  const currentSortOrder = parseInt(table.getAttribute("data-sort-order"))
  const newSortOrder = currentSortOrder * -1
  table.setAttribute("data-sort-order", newSortOrder)
  return newSortOrder
}

function parseCellValue(cell) {
  const cellText = cell.textContent.trim()
  const isNumber = !isNaN(parseFloat(cellText))

  return isNumber ? parseFloat(cellText) : cellText
}

function compareValues(a, b) {
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b)
  }
  return a - b
}

function removeSortIndicator() {
  const table = document.getElementById("standings")
  const headers = table.querySelectorAll("th")
  headers.forEach((header) => {
    const indicator = header.querySelector(".sort-indicator")
    indicator.classList.remove("asc", "desc")
  })
}

function updateSortIndicator(columnIndex, sortOrder, table) {
  const headers = table.querySelectorAll("th")
  headers.forEach((header, index) => {
    if (index === columnIndex) {
      const indicator = header.querySelector(".sort-indicator")
      indicator.classList.remove("asc", "desc")

      if (sortOrder === 1) {
        indicator.classList.add("asc")
      } else {
        indicator.classList.add("desc")
      }
    } else {
      const indicator = header.querySelector(".sort-indicator")
      indicator.classList.remove("asc", "desc")
    }
  })

  table.setAttribute("data-sorted-column", columnIndex)
  table.setAttribute("data-sort-order", sortOrder)
}

function clearPlacesTable() {
  const table = document.getElementById("standings")
  const tableBody = table.querySelector("tbody")

  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild)
  }

  removeSortIndicator()
}

function changeHeaderValues(headerValues) {
  headerValues.forEach((value, index) => {
    var header = document.getElementById(`header${index}`)
    header.innerHTML = `${value} <span class="sort-indicator"></span>`
  })
}

document.addEventListener('DOMContentLoaded', function () {
  const standingsButton = document.getElementById('standings-button')
  const goalscorersButton = document.getElementById('goalscorers-button')

  standingsButton.addEventListener('click', function () {
    var isHighlighted = standingsButton.classList.contains('highlighted-button')
    if(isHighlighted) {
      displayError('Опцията "Класиране" вече е избрана!')
    }
    else {
    standingsButton.classList.add('highlighted-button')
    goalscorersButton.classList.remove('highlighted-button')
    changeHeaderValues(standingsHeaderValues)
    fetchStandings()
    }
  });

  goalscorersButton.addEventListener('click', function () {
    var isHighlighted = goalscorersButton.classList.contains('highlighted-button')
    if(isHighlighted) {
      displayError('Опцията "Голмайстори" вече е избрана!')
    }
    else {
    goalscorersButton.classList.add('highlighted-button')
    standingsButton.classList.remove('highlighted-button')
    changeHeaderValues(goalscorersHeaderValues)
    fetchGoalScorers()
    }
  })
})
