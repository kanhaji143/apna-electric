/* ============================================================
   APNA ELECTRIC ONE — Auth (Firestore-based, FREE plan)
   Path: public/assets/auth.js
   ------------------------------------------------------------
   Firebase Auth ka naya API billing maangta hai, isliye hum
   Firestore + Web Crypto (SHA-256) se apna login banate hain.
   Ye FREE plan pe chalta hai aur sab devices pe sync karta hai.
   ============================================================ */

(function () {
    'use strict';

    const SESSION_KEY = 'ev_account_v1';
    let mode = 'signin';

    function $(id) { return document.getElementById(id); }

    function toast(msg) {
        const t = $('toast');
        if (!t) { alert(msg); return; }
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(t._t);
        t._t = setTimeout(function () { t.classList.remove('show'); }, 2800);
    }

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

    /* ---------- CRYPTO ---------- */
    function rand(n) {
        const a = new Uint8Array(n);
        (window.crypto || window.msCrypto).getRandomValues(a);
        return Array.from(a).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
    function sha256(str) {
        const enc = new TextEncoder();
        if (!window.crypto || !crypto.subtle) {
            // fallback (weak) — sirf tab jab Web Crypto na ho
            let h = 5381;
            for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
            return Promise.resolve('fb' + h.toString(16));
        }
        return crypto.subtle.digest('SHA-256', enc.encode(str)).then(function (buf) {
            return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
        });
    }
    function hashPass(pass, salt) { return sha256(salt + '::' + pass); }

    /* ---------- SESSION ---------- */
    function account() {
        try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
    }
    function setAccount(a) {
        if (a) localStorage.setItem(SESSION_KEY, JSON.stringify(a));
        else localStorage.removeItem(SESSION_KEY);
        paint();
        if (typeof Auth.onChange === 'function') Auth.onChange(a);
    }

    /* ---------- FIRESTORE ---------- */
    function db() {
        if (!window.FB || !FB.ready) return null;
        return firebase.firestore();
    }
    function emailId(email) { return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '_'); }

    function getUser(email) {
        const d = db();
        if (!d) return Promise.reject(new Error('Firestore available nahi hai'));
        return d.collection('users').doc(emailId(email)).get().then(function (doc) {
            return doc.exists ? doc.data() : null;
        });
    }

    function saveUser(rec) {
        const d = db();
        if (!d) return Promise.reject(new Error('Firestore available nahi hai'));
        return d.collection('users').doc(emailId(rec.email)).set(rec);
    }

    /* ---------- NAV ---------- */
    function injectNav() {
        const nav = document.querySelector('.nav-links');
        if (!nav || $('authBtn')) return;
        const a = document.createElement('a');
        a.id = 'authBtn';
        a.href = '#';
        nav.appendChild(a);
        paint();
    }

    function paint() {
        const btn = $('authBtn');
        if (!btn) return;
        const u = account();
        if (u) {
            btn.innerHTML = '<i class="fas fa-circle-user"></i> ' + esc((u.name || u.email).split(' ')[0]);
            btn.onclick = function (e) { e.preventDefault(); menu(); };
        } else {
            btn.innerHTML = '<i class="fas fa-user"></i> Login';
            btn.onclick = function (e) { e.preventDefault(); open(); };
        }
    }

    /* ---------- MODAL ---------- */
    function open(m) {
        mode = m || 'signin';
        $('modalHost').innerHTML =
            '<div class="modal-overlay active" onclick="Auth.close()"></div>' +
            '<div class="modal-box active" style="max-width:430px">' +
                '<div class="modal-head"><h3><i class="fas fa-bolt" style="color:var(--brand)"></i> ' +
                    (mode === 'signup' ? 'Create Account' : 'Sign In') + '</h3>' +
                '<button class="modal-x" onclick="Auth.close()">&times;</button></div>' +
                '<div class="modal-body">' +
                    '<div style="display:flex;gap:6px;margin-bottom:18px">' + tab('signin', 'Sign In') + tab('signup', 'Sign Up') + '</div>' +
                    (mode === 'signup' ? '<div class="form-group"><label>Your Name</label><input class="form-control" id="auName" placeholder="Krishna Kumar"></div>' : '') +
                    '<div class="form-group"><label>Email</label><input type="email" class="form-control" id="auEmail" placeholder="you@example.com"></div>' +
                    '<div class="form-group"><label>Password</label><input type="password" class="form-control" id="auPass" placeholder="min 6 characters"></div>' +
                    '<div id="auErr" style="display:none;background:#fee2e2;color:#991b1b;padding:10px 12px;border-radius:8px;font-size:12.5px;margin-bottom:12px"></div>' +
                    '<button class="btn btn-primary btn-block" id="auGo" onclick="Auth.go()">' +
                        '<i class="fas fa-' + (mode === 'signup' ? 'user-plus' : 'right-to-bracket') + '"></i> ' +
                        (mode === 'signup' ? 'Create Account' : 'Sign In') + '</button>' +
                    '<button class="btn btn-light btn-block" style="margin-top:8px" onclick="Auth.guest()">' +
                        '<i class="fas fa-user-secret"></i> Continue as Guest</button>' +
                    '<div style="font-size:11.5px;color:var(--muted);text-align:center;margin-top:12px">' +
                        '<i class="fas fa-shield-halved"></i> Password SHA-256 se secure hash hota hai</div>' +
                '</div>' +
            '</div>';
        setTimeout(function () { const e = $('auEmail'); if (e) e.focus(); }, 100);
    }

    function tab(id, label) {
        const on = mode === id;
        return '<button class="btn btn-sm" style="flex:1;' +
            (on ? 'background:var(--dark);color:#fff' : 'background:#fff;color:#475569;border:1.5px solid var(--border)') +
            '" onclick="Auth.open(\'' + id + '\')">' + label + '</button>';
    }

    function close() { $('modalHost').innerHTML = ''; }

    function err(msg) {
        const e = $('auErr');
        if (!e) { toast(msg); return; }
        e.textContent = msg;
        e.style.display = 'block';
    }

    function busy(v, label) {
        const b = $('auGo');
        if (!b) return;
        b.disabled = v;
        b.innerHTML = v ? '<i class="fas fa-spinner fa-spin"></i> Please wait...'
                        : '<i class="fas fa-right-to-bracket"></i> ' + (label || 'Sign In');
    }

    /* ---------- ACTIONS ---------- */
    function go() {
        if (!db()) { err('Firestore load nahi hua — internet check karein'); return; }

        const email = ($('auEmail') ? $('auEmail').value.trim() : '');
        const pass = ($('auPass') ? $('auPass').value : '');
        const name = ($('auName') ? $('auName').value.trim() : '');

        if (!/^\S+@\S+\.\S+$/.test(email)) { err('Sahi email daalein'); return; }
        if (pass.length < 6) { err('Password kam se kam 6 characters'); return; }
        if (mode === 'signup' && !name) { err('Apna naam daalein'); return; }

        busy(true);
        getUser(email).then(function (existing) {
            if (mode === 'signup') {
                if (existing) throw new Error('EXISTS');
                const salt = rand(16);
                return hashPass(pass, salt).then(function (h) {
                    return saveUser({
                        email: email, name: name, salt: salt, passHash: h,
                        createdAt: Date.now(), lastLogin: Date.now()
                    }).then(function () {
                        setAccount({ email: email, name: name, uid: emailId(email) });
                        toast('Account ban gaya! Welcome ' + name);
                        close();
                    });
                });
            }
            // sign in
            if (!existing) throw new Error('NOUSER');
            return hashPass(pass, existing.salt).then(function (h) {
                if (h !== existing.passHash) throw new Error('BADPASS');
                return db().collection('users').doc(emailId(email)).set({ lastLogin: Date.now() }, { merge: true }).then(function () {
                    setAccount({ email: email, name: existing.name || email, uid: emailId(email) });
                    toast('Welcome back, ' + (existing.name || email));
                    close();
                });
            });
        }).catch(function (e) {
            const m = e && e.message;
            if (m === 'EXISTS') err('Ye email pehle se registered hai — Sign In karein');
            else if (m === 'NOUSER') err('Ye email registered nahi hai — Sign Up karein');
            else if (m === 'BADPASS') err('Galat password');
            else err(m || 'Kuch galat ho gaya');
        }).then(function () { busy(false, mode === 'signup' ? 'Create Account' : 'Sign In'); });
    }

    function guest() {
        setAccount({ email: '', name: 'Guest User', uid: 'guest-' + rand(4), guest: true });
        toast('Guest mode — data is device pe rahega');
        close();
    }

    /* ---------- ACCOUNT MENU ---------- */
    function menu() {
        const u = account() || {};
        $('modalHost').innerHTML =
            '<div class="modal-overlay active" onclick="Auth.close()"></div>' +
            '<div class="modal-box active" style="max-width:390px">' +
                '<div class="modal-head"><h3>My Account</h3><button class="modal-x" onclick="Auth.close()">&times;</button></div>' +
                '<div class="modal-body">' +
                    '<div class="driver-row">' +
                        '<div class="avatar">' + esc((u.name || u.email || 'G').charAt(0).toUpperCase()) + '</div>' +
                        '<div style="flex:1"><div style="font-weight:700">' + esc(u.name || 'Guest User') + '</div>' +
                        '<div style="font-size:12.5px;color:var(--muted)">' + esc(u.email || 'Guest session') + '</div></div>' +
                    '</div>' +
                    '<div style="font-size:12px;color:var(--muted);margin-top:12px">' +
                        (u.guest ? 'Guest session — sirf is device pe.' : 'Signed in — aapki rides aur orders sab devices pe sync honge.') +
                    '</div>' +
                '</div>' +
                '<div class="modal-foot">' +
                    '<button class="btn btn-light" onclick="Auth.close()">Close</button>' +
                    '<button class="btn btn-danger" onclick="Auth.signout()"><i class="fas fa-right-from-bracket"></i> Sign Out</button>' +
                '</div>' +
            '</div>';
    }

    function signout() {
        setAccount(null);
        toast('Signed out');
        close();
    }

    window.Auth = {
        open: open, close: close, go: go, guest: guest, signout: signout,
        account: account, onChange: null
    };

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(injectNav, 300);
        if (window.FB) FB.onAuth = function () { paint(); };
    });
})();
