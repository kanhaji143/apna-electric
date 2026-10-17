/* ============================================================
   APNA ELECTRIC ONE — Customer Booking
   Path: public/assets/customer.js
   ============================================================ */

(function () {
    'use strict';

    let selVehicle = 'bike';
    let activeId = null;

    const $ = function (id) { return document.getElementById(id); };

    function toast(msg) {
        const t = $('toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(t._t);
        t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
    }

    /* ---------- INIT ---------- */
    function init() {
        const s = EV.load();
        // locations
        const opts = EV.AREAS.map(function (a) { return '<option value="' + EV.esc(a) + '">' + EV.esc(a) + '</option>'; }).join('');
        $('pickup').innerHTML = opts;
        $('drop').innerHTML = opts;
        $('pickup').value = EV.AREAS[0];
        $('drop').value = EV.AREAS[3];

        // saved user
        const u = EV.getUser();
        if (u && u.phone) $('phone').value = u.phone;

        // vehicles
        $('vehGrid').innerHTML = EV.VEHICLES.map(function (v) {
            return '<div class="veh' + (v.id === selVehicle ? ' sel' : '') + '" data-v="' + v.id + '" onclick="App.pick(\'' + v.id + '\')">' +
                '<i class="fas ' + v.icon + '" style="color:' + v.color + '"></i>' +
                '<div class="vn">' + v.name + '</div>' +
                '<div class="vp">' + v.cap + ' seat</div>' +
                '<div class="ve">' + v.eta + ' away</div>' +
            '</div>';
        }).join('');

        ['pickup', 'drop'].forEach(function (id) { $(id).addEventListener('change', calc); });
        $('payment').addEventListener('change', calc);

        // online drivers badge
        const online = s.drivers.filter(function (d) { return d.online; }).length;
        $('onlineBadge').textContent = online + ' drivers online';

        calc();
        renderMyRides();

        // resume active ride
        const mine = s.rides.filter(function (r) { return ['requested', 'accepted', 'arriving', 'ongoing'].indexOf(r.status) > -1; });
        if (mine.length) { activeId = mine[0].id; renderActive(); }

        // Firestore live updates
        if (window.FB) FB.onChange = function () { renderActive(); renderMyRides(); };

        // live poll (driver accept reflect kare)
        setInterval(function () { renderActive(); renderMyRides(); }, 2000);
    }

    /* ---------- VEHICLE ---------- */
    function pick(id) {
        selVehicle = id;
        document.querySelectorAll('.veh').forEach(function (el) {
            el.classList.toggle('sel', el.getAttribute('data-v') === id);
        });
        calc();
    }

    /* ---------- FARE ---------- */
    function calc() {
        const p = $('pickup').value, d = $('drop').value;
        const km = EV.distance(p, d);
        const f = EV.fare(selVehicle, km);
        $('fKm').textContent = km + ' km';
        $('fMin').textContent = f.mins + ' min';
        $('fBase').textContent = EV.money(f.base);
        $('fTotal').textContent = EV.money(f.total);
        $('fareBox').style.display = 'block';
        return { km: km, f: f };
    }

    /* ---------- BOOK ---------- */
    function book() {
        const p = $('pickup').value, d = $('drop').value;
        const phone = $('phone').value.trim();
        const payment = $('payment').value;

        if (p === d) { toast('Pickup aur drop alag hone chahiye'); return; }
        if (!/^\d{10}$/.test(phone)) { toast('10 digit mobile number daalein'); return; }

        if (payment === 'Wallet' && EV.walletBalance(phone) < 1) {
            toast('Wallet khaali hai — pehle recharge karein');
            return;
        }

        const km = EV.distance(p, d);
        const u = EV.getUser();
        const customer = { name: (u && u.name) || 'Guest', phone: phone };
        EV.setUser(customer);

        const f = EV.fare(selVehicle, km);

        function done(paymentLabel) {
            const ride = EV.createRide({ customer: customer, pickup: p, drop: d, vehicle: selVehicle, km: km, payment: paymentLabel });
            activeId = ride.id;
            toast('Ride booked! Driver dhundh rahe hain...');
            renderActive();
            renderMyRides();
            document.getElementById('activeRide').scrollIntoView({ behavior: 'smooth' });
        }

        if (payment === 'Razorpay' && window.Pay && Pay.available()) {
            toast('Payment window khul raha hai...');
            Pay.start({
                amount: f.total,
                description: 'Ride: ' + p + ' → ' + d,
                name: customer.name,
                phone: phone,
                notes: { type: 'ride', vehicle: selVehicle, km: km }
            }).then(function (res) {
                done('Razorpay (' + (res.razorpay_payment_id || 'paid') + ')');
            }).catch(function (e) {
                if (String(e.message) !== 'cancelled') toast('Payment fail: ' + e.message);
                else toast('Payment cancel kiya');
            });
            return;
        }

        if (payment === 'Razorpay') {
            toast('Razorpay key set nahi hai — Admin → Settings mein daalein');
            return;
        }

        done(payment);
    }

    /* ---------- ACTIVE RIDE ---------- */
    const STEPS = ['requested', 'accepted', 'arriving', 'ongoing', 'completed'];
    const LABEL = { requested: 'Searching', accepted: 'Driver Assigned', arriving: 'Arriving', ongoing: 'On Trip', completed: 'Completed', cancelled: 'Cancelled' };

    function renderActive() {
        if (!activeId) return;
        const r = EV.getRide(activeId);
        const box = $('activeRide');
        if (!r) { box.style.display = 'none'; return; }

        if (r.status === 'completed' || r.status === 'cancelled') {
            // keep visible for a moment then hide
            if (r._closed) { box.style.display = 'none'; return; }
            r._closed = true;
        }
        box.style.display = 'block';
        $('arStatus').textContent = LABEL[r.status] || r.status;

        const idx = STEPS.indexOf(r.status);
        const bars = STEPS.map(function (s, i) {
            return '<div class="st' + (i <= idx ? ' done' : '') + '"></div>';
        }).join('');

        const v = EV.vehicle(r.vehicle);

        let html = '<div class="timeline">' + bars + '</div>';

        html += '<div class="route">' +
            '<div class="pt"><div class="lbl">Pickup</div>' + EV.esc(r.pickup) + '</div>' +
            '<div class="pt drop"><div class="lbl">Drop</div>' + EV.esc(r.drop) + '</div>' +
        '</div>';

        html += '<div id="rideMap" style="height:230px;border-radius:12px;margin:12px 0;background:#e2e8f0;z-index:1"></div>';

        html += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin:14px 0">' +
            '<span class="badge blue"><i class="fas ' + v.icon + '"></i> ' + v.name + '</span>' +
            '<span class="badge grey">' + r.km + ' km</span>' +
            '<span class="badge green">' + EV.money(r.fare) + '</span>' +
            '<span class="badge grey">' + EV.esc(r.payment) + '</span>' +
        '</div>';

        if (r.driverId) {
            const d = EV.load().drivers.filter(function (x) { return x.id === r.driverId; })[0] || {};
            html += '<div class="driver-row">' +
                '<div class="avatar">' + EV.initials(r.driverName) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="font-weight:700">' + EV.esc(r.driverName) + ' <span class="badge green">' + (d.rating || 5) + '★</span></div>' +
                    '<div style="font-size:12.5px;color:var(--muted)">' + EV.esc(r.plate) + ' · ' + EV.esc(d.phone || '') + '</div>' +
                '</div>' +
                '<a class="btn btn-light btn-sm" href="tel:' + EV.esc(d.phone || '') + '"><i class="fas fa-phone"></i></a>' +
            '</div>';
        }

        if (r.status === 'accepted' || r.status === 'arriving') {
            html += '<div class="otp-box"><div class="lbl">Share this OTP with driver</div><div class="code">' + r.otp + '</div></div>';
        }
        if (r.status === 'ongoing') {
            html += '<div class="otp-box" style="background:var(--brand);color:#052e1c"><div class="lbl" style="color:#065f46">Trip in progress</div><div style="font-size:20px;font-weight:800">Enjoy your electric ride ⚡</div></div>';
        }
        if (r.status === 'completed') {
            html += '<div class="otp-box" style="background:var(--brand)"><div class="lbl" style="color:#065f46">Ride Completed</div>' +
                    '<div style="font-size:22px;font-weight:800;color:#052e1c">' + EV.money(r.fare) + ' paid</div></div>';
            html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:10px">' +
                [1,2,3,4,5].map(function (n) {
                    return '<button class="btn btn-light btn-sm" onclick="App.rate(' + n + ')">' + n + '★</button>';
                }).join('') + '</div>';
        }

        if (['requested','accepted','arriving','ongoing'].indexOf(r.status) > -1) {
            html += '<button class="btn btn-danger btn-block" style="margin-top:14px" onclick="App.cancel()">' +
                    '<i class="fas fa-xmark"></i> Cancel Ride</button>';
        } else {
            html += '<button class="btn btn-light btn-block" style="margin-top:14px" onclick="App.closeActive()">New Booking</button>';
        }

        $('arBody').innerHTML = html;

        if (r.status !== 'completed' && r.status !== 'cancelled') renderMap(r);
    }

    /* ---------- MAP (Leaflet, free — no API key) ---------- */
    let map = null, driverMarker = null, line = null;

    function dotIcon(color, label) {
        return L.divIcon({
            className: '',
            html: '<div style="width:18px;height:18px;border-radius:50%;background:' + color + ';border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });
    }

    function renderMap(r) {
        const el = document.getElementById('rideMap');
        if (!el || typeof L === 'undefined') return;

        const p = EV.coords(r.pickup), d = EV.coords(r.drop);

        if (!map || !document.body.contains(map.getContainer())) {
            if (map) { try { map.remove(); } catch (e) {} }
            map = L.map('rideMap', { zoomControl: true, attributionControl: false }).setView(p, 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
            L.marker(p, { icon: dotIcon('#10b981') }).addTo(map).bindPopup('Pickup: ' + EV.esc(r.pickup));
            L.marker(d, { icon: dotIcon('#ef4444') }).addTo(map).bindPopup('Drop: ' + EV.esc(r.drop));
            line = L.polyline([p, d], { color: '#10b981', weight: 4, dashArray: '8 8' }).addTo(map);
            driverMarker = L.marker(p, { icon: dotIcon('#0f172a') }).addTo(map).bindPopup('Your driver');
            map.fitBounds([p, d], { padding: [34, 34] });
        } else {
            driverMarker.setLatLng(EV.midPoint(r.pickup, r.drop, progress(r)));
        }

        setTimeout(function () { if (map) map.invalidateSize(); }, 120);
    }

    function progress(r) {
        if (r.status === 'requested') return 0;
        if (r.status === 'accepted') return 0.18;
        if (r.status === 'arriving') return 0.32;
        if (r.status === 'ongoing') return 0.7;
        return 1;
    }

    function destroyMap() {
        if (map) { try { map.remove(); } catch (e) {} }
        map = null; driverMarker = null; line = null;
    }

    function cancel() {
        if (!activeId) return;
        EV.cancelRide(activeId);
        toast('Ride cancelled');
        renderActive(); renderMyRides();
    }

    function closeActive() {
        activeId = null;
        destroyMap();
        $('activeRide').style.display = 'none';
    }

    function rate(n) {
        if (!activeId) return;
        EV.updateRide(activeId, { rating: n });
        const r = EV.getRide(activeId);
        if (r && r.driverId) {
            const d = EV.load().drivers.filter(function (x) { return x.id === r.driverId; })[0];
            if (d) { d.rating = Math.round(((d.rating * 4 + n) / 5) * 10) / 10; EV.save(); }
        }
        toast('Thanks for rating ' + n + '★');
        closeActive();
        renderMyRides();
    }

    /* ---------- MY RIDES ---------- */
    function renderMyRides() {
        const u = EV.getUser();
        const tbody = $('myRidesBody');
        if (!tbody) return;
        const all = EV.load().rides;
        const mine = u && u.phone ? all.filter(function (r) { return r.customer && r.customer.phone === u.phone; }) : all;
        if (!mine.length) {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty"><i class="fas fa-route"></i>Abhi koi ride nahi hai</div></td></tr>';
            return;
        }
        tbody.innerHTML = mine.slice(0, 10).map(function (r) {
            const v = EV.vehicle(r.vehicle);
            return '<tr>' +
                '<td><strong>' + r.id + '</strong><div style="font-size:11px;color:var(--muted)">' + EV.esc(r.date) + ' ' + EV.esc(r.time) + '</div></td>' +
                '<td>' + EV.esc(r.pickup) + ' → ' + EV.esc(r.drop) + '</td>' +
                '<td><i class="fas ' + v.icon + '" style="color:' + v.color + '"></i> ' + v.name + '</td>' +
                '<td><strong>' + EV.money(r.fare) + '</strong></td>' +
                '<td>' + statusBadge(r.status) + '</td>' +
            '</tr>';
        }).join('');
    }

    function statusBadge(st) {
        const map = { requested: 'orange', accepted: 'blue', arriving: 'blue', ongoing: 'green', completed: 'green', cancelled: 'red' };
        const lbl = { requested: 'Searching', accepted: 'Assigned', arriving: 'Arriving', ongoing: 'On Trip', completed: 'Completed', cancelled: 'Cancelled' };
        return '<span class="badge ' + (map[st] || 'grey') + '">' + (lbl[st] || st) + '</span>';
    }

    window.App = { pick: pick, book: book, cancel: cancel, closeActive: closeActive, rate: rate };

    document.addEventListener('DOMContentLoaded', init);
})();
