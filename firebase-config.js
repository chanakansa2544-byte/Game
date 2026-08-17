const firebaseConfig = {

    apiKey:
        "AIzaSyDx-kmXXN2NDALuXTxF7xiJEVMcJXDbm24",

    authDomain:
        "pc-game-db.firebaseapp.com",

    databaseURL:
        "https://pc-game-db-default-rtdb.firebaseio.com",

    projectId:
        "pc-game-db",

    storageBucket:
        "pc-game-db.firebasestorage.app",

    messagingSenderId:
        "80917233174",

    appId:
        "1:80917233174:web:f6e2833cead01cbf747f37"
};


if (
    !firebase.apps.length
) {

    firebase.initializeApp(
        firebaseConfig
    );
}


const db =
    firebase.database();


const auth =
    firebase.auth();


// ======================================
// Anonymous Authentication
// ======================================

let anonymousAuthPromise =
    null;


function ensureAnonymousAuth() {

    if (
        auth.currentUser
    ) {

        return Promise.resolve(
            auth.currentUser
        );
    }


    if (
        anonymousAuthPromise
    ) {

        return anonymousAuthPromise;
    }


    anonymousAuthPromise =
        auth
            .signInAnonymously()

            .then(
                result =>
                    result.user
            )

            .finally(
                () => {

                    anonymousAuthPromise =
                        null;
                }
            );


    return anonymousAuthPromise;
}


// ======================================
// Connect ตอนเปิดหน้า
// ======================================

ensureAnonymousAuth()

    .then(
        () => {

            console.log(
                "Firebase connected"
            );


            if (
                typeof logCMD ===
                "function"
            ) {

                logCMD(
                    "🔒 NETWORK: CONNECTION SECURED.",
                    "success"
                );
            }
        }
    )

    .catch(
        error => {

            console.error(
                "Firebase Auth Error:",
                error
            );


            if (
                typeof logCMD ===
                "function"
            ) {

                logCMD(
                    "🔥 AUTH ERROR: " +
                    error.message,
                    "error"
                );
            }
        }
    );


// ======================================
// ส่งข้อมูล Leaderboard
// ======================================

window.syncDataToServer =
    async function(
        shopName,
        stars,
        gold,
        accuracy = 0,
        totalAttempts = 0,
        correctAttempts = 0
    ) {

        try {

            const user =
                await
                    ensureAnonymousAuth();


            await db
                .ref(
                    "leaderboard/" +
                    user.uid
                )
                .set({

                    shopName:
                        shopName ||
                        "ไม่ระบุชื่อ",

                    stars:
                        Number(
                            stars
                        ) || 0,

                    gold:
                        Number(
                            gold
                        ) || 0,

                    accuracy:
                        Number(
                            accuracy
                        ) || 0,

                    totalAttempts:
                        Number(
                            totalAttempts
                        ) || 0,

                    correctAttempts:
                        Number(
                            correctAttempts
                        ) || 0,

                    updatedAt:
                        firebase
                            .database
                            .ServerValue
                            .TIMESTAMP
                });


            console.log(
                "Leaderboard synced:",
                shopName,
                stars,
                accuracy
            );


            if (
                typeof logCMD ===
                "function"
            ) {

                logCMD(
                    "☁️ LEADERBOARD SYNCED.",
                    "success"
                );
            }

        } catch (
            error
        ) {

            console.error(
                "Leaderboard Sync Error:",
                error
            );


            if (
                typeof logCMD ===
                "function"
            ) {

                logCMD(
                    "🔥 DATABASE REJECTED: " +
                    error.message,
                    "error"
                );
            }
        }
    };
