var db;
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (e) {
    db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Error" + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const pending = transaction.objectStore("pending");
    pending.add(record);
};

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const pending = transaction.objectStore("pending");
    const getAll = pending.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(pending.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }   
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const pending = transaction.objectStore("pending");
                    pending.clear();
                });
        }
    };
};

window.addEventListener("online", checkDatabase);