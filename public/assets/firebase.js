/* ============================================================
   APNA ELECTRIC ONE — Firebase (Firestore + Auth)
   Path: public/assets/firebase.js
   ------------------------------------------------------------
   Agar Firebase load na ho, app localStorage pe chalta rahega.
   ============================================================ */

(function () {
    'use strict';

    const firebaseConfig = {
        apiKey: "AIzaSyC7DrkGPzB1IvwIJJjOPhKcH1sjghqCZ6o",
        authDomain: "apna-electric-one.firebaseapp.com",
        projectId: "apna-electric-one",
        storageBucket: "apna-electric-one.appspot.com",
        messagingSenderId: "922145860433",
        appId: "1:922145860433:web:cf1c7f4b54f388f4c4c170"
    };

    const COLLECTIONS = ['rides', 'orders', 'drivers', 'products'];

    const FB = {
        ready: false,
        user: null,
        error: null
    };

    let db = null, auth = null, fs = null;

    /* ---------- INIT ---------- */
    function init() {
        if (typeof firebase === 'undefined' || !firebase.initializeApp) {
            FB.error = 'Firebase SDK not loaded';
            console.warn('[FB]', FB.error);
            return;
        }
        try {
            if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            auth = firebase.auth();
            fs = firebase.firestore.FieldValue;
            FB.ready = true;

            // offline persistence (best effort)
            db.enablePersistence({ synchronizeTabs: true }).catch(function () { /* ignore */ });

            // auth state
            auth.onAuthStateChanged(function (u) {
                FB.user = u ? { uid: u.uid, email: u.email, anonymous: u.isAnonymous, name: u.displayName || (u.email || '').split('@')[0] } : null;
                if (typeof FB.onAuth === 'function') FB.onAuth(FB.user);
            });

            console.log('[FB] ready — project:', firebaseConfig.projectId);
        } catch (e) {
            FB.error = e.message;
            console.warn('[FB] init failed:', e.message);
        }
    }

    /* ---------- WRITE ---------- */
    function set(coll, obj) {
        if (!FB.ready || !obj || !obj.id) return;
        db.collection(coll).doc(String(obj.id)).set(clean(obj)).catch(function (e) {
            console.warn('[FB] set failed', coll, obj.id, e.message);
        });
    }

    function del(coll, id) {
        if (!FB.ready) return;
        db.collection(coll).doc(String(id)).delete().catch(function () { /* ignore */ });
    }

    function clean(o) {
        // Firestore undefined reject karta hai
        const out = {};
        Object.keys(o).forEach(function (k) {
            if (o[k] !== undefined) out[k] = o[k];
        });
        return out;
    }

    /* ---------- REALTIME SYNC ---------- */
    function start() {
        if (!FB.ready) return;
        const store = EV.load();

        COLLECTIONS.forEach(function (coll) {
            db.collection(coll).onSnapshot(function (snap) {
                // first run: agar Firestore khaali hai to local seed push karo
                if (snap.empty) {
                    const local = store[coll] || [];
                    if (local.length) {
                        local.forEach(function (row) { set(coll, row); });
                    }
                    return;
                }
                const rows = [];
                snap.forEach(function (d) { rows.push(d.data()); });
                // newest first for time-based collections
                if (coll === 'rides' || coll === 'orders') {
                    rows.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
                }
                store[coll] = rows;
                EV.saveLocalOnly();
                if (typeof FB.onChange === 'function') FB.onChange(coll, rows);
            }, function (err) {
                console.warn('[FB] listen failed', coll, err.message);
            });
        });

        // config
        db.collection('config').doc('app').onSnapshot(function (d) {
            if (d.exists) {
                const c = d.data();
                Object.keys(c).forEach(function (k) { if (k !== 'id') store.config[k] = c[k]; });
                EV.saveLocalOnly();
                if (typeof FB.onChange === 'function') FB.onChange('config', store.config);
            } else {
                set('config', Object.assign({ id: 'app' }, store.config));
            }
        }, function () { /* ignore */ });

        // heartbeat
        db.collection('config').doc('app').set({ lastSync: Date.now() }, { merge: true }).catch(function () {});
    }

    /* ---------- AUTH ---------- */
    function signUp(email, pass, name) {
        return auth.createUserWithEmailAndPassword(email, pass).then(function (cred) {
            if (name) return cred.user.updateProfile({ displayName: name }).then(function () { return cred.user; });
            return cred.user;
        });
    }
    function signIn(email, pass) { return auth.signInWithEmailAndPassword(email, pass); }
    function signInGuest() { return auth.signInAnonymously(); }
    function signOutUser() { return auth.signOut(); }
    function resetPassword(email) { return auth.sendPasswordResetEmail(email); }

    /* ---------- PUBLIC ---------- */
    FB.init = init;
    FB.start = start;
    FB.set = set;
    FB.del = del;
    FB.signUp = signUp;
    FB.signIn = signIn;
    FB.signInGuest = signInGuest;
    FB.signOut = signOutUser;
    FB.resetPassword = resetPassword;
    FB.config = firebaseConfig;

    window.FB = FB;

    // auto-init as soon as DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(); if (FB.ready) start(); });
    } else {
        init();
        if (FB.ready) start();
    }
})();
