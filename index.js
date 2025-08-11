import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

// --- App & Firebase Setup ---
const appSettings = {
    databaseURL: "https://playground-a781d-default-rtdb.firebaseio.com//"
}
const app = initializeApp(appSettings)
const database = getDatabase(app)

// --- User/Device Identification ---
function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = `device-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

function getOrCreateUserColor() {
    let userColor = localStorage.getItem('userColor');
    if (!userColor) {
        const hue = Math.floor(Math.random() * 360);
        userColor = `hsl(${hue}, 70%, 85%)`; // Generate a light, pastel color
        localStorage.setItem('userColor', userColor);
    }
    return userColor;
}

const deviceId = getOrCreateDeviceId();
const userColor = getOrCreateUserColor();

// --- Database References ---
const shoppingListInDB = ref(database, "shoppingList") // Now a shared list
const bkshoppingListInDB = ref(database, "bkshoppingList") // History is shared

// --- History Modal Logic ---
const historyButtonEl = document.getElementById("history-button");
const historyModalEl = document.getElementById("history-modal");
const closeHistoryModalEl = document.getElementById("close-history-modal");
const historyListEl = document.getElementById("history-list");

if (historyButtonEl && historyModalEl && closeHistoryModalEl && historyListEl) {
    historyButtonEl.addEventListener("click", function() {
        // Clear previous list
        historyListEl.innerHTML = "Loading...";
        historyModalEl.style.display = "block";
        // Fetch history from bkshoppingList using already imported functions
        onValue(bkshoppingListInDB, function(snapshot) {
            if (snapshot.exists()) {
                let itemsArray = Object.entries(snapshot.val());
                // Sort by most recent (optional)
                itemsArray.reverse();
                historyListEl.innerHTML = "";
                for (let i = 0; i < itemsArray.length; i++) {
                    let item = itemsArray[i][1];
                    let value = item.value;
                    let date = item.date || "";
                    let time = item.time || "";
                    let color = item.color || "#FFFDF8"; // Fallback color
                    let li = document.createElement("li");
                    li.style.borderLeft = `5px solid ${color}`;
                    li.textContent = value + (date ? ` (${date} ${time})` : "");
                    historyListEl.appendChild(li);
                }
            } else {
                historyListEl.innerHTML = "No history found.";
            }
        }, { onlyOnce: true });
    });

    closeHistoryModalEl.addEventListener("click", function() {
        historyModalEl.style.display = "none";
    });

    // Close modal when clicking outside content
    window.addEventListener("click", function(event) {
        if (event.target === historyModalEl) {
            historyModalEl.style.display = "none";
        }
    });
}
// --- DOM Elements ---
const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

// --- Event Listeners ---
addButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value
    // jw added this function to prevent blanks
    if (inputValue === "") {
        alert("You will need to enter something"); 
        return; // stop the function here
    }

    // Get current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    const itemData = {
        value: inputValue,
        color: userColor
    }
    const historyItemData = {
        value: inputValue,
        date: dateStr,
        time: timeStr,
        deviceId: deviceId,
        color: userColor
    }
    push(shoppingListInDB, itemData)
    push(bkshoppingListInDB, historyItemData)
    clearInputFieldEl()
})

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
    
        clearShoppingListEl()
        
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            appendItemToShoppingListEl(currentItem)
        }    
    } else {
        // A more user-friendly message for an empty list
        shoppingListEl.innerHTML = "No items here... yet"
    }
})

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    inputFieldEl.value = ""
}

function appendItemToShoppingListEl(item) {
    let itemID = item[0]
    let itemData = item[1]
    let itemValue = itemData.value
    let itemColor = itemData.color
    
    let newEl = document.createElement("li")
    
    newEl.textContent = itemValue
    newEl.style.backgroundColor = itemColor
    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
        remove(exactLocationOfItemInDB)
    })
    
    shoppingListEl.append(newEl)
}
