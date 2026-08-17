const firebaseConfig = {
    apiKey: "AIzaSyDx-kmXXN2NDALuXTxF7xiJEVMcJXDbm24",
    authDomain: "pc-game-db.firebaseapp.com",
    databaseURL: "https://pc-game-db-default-rtdb.firebaseio.com",
    projectId: "pc-game-db",
    storageBucket: "pc-game-db.firebasestorage.app",
    messagingSenderId: "80917233174",
    appId: "1:80917233174:web:f6e2833cead01cbf747f37"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
const auth = firebase.auth();

// รอ Firebase Anonymous Auth ให้พร้อมก่อน
function ensureAnonymousAuth() {
    if (auth.currentUser) {
        return Promise.resolve(auth.currentUser);
    }

    return auth.signInAnonymously()
        .then(result => result.user);
}

// เชื่อมระบบตอนเปิดหน้า
ensureAnonymousAuth()
    .then(() => {
        console.log("Firebase connected");

        if (typeof logCMD === "function") {
            logCMD("🔒 NETWORK: CONNECTION SECURED.", "success");
        }
    })
    .catch(error => {
        console.error("Firebase Auth Error:", error);

        if (typeof logCMD === "function") {
            logCMD("🔥 AUTH ERROR: " + error.message, "error");
        }
    });


// ===============================
// ส่งคะแนนขึ้น Leaderboard
// ===============================
window.syncDataToServer = async function(shopName, stars, gold) {

    try {

        const user = await ensureAnonymousAuth();

        await db.ref("leaderboard/" + user.uid).set({
            shopName: shopName || "ไม่ระบุชื่อ",
            stars: Number(stars) || 0,
            gold: Number(gold) || 0,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });

        console.log("Leaderboard synced:", shopName, stars, gold);

        if (typeof logCMD === "function") {
            logCMD("☁️ LEADERBOARD SYNCED.", "success");
        }

    } catch (error) {

        console.error("Leaderboard Sync Error:", error);

        if (typeof logCMD === "function") {
            logCMD(
                "🔥 DATABASE REJECTED: " + error.message,
                "error"
            );
        }
    }
};
