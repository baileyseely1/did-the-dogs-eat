export function getDate() {
  const date = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate;
}

export function setDate() {
  const dateEl = document.getElementById("date");
  dateEl.textContent = getDate();
}

export function updateButtonAppearance(btnId, state) {
  const buttonElement = document.getElementById(btnId);
  if (btnId === "walked") {
    if (state) {
      buttonElement.classList.add("checked");
    } else {
      buttonElement.classList.remove("checked");
    }
  } else {
    if (state) {
      buttonElement.classList.add("checked");
    } else {
      buttonElement.classList.remove("checked");
    }
  }
}
