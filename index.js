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
                    let value = item.value || item;
                    let date = item.date || "";
                    let time = item.time || "";
                    let li = document.createElement("li");
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
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://playground-a781d-default-rtdb.firebaseio.com//"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "shoppingList")
const bkshoppingListInDB = ref(database, "bkshoppingList")
const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

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

    push(shoppingListInDB, inputValue)
    push(bkshoppingListInDB, {
        value: inputValue,
        date: dateStr,
        time: timeStr
    })
    clearInputFieldEl()
})

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
    
        clearShoppingListEl()
        
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]
            
            appendItemToShoppingListEl(currentItem)
        }    
    } else {
        shoppingListEl.innerHTML = "EFES"
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
    let itemValue = item[1]
    
    let newEl = document.createElement("li")
    
    newEl.textContent = itemValue
    
    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
        
        remove(exactLocationOfItemInDB)
    })
    
    shoppingListEl.append(newEl)
}
