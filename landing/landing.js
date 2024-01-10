const requiredErrorMessage = "Това поле е задължително!"
var chosenLeague = ""
const footballLeaguesMap = new Map([
  ['premier_league', 39],
  ['la_liga', 140],
  ['seria_a', 135],
  ['bundesliga', 78],
  ['ligue_one', 61],
  ['efbet_liga', 172]
]);

window.onload = async function () {
  resetSeasonField()
  const loggedIn = await checkLogin()
  if (loggedIn) {
    document.getElementById("login-register").style.display = "none"
    document.getElementById("search-league-container-button").style.display = "block"
  } else {
    document.getElementById("login-register").style.display = "flex"
    document.getElementById("search-league-container-button").style.display = "none"
  }
}

const dropdown = document.querySelector(".list-choice")
const dropdownTitle = dropdown.querySelector(".list-choice-title")
const dropdownObjects = dropdown.querySelector(".list-choice-objects")
const radioInputs = dropdownObjects.querySelectorAll('input[type="radio"]')

dropdownTitle.addEventListener("click", function () {
  dropdownObjects.classList.toggle("expanded")
})

radioInputs.forEach(function (input) {
  input.addEventListener("click", function () {
    dropdownTitle.textContent = this.nextElementSibling.textContent
    dropdownObjects.classList.remove("expanded")

    chosenLeague = this.getAttribute("id")
  })
})

document.addEventListener("click", function (event) {
  if (!dropdown.contains(event.target)) {
    dropdownObjects.classList.remove("expanded")
  }
})

function resetDropdown() {
  dropdownTitle.textContent = "Избери място"
}

document
  .querySelectorAll(
    "a[href='#registration-popup'], a[href='#login-popup'], a[href='#']"
  )
  .forEach(function (link) {
    link.addEventListener("click", function () {
      resetErrorMessages()
      resetInputFields()
    })
  })

const inputFields = document.querySelectorAll(".form-field input")
inputFields.forEach((input) => {
  input.addEventListener("focus", () => {
    const label = input.parentElement.querySelector("label")
    label.classList.add("active")
  })

  input.addEventListener("blur", () => {
    const label = input.parentElement.querySelector("label")
    if (input.value === "") {
      label.classList.remove("active")
    }
  })
})

function login(username, password, errorLabel) {
  fetch("http://localhost/football/php/login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then(async (response) => {
      const status = response.status
      const json = await response.json()
      return { status, json }
    })
    .then(async ({ status, json }) => {
      if (status === 200) {
        const isLoggedIn = await checkLogin()
        if (isLoggedIn) {
          document.getElementById("login-register").style.display = "none"
          document.getElementById("search-league-container-button").style.display = "block"
        } else {
          document.getElementById("login-register").style.display = "flex"
          document.getElementById("search-league-container-button").style.display = "none"
        }
        window.location.href = "#"
      } else if (status === 404) {
        setInvalidLogin(errorLabel, json["error"])
      } else {
        displayError(json["error"])
      }
    })
}

function register(username, name, email, password, confirmPassword, cardNumber, expiryDate, cvv) {
  fetch("http://localhost/football/php/register.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      name: name,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      cardNumber: cardNumber,
      expiryDate: expiryDate,
      cvv: cvv
    }),
  })
    .then(async (response) => {
      const status = response.status
      const json = await response.json()
      return { status, json }
    })
    .then(async ({ status, json }) => {
      if (status === 201) {
        const isLoggedIn = await checkLogin()
        window.location.href =
          "http://localhost/football/landing/landing.html"
      } else if (status === 400) {
        if (json["error_field"] === "username") {
          setInvalidField(
            "username-register",
            "username-register-error",
            json["error"]
          )
        } else if (json["error_field"] === "email") {
          setInvalidField(
            "email-register",
            "email-register-error",
            json["error"]
          )
        } else {
          displayError(json["error"])
        }
      }
    })
}

document
  .getElementById("register-form")
  .addEventListener("submit", function (event) {
    event.preventDefault()

    resetErrorMessages()

    var validatedInputs = validateForm()
    resetPasswords()

    if (validatedInputs) {
      console.log(validatedInputs)
      var [username, name, email, password, confirmPassword, cardNumber, expiryDate, cvv] = validatedInputs
      register(username, name, email, password, confirmPassword, cardNumber, expiryDate, cvv)
    }
  })

document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault()

    var username = document.getElementById("username-login").value
    var password = document.getElementById("password-login").value
    var errorLabel = document.getElementById("login-error")
    errorLabel.value = ""
    errorLabel.classList.remove("error-style")

    login(username, password, errorLabel)
  })

function resetPasswords() {
  var password = document.getElementById("password-register")
  var copyPassword = document.getElementById("copy-password-register")
  password.value = ""
  copyPassword.value = ""
}

function resetErrorMessages() {
  var errorElements = document.querySelectorAll(".error")
  errorElements.forEach(function (error) {
    error.textContent = ""
    error.classList.remove("error-style")
  })

  var inputElements = document.querySelectorAll(".form-field input")
  inputElements.forEach(function (input) {
    input.classList.remove("invalid")
  })
}

function resetSeasonField() {
  var seasonInput = document.getElementById("league-season")
  var errorLabel = document.getElementById("league-season-error")
  seasonInput.value = ""
  errorLabel.classList.remove("error-style")
}

function resetInputFields() {
  var inputElements = document.querySelectorAll(".form-field input")
  inputElements.forEach(function (input) {
    input.classList.remove("invalid")
	  const label = input.parentElement.querySelector("label")
    label.classList.remove("active")
    input.value = ""
  })
}

function validateForm() {
  var isValid = true
  var validInputs = []

  isValid =
    validateField(
      "username-register",
      "username-register-error",
      "Потребителското име трябва да е между 3 и 20 символа!",
      function (value) {
        return value.length >= 3 && value.length <= 20
      },
      validInputs
    ) && isValid

  isValid =
    validateField(
      "name-register",
      "name-register-error",
      "Името трябва да е максимум 50 символа!",
      function (value) {
        return value.length <= 50
      },
      validInputs
    ) && isValid

  isValid =
    validateField(
      "email-register",
      "email-register-error",
      "Невалиден имейл адрес! Имейлът трябва да следва следната структура username@domain.extension!",
      function (value) {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailPattern.test(value)
      },
      validInputs
    ) && isValid

  isValid =
    validateField(
      "password-register",
      "password-register-error",
      "Паролата трябва да е минимум 8 символа и да съдържа поне една цифра, малка и голяма буква!",
      function (value) {
        var passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
        return passwordPattern.test(value)
      },
      validInputs
    ) && isValid

  isValid =
    validatePasswords(
      "password-register",
      "copy-password-register",
      "copy-password-register-error",
      "Паролата не съответства с въведената по-горе!",
      function (value1, value2) {
        return value1 === value2
      },
      validInputs
    ) && isValid
  
    isValid =
    validateField(
      "number-register",
      "number-register-error",
      "Невалиден номер на карта!",
      function (cardNumber) {
         // Remove spaces and dashes from the card number
  cardNumber = cardNumber.replace(/[\s-]/g, '');

  // Check if the card number contains only digits and has a valid length (typically 13-19 digits)
  if (!/^\d{13,19}$/.test(cardNumber)) {
    return false;
  }

  // Use Luhn algorithm to validate the card number
  let checksum = 0;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    if ((cardNumber.length - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    checksum += digit;
  }

  return checksum % 10 === 0;
      },
      validInputs
    ) && isValid
    
    isValid =
    validateField(
      "expiry-register",
      "expiry-register-error",
      "Валидността трябва да е в този формат: (MM/YY)",
      function (expiryDate) {
        // Assuming expiryDate is in MM/YYYY format
  const [month, year] = expiryDate.split('/').map(val => parseInt(val));

  // Check if month and year are valid numbers
  if (isNaN(month) || isNaN(year)) {
    return false;
  }

  // Get the current date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last two digits of the current year
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns zero-based month

  // Validate year and month
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false; // Expiry date is in the past
  }

  return true; // Expiry date is valid
      },
      validInputs
    ) && isValid
  
    isValid =
    validateField(
      "cvv-register",
      "cvv-register-error",
      "CVV кодът не е валиден",
      function (cvv) {
        // Check if CVV is a 3 or 4 digit number
  const cvvRegex = /^[0-9]{3,4}$/;
  return cvvRegex.test(cvv);
      },
      validInputs
    ) && isValid

  if (!isValid) {
    return false
  }

  return validInputs
}

function validateField(
  fieldId,
  errorId,
  validationErrorMessage,
  validationCondition,
  validInputs
) {
  var fieldInput = document.getElementById(fieldId)
  var errorElement = document.getElementById(errorId)
  var fieldValue = fieldInput.value
  console.log(fieldValue)

  if (fieldValue.length === 0) {
    fieldInput.classList.add("invalid")
    errorElement.classList.add("error-style")
    errorElement.textContent = requiredErrorMessage
    return false
  }

  if (!validationCondition(fieldValue)) {
    fieldInput.classList.add("invalid")
    errorElement.classList.add("error-style")
    errorElement.textContent = validationErrorMessage
    return false
  }

  validInputs.push(fieldValue)
  return true
}

function validatePasswords(
  password1Id,
  password2Id,
  errorId,
  validationErrorMessage,
  validationCondition,
  validInputs
) {
  var password = document.getElementById(password1Id)
  var copyPassword = document.getElementById(password2Id)
  var errorElement = document.getElementById(errorId)
  var passwordValue = password.value
  var copyPasswordValue = copyPassword.value

  if (copyPasswordValue.length === 0) {
    errorElement.textContent = requiredErrorMessage
    errorElement.classList.add("error-style")
    copyPassword.classList.add("invalid")
    return false
  }

  if (!validationCondition(passwordValue, copyPasswordValue)) {
    errorElement.textContent = validationErrorMessage
    errorElement.classList.add("error-style")
    copyPassword.classList.add("invalid")
    return false
  }
  validInputs.push(copyPasswordValue)
  return true
}

function setInvalidField(fieldId, errorId, validationErrorMessage) {
  var fieldInput = document.getElementById(fieldId)
  var errorElement = document.getElementById(errorId)
  fieldInput.classList.add("invalid")
  errorElement.classList.add("error-style")
  errorElement.textContent = validationErrorMessage
}

function setInvalidLogin(errorLabel, msg) {
  errorLabel.textContent = msg
  errorLabel.classList.add("error-style")
}

function searchLeague() {
  if(!validateField("league-season", 
  "league-season-error", "Сезонът трябва да е валидна година във формата 'YYYY'!",
  function (value) {
    var yearPattern = /^\d{4}$/
    return yearPattern.test(value)
  },
  []))
    return

  var seasonYear = document.getElementById("league-season").value
  var leagueID = footballLeaguesMap.get(chosenLeague)
  if(leagueID === undefined) {
     displayError("Грешка: Невалидна лига!")
     return
  }

  const params = new URLSearchParams()
  params.append("league", leagueID)
  params.append("season", seasonYear)
  window.location.href = `../standings/index.html?${params.toString()}`
}

document.getElementById("search-button").addEventListener("click", (event) => {
  searchLeague()
})