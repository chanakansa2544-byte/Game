// ตั้งค่า Firebase ของคุณครู
const firebaseConfig = {
    apiKey: "AIzaSyDx-kmXXN2NDALuXTxF7xiJEVMcJXDbm24",
    authDomain: "pc-game-db.firebaseapp.com",
    databaseURL: "https://pc-game-db-default-rtdb.firebaseio.com",
    projectId: "pc-game-db",
    storageBucket: "pc-game-db.firebasestorage.app",
    messagingSenderId: "80917233174",
    appId: "1:80917233174:web:f6e2833cead01cbf747f37"
};

// เชื่อมต่อ Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const auth = firebase.auth();

// สร้าง ID ประจำเครื่องอัตโนมัติ (Anonymous Auth)
auth.signInAnonymously().then(() => {
    if (typeof logCMD === 'function') logCMD("🔒 NETWORK: CONNECTION SECURED.", "success");
}).catch((error) => {
    if (typeof logCMD === 'function') logCMD("🔥 AUTH ERROR: " + error.message, "error");
});

// ฟังก์ชันกลางสำหรับให้เกมส่งคะแนนขึ้น Server
window.syncDataToServer = function(shopName, stars, gold) {
    const user = firebase.auth().currentUser;
    if (user) {
        db.ref('leaderboard/' + user.uid).set({
            shopName: shopName,
            stars: stars,
            gold: gold
        }).catch(err => {
            // ถ้า Firebase ปฏิเสธข้อมูล จะมีตัวหนังสือสีแดงแจ้งเตือนขึ้นในจอ CMD ทันที!
            if (typeof logCMD === 'function') logCMD("🔥 DATABASE REJECTED: " + err.message, "error");
        });
    } else {
        if (typeof logCMD === 'function') logCMD("🔥 SYNC FAILED: NO USER TOKEN", "error");
    }
};
