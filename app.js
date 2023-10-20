import { setDate, getDate, hardRefresh } from "./components/utils.js";
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
const walkedRef = ref(database, "hasWalked");

document.addEventListener("click", async (e) => {
  const isBtn = e.target.nodeName === "BUTTON";
  const btnId = e.target.id;
  const mealRef = ref(database, `Meals/${btnId}/hasEaten`);

  if (!isBtn) {
    return;
  }
  if (btnId === "walked") {
    handleWalkedButtonClick(btnId);
  } else {
    handleMealButtonClick(mealRef, btnId);
  }
});

async function handleWalkedButtonClick(btnId) {
  const walkedRef = ref(database, "hasWalked");
  try {
    const walkedSnapshot = await get(walkedRef);
    if (walkedSnapshot.exists()) {
      const hasWalked = walkedSnapshot.val();
      await set(walkedRef, !hasWalked);
      setTimeout(hardRefresh, 5000);
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
      setTimeout(hardRefresh, 5000);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

onValue(mealsInDb, (snapshot) => {
  const data = snapshot.val();
  const dataArr = Object.entries(data);
  dataArr.forEach((meal) => {
    const mealEl = document.getElementById(`${meal[0]}`);
    meal[1].hasEaten
      ? mealEl.classList.add("checked")
      : mealEl.classList.remove("checked");
  });
});

onValue(dateRef, (dateSnapshot) => {
  const storedDate = dateSnapshot.val();
  checkAndReset(storedDate);
});

onValue(walkedRef, (walkedSnapshot) => {
  const hasWalked = walkedSnapshot.val();
  const walkedEl = document.getElementById("walked");
  hasWalked
    ? walkedEl.classList.add("checked")
    : walkedEl.classList.remove("checked");
});

function checkAndReset(date) {
  const currentDate = getDate();
  if (date !== currentDate) {
    set(dateRef, currentDate);
    set(ref(database, `Meals/breakfast/hasEaten`), false);
    set(ref(database, `Meals/lunch/hasEaten`), false);
    set(ref(database, `Meals/supper/hasEaten`), false);
    set(ref(database, "hasWalked"), false);
  }
}

setDate();
