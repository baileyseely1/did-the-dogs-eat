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

const twilio = require("twilio");

document.addEventListener("click", async (e) => {
  const isBtn = e.target.nodeName === "BUTTON";
  if (!isBtn) {
    return;
  }

  const btnId = e.target.id;
  const mealRef = ref(database, `Meals/${btnId}/hasEaten`);

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
    meal[0] === `${meal[0]}` && meal[1].hasEaten
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

async function sendSMS(to, body) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    await client.messages.create({
      body: body,
      to: +19029164110, // The recipient's phone number
      from: +13082109335, // Use your Twilio phone number here
    });
    console.log("SMS sent successfully");
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}

function render() {
  setDate();
}

render();

sendSMS();
