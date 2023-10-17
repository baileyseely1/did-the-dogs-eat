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
  } else {
    const btnId = e.target.id;
    const mealRef = ref(database, `Meals/${btnId}/hasEaten`);

    try {
      const snapshot = await get(mealRef);

      if (snapshot.exists()) {
        const hasEaten = snapshot.val();
        await set(mealRef, !hasEaten);
        const buttonElement = document.getElementById(btnId);
        if (hasEaten) {
          buttonElement.classList.remove("checked");
        } else {
          buttonElement.classList.add("checked");
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
});

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
  checkAndResetHasEaten(storedDate);
});

function checkAndResetHasEaten(data) {
  const currentDate = getDate();
  if (data !== currentDate) {
    set(dateRef, currentDate);
    set(ref(database, `Meals/breakfast/hasEaten`), false);
    set(ref(database, `Meals/lunch/hasEaten`), false);
    set(ref(database, `Meals/supper/hasEaten`), false);
  }
}

function render() {
  setDate();
}

render();
