let currentErrorTimeout

async function checkLogin() {
  const response = await fetch(
    "http://localhost/football/php/check-login.php",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  )

  const { username } = await response.json()
  const navbar = document.getElementById("navigation-bar")
  if (username) {
    navbar.style.display = "flex"
    document.getElementById("username").textContent = username
    return true
  } else {
    navbar.style.display = "none"
    return false
  }
}

document.getElementById("logout").addEventListener("click", async function () {
  const response = await fetch("http://localhost/football/php/logout.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  const loggedOut = (await response.json()).success

  if (loggedOut) {
    window.location.href = "http://localhost/football/landing/landing.html"
    checkLogin()
  }
})

function showError(errorMessage) {
  const errorContainer = document.getElementById("toast-container")
  const error = document.createElement("div")
  error.textContent = errorMessage
  error.id = "toast-message"
  errorContainer.appendChild(error)
  errorContainer.style.display = "block"

  currentErrorTimeout = setTimeout(() => {
    errorContainer.style.display = "none"
    error.remove()
  }, 5000)
}

document.getElementById("username").addEventListener("click", function () {
  window.location.href = "#"
})
