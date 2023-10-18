import { setDate, getDate } from "./components/utils.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://test-13177-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const mealsInDb = ref(database, "Meals");
const dateRef = ref(database, "Date");

document.addEventListener("click", async (e) => {
  const isBtn = e.target.nodeName === "BUTTON";
  if (!isBtn) {
    return;
  }

  const btnId = e.target.id;
  const mealRef = ref(database, `Meals/${btnId}/hasEaten`);

  if (btnId === "walked") {
    handleWalkedButtonClick();
  } else {
    handleMealButtonClick(mealRef, btnId);
  }
});

async function handleWalkedButtonClick() {
  const walkedRef = ref(database, "hasWalked");
  try {
    const walkedSnapshot = await get(walkedRef);
    if (walkedSnapshot.exists()) {
      const hasWalked = walkedSnapshot.val();
      await set(walkedRef, !hasWalked);
      updateButtonAppearance("walked", !hasWalked);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

async function handleMealButtonClick(mealRef, btnId) {
  try {
    const snapshot = await get(mealRef);
    if (snapshot.exists()) {
      const hasEaten = snapshot.val();
      await set(mealRef, !hasEaten);
      updateButtonAppearance(btnId, !hasEaten);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function updateButtonAppearance(btnId, hasEaten) {
  const buttonElement = document.getElementById(btnId);
  if (hasEaten) {
    buttonElement.classList.add("checked");
  } else {
    buttonElement.classList.remove("checked");
  }
}

onValue(mealsInDb, (snapshot) => {
  const data = snapshot.val();
  const dataArr = Object.entries(data);
  dataArr.forEach((meal) => {
    meal[0] === `${meal[0]}` && meal[1].hasEaten
      ? document.getElementById(`${meal[0]}`).classList.add("checked")
      : document.getElementById(`${meal[0]}`).classList.remove("checked");
  });
});

onValue(dateRef, (dateSnapshot) => {
  const storedDate = dateSnapshot.val();
  checkAndReset(storedDate);
});

function checkAndReset(data) {
  const currentDate = getDate();
  if (data !== currentDate) {
    set(dateRef, currentDate);
    set(ref(database, `Meals/breakfast/hasEaten`), false);
    set(ref(database, `Meals/lunch/hasEaten`), false);
    set(ref(database, `Meals/supper/hasEaten`), false);
    set(ref(database, "hasWalked"), false);
  }
}

function render() {
  setDate();
}

render();
