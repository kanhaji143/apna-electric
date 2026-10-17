/* ============================================================
   APNA ELECTRIC ONE — Driver Panel
   Path: public/assets/driver.js
   ============================================================ */

(function () {
    'use strict';

    const DRV_KEY = 'ev_driver_v1';
    let me = null;
    const $ = function (id) { return document.getElementById(id); };

    function toast(msg) {
        const t = $('toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(t._t);
        t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
    }

    function myDriver() {
        return EV.load().drivers.filter(function (d) { return d.id === me; })[0];
    }

    /* ---------- LOGIN ---------- */
    function login() {
        const id = $('drvId').value.trim().toUpperCase();
        const pin = $('drvPin').value.trim();
        const d = EV.load().drivers.filter(function (x) { return x.id === id; })[0];
        if (!d) { toast('Driver ID nahi mila'); return; }
        if (pin !== d.pin) { toast('Galat PIN'); return; }
        me = id;
        localStorage.setItem(DRV_KEY, id);
        toast('Welcome ' + d.name);
        showPanel();
    }

    function logout() {
        localStorage.removeItem(DRV_KEY);
        me = null;
        $('panelView').style.display = 'none';
        $('loginView').style.display = 'block';
    }

    function showPanel() {
        $('loginView').style.display = 'none';
        $('panelView').style.display = 'block';
        const d = myDriver();
        $('onlineSw').checked = !!d.online;
        render();
    }

    /* ---------- ONLINE ---------- */
    function toggleOnline(v) {
        const d = myDriver();
        d.online = v;
        d.status = v ? (d.status === 'busy' ? 'busy' : 'available') : 'offline';
        EV.save();
        toast(v ? 'You are ONLINE' : 'You are OFFLINE');
        render();
    }

    /* ---------- RENDER ---------- */
    function render() {
        const d = myDriver();
        if (!d) return;
        const s = EV.load();

        $('otState').textContent = d.online ? 'Online' : 'Offline';
        $('otState').style.color = d.online ? 'var(--brand)' : '#94a3b8';

        $('sTrips').textContent = d.trips || 0;
        $('sEarn').textContent = EV.money(d.earnings || 0);

        const v = EV.vehicle(d.vehicle);
        $('profileBox').innerHTML =
            '<div class="driver-row">' +
                '<div class="avatar">' + EV.initials(d.name) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="font-weight:700;font-size:15px">' + EV.esc(d.name) + '</div>' +
                    '<div style="font-size:12.5px;color:var(--muted)">' + EV.esc(d.id) + ' · ' + EV.esc(d.phone) + '</div>' +
                '</div>' +
                '<span class="badge green">' + d.rating + '★</span>' +
            '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
                '<span class="badge blue"><i class="fas ' + v.icon + '"></i> ' + v.name + '</span>' +
                '<span class="badge grey">' + EV.esc(d.plate) + '</span>' +
                '<span class="badge grey">' + EV.esc(d.area) + '</span>' +
            '</div>';

        // current active trip
        const active = s.rides.filter(function (r) {
            return r.driverId === d.id && ['accepted', 'arriving', 'ongoing'].indexOf(r.status) > -1;
        })[0];

        if (active) { $('requestArea').innerHTML = tripCard(active); }
        else if (!d.online) {
            $('requestArea').innerHTML = '<div class="card"><div class="card-body"><div class="empty"><i class="fas fa-power-off"></i>Online jaayein ride requests ke liye</div></div></div>';
        } else {
            const avail = s.rides.filter(function (r) {
                return r.status === 'requested' && r.vehicle === d.vehicle;
            });
            if (avail.length) $('requestArea').innerHTML = avail.slice(0, 3).map(reqCard).join('');
            else $('requestArea').innerHTML = '<div class="card"><div class="card-body"><div class="empty"><i class="fas fa-satellite-dish"></i>Koi ride request nahi — intezaar karein...</div></div></div>';
        }

        // trips
        const mine = s.rides.filter(function (r) { return r.driverId === d.id; }).slice(0, 12);
        $('drvTrips').innerHTML = mine.length ? mine.map(function (r) {
            return '<tr>' +
                '<td><strong>' + r.id + '</strong><div style="font-size:11px;color:var(--muted)">' + EV.esc(r.time) + '</div></td>' +
                '<td>' + EV.esc(r.pickup) + ' → ' + EV.esc(r.drop) + '</td>' +
                '<td><strong>' + EV.money(r.fare) + '</strong></td>' +
                '<td>' + badge(r.status) + '</td>' +
            '</tr>';
        }).join('') : '<tr><td colspan="4"><div class="empty"><i class="fas fa-route"></i>Abhi koi trip nahi</div></td></tr>';
    }

    function badge(st) {
        const map = { requested: 'orange', accepted: 'blue', arriving: 'blue', ongoing: 'green', completed: 'green', cancelled: 'red' };
        const lbl = { requested: 'Searching', accepted: 'Assigned', arriving: 'Arriving', ongoing: 'On Trip', completed: 'Completed', cancelled: 'Cancelled' };
        return '<span class="badge ' + (map[st] || 'grey') + '">' + (lbl[st] || st) + '</span>';
    }

    function reqCard(r) {
        const v = EV.vehicle(r.vehicle);
        const payout = Math.round(r.fare * (1 - EV.load().config.commission / 100));
        return '<div class="ride-request" style="margin-bottom:14px">' +
            '<div class="rr-head"><span><i class="fas fa-bolt"></i> NEW RIDE REQUEST</span><span>' + r.km + ' km</span></div>' +
            '<div class="card-body">' +
                '<div class="route">' +
                    '<div class="pt"><div class="lbl">Pickup</div>' + EV.esc(r.pickup) + '</div>' +
                    '<div class="pt drop"><div class="lbl">Drop</div>' + EV.esc(r.drop) + '</div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">' +
                    '<span class="badge blue"><i class="fas ' + v.icon + '"></i> ' + v.name + '</span>' +
                    '<span class="badge grey">' + EV.esc(r.payment) + '</span>' +
                    '<span class="badge green">You get ' + EV.money(payout) + '</span>' +
                '</div>' +
                '<div style="display:flex;gap:10px">' +
                    '<button class="btn btn-primary" style="flex:1" onclick="Drv.accept(\'' + r.id + '\')"><i class="fas fa-check"></i> Accept</button>' +
                    '<button class="btn btn-light" onclick="Drv.skip(\'' + r.id + '\')"><i class="fas fa-xmark"></i></button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function tripCard(r) {
        const payout = Math.round(r.fare * (1 - EV.load().config.commission / 100));
        let actions = '';
        if (r.status === 'accepted') {
            actions = '<button class="btn btn-info btn-block" onclick="Drv.setStatus(\'' + r.id + '\',\'arriving\')"><i class="fas fa-location-arrow"></i> Reached Pickup</button>';
        } else if (r.status === 'arriving') {
            actions = '<button class="btn btn-primary btn-block" onclick="Drv.startTrip(\'' + r.id + '\')"><i class="fas fa-play"></i> Start Trip (Verify OTP)</button>';
        } else if (r.status === 'ongoing') {
            actions = '<button class="btn btn-primary btn-block" onclick="Drv.setStatus(\'' + r.id + '\',\'completed\')"><i class="fas fa-flag-checkered"></i> Complete Trip</button>';
        }

        return '<div class="ride-request" style="margin-bottom:14px">' +
            '<div class="rr-head"><span><i class="fas fa-route"></i> CURRENT TRIP</span><span>' + EV.esc(r.id) + '</span></div>' +
            '<div class="card-body">' +
                '<div class="route">' +
                    '<div class="pt"><div class="lbl">Pickup</div>' + EV.esc(r.pickup) + '</div>' +
                    '<div class="pt drop"><div class="lbl">Drop</div>' + EV.esc(r.drop) + '</div>' +
                '</div>' +
                '<div class="driver-row" style="margin:12px 0">' +
                    '<div class="avatar dark">' + EV.initials(r.customer.name) + '</div>' +
                    '<div style="flex:1">' +
                        '<div style="font-weight:700">' + EV.esc(r.customer.name) + '</div>' +
                        '<div style="font-size:12.5px;color:var(--muted)">' + EV.esc(r.customer.phone) + '</div>' +
                    '</div>' +
                    '<a class="btn btn-light btn-sm" href="tel:' + EV.esc(r.customer.phone) + '"><i class="fas fa-phone"></i></a>' +
                '</div>' +
                (r.status === 'accepted' || r.status === 'arriving'
                    ? '<div class="otp-box"><div class="lbl">Customer OTP — verify karein</div><div class="code">' + r.otp + '</div></div>'
                    : '') +
                '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
                    '<span class="badge green">Fare ' + EV.money(r.fare) + '</span>' +
                    '<span class="badge blue">You get ' + EV.money(payout) + '</span>' +
                    '<span class="badge grey">' + r.km + ' km</span>' +
                '</div>' +
                actions +
            '</div>' +
        '</div>';
    }

    /* ---------- ACTIONS ---------- */
    function accept(rideId) {
        EV.assignDriver(rideId, me);
        toast('Ride accepted!');
        render();
    }

    function skip(rideId) {
        // hide locally for this session
        const el = event && event.target ? event.target.closest('.ride-request') : null;
        if (el) el.remove();
        toast('Skipped');
    }

    function setStatus(rideId, st) {
        EV.setStatus(rideId, st);
        render();
    }

    function startTrip(rideId) {
        const r = EV.getRide(rideId);
        const entered = prompt('Customer se OTP lein (demo: ' + r.otp + ')', '');
        if (entered === null) return;
        if (entered.trim() !== r.otp) { toast('Galat OTP'); return; }
        EV.setStatus(rideId, 'ongoing');
        toast('Trip started!');
        render();
    }

    window.Drv = { login: login, logout: logout, toggleOnline: toggleOnline, accept: accept, skip: skip, setStatus: setStatus, startTrip: startTrip };

    document.addEventListener('DOMContentLoaded', function () {
        EV.load();
        const saved = localStorage.getItem(DRV_KEY);
        if (saved && EV.load().drivers.filter(function (d) { return d.id === saved; }).length) {
            me = saved;
            showPanel();
        }
        setInterval(function () { if (me) render(); }, 2500);
        if (window.FB) FB.onChange = function () { if (me) render(); };
    });
})();
