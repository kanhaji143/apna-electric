/* ============================================================
   APNA ELECTRIC ONE — Shared Data Layer
   Path: public/assets/data.js
   Storage: localStorage (key: ev_store_v1)
   ============================================================ */

(function () {
    'use strict';

    const STORE_KEY = 'ev_store_v1';
    const USER_KEY  = 'ev_user_v1';

    /* ---------- VEHICLES ---------- */
    const VEHICLES = [
        { id: 'bike',     name: 'E-Bike',      icon: 'fa-motorcycle',   base: 15, perKm: 7,  perMin: 0.8, cap: 1, color: '#10b981', eta: '2 min' },
        { id: 'auto',     name: 'E-Auto',      icon: 'fa-car-side',     base: 25, perKm: 11, perMin: 1.2, cap: 3, color: '#f59e0b', eta: '4 min' },
        { id: 'rickshaw', name: 'E-Rickshaw',  icon: 'fa-truck-pickup', base: 20, perKm: 9,  perMin: 1.0, cap: 4, color: '#8b5cf6', eta: '5 min' },
        { id: 'cab',      name: 'E-Cab',       icon: 'fa-car',          base: 50, perKm: 16, perMin: 2.0, cap: 4, color: '#3b82f6', eta: '6 min' }
    ];

    /* ---------- AREAS (Amethi region) ---------- */
    const AREAS = [
        'Amethi Railway Station', 'Amethi Bus Stand', 'Amethi City', 'Gauriganj',
        'Jagdishpur', 'Musafirkhana', 'Bhadar', 'Ratapur', 'Ngardeeh',
        'Durgapur Road', 'Munshiganj', 'Shahgarh', 'Pure Obhariya', 'Ghoraha'
    ];

    /* ---------- SEED DRIVERS ---------- */
    const SEED_DRIVERS = [
        { id: 'DRV001', name: 'Ramesh Yadav',   phone: '9876543210', vehicle: 'bike',     plate: 'UP 36 AB 1234', rating: 4.8, status: 'available', area: 'Amethi City',            pin: '1234', trips: 128, earnings: 8420, online: true },
        { id: 'DRV002', name: 'Suresh Verma',   phone: '9825011223', vehicle: 'auto',     plate: 'UP 36 CD 5678', rating: 4.6, status: 'available', area: 'Amethi Bus Stand',       pin: '1234', trips: 96,  earnings: 11250, online: true },
        { id: 'DRV003', name: 'Amit Kumar',     phone: '9988766554', vehicle: 'rickshaw', plate: 'UP 36 EF 9012', rating: 4.7, status: 'available', area: 'Gauriganj',              pin: '1234', trips: 154, earnings: 9860, online: true },
        { id: 'DRV004', name: 'Vikram Singh',   phone: '9004533221', vehicle: 'cab',      plate: 'UP 36 GH 3456', rating: 4.9, status: 'available', area: 'Amethi Railway Station', pin: '1234', trips: 210, earnings: 28400, online: true },
        { id: 'DRV005', name: 'Deepak Nair',    phone: '9765412098', vehicle: 'bike',     plate: 'UP 36 IJ 7890', rating: 4.5, status: 'offline',   area: 'Jagdishpur',             pin: '1234', trips: 62,  earnings: 4180, online: false },
        { id: 'DRV006', name: 'Imran Khan',     phone: '9345678901', vehicle: 'auto',     plate: 'UP 36 KL 2345', rating: 4.4, status: 'offline',   area: 'Musafirkhana',           pin: '1234', trips: 45,  earnings: 5320, online: false },
        { id: 'DRV007', name: 'Kiran Reddy',    phone: '9456789012', vehicle: 'cab',      plate: 'UP 36 MN 6789', rating: 4.8, status: 'offline',   area: 'Amethi City',            pin: '1234', trips: 178, earnings: 22150, online: false },
        { id: 'DRV008', name: 'Nilesh Mehta',   phone: '9567890123', vehicle: 'rickshaw', plate: 'UP 36 OP 0123', rating: 4.3, status: 'offline',   area: 'Bhadar',                 pin: '1234', trips: 33,  earnings: 2970, online: false }
    ];

    /* ---------- PRODUCTS (EV Showroom / Sale) ---------- */
    const CATEGORIES = [
        { id: 'all',        name: 'All Products',   icon: 'fa-th-large' },
        { id: 'scooter',    name: 'E-Scooters',     icon: 'fa-motorcycle' },
        { id: 'bike',       name: 'E-Bikes',        icon: 'fa-bicycle' },
        { id: 'rickshaw',   name: 'E-Rickshaw',     icon: 'fa-truck-pickup' },
        { id: 'accessory',  name: 'Accessories',    icon: 'fa-helmet-safety' },
        { id: 'spare',      name: 'Spare Parts',    icon: 'fa-gears' }
    ];

    const SEED_PRODUCTS = [
        { id: 'PRD001', name: 'Apna Electric S1 Pro Scooter', category: 'scooter', price: 79999, mrp: 94999, icon: 'fa-motorcycle', color: '#10b981', badge: 'bestseller', stock: 12,
          specs: { Range: '120 km', Speed: '85 km/h', Battery: '3.0 kWh', Charge: '4.5 hrs' } },
        { id: 'PRD002', name: 'Apna Electric S1 Lite Scooter', category: 'scooter', price: 59999, mrp: 72999, icon: 'fa-motorcycle', color: '#0ea5e9', badge: 'new', stock: 18,
          specs: { Range: '95 km', Speed: '70 km/h', Battery: '2.4 kWh', Charge: '4 hrs' } },
        { id: 'PRD003', name: 'Apna Electric Maxi Scooter', category: 'scooter', price: 109999, mrp: 129999, icon: 'fa-motorcycle', color: '#8b5cf6', badge: 'premium', stock: 6,
          specs: { Range: '170 km', Speed: '95 km/h', Battery: '4.2 kWh', Charge: '5 hrs' } },
        { id: 'PRD004', name: 'Apna Electric City Bike', category: 'bike', price: 44999, mrp: 54999, icon: 'fa-bicycle', color: '#f59e0b', badge: 'bestseller', stock: 22,
          specs: { Range: '80 km', Speed: '45 km/h', Battery: '1.8 kWh', Charge: '3.5 hrs' } },
        { id: 'PRD005', name: 'Apna Electric Mountain Bike', category: 'bike', price: 64999, mrp: 79999, icon: 'fa-bicycle', color: '#ef4444', badge: 'new', stock: 9,
          specs: { Range: '110 km', Speed: '50 km/h', Battery: '2.6 kWh', Charge: '4 hrs' } },
        { id: 'PRD006', name: 'Apna Electric E-Rickshaw Deluxe', category: 'rickshaw', price: 139999, mrp: 165000, icon: 'fa-truck-pickup', color: '#8b5cf6', badge: 'premium', stock: 5,
          specs: { Range: '130 km', Speed: '40 km/h', Seats: '4+1', Charge: '6 hrs' } },
        { id: 'PRD007', name: 'EV Smart Helmet (ISI)', category: 'accessory', price: 2499, mrp: 3999, icon: 'fa-helmet-safety', color: '#10b981', badge: 'bestseller', stock: 64,
          specs: { Type: 'Full Face', Size: 'M / L / XL', Safety: 'ISI Marked' } },
        { id: 'PRD008', name: 'Fast Charger 3.3 kW', category: 'accessory', price: 4999, mrp: 6999, icon: 'fa-plug-circle-bolt', color: '#f59e0b', badge: 'none', stock: 30,
          specs: { Power: '3.3 kW', Input: '230V AC', Time: '3-4 hrs' } },
        { id: 'PRD009', name: 'EV Battery Pack 60V 30Ah', category: 'spare', price: 18999, mrp: 24999, icon: 'fa-car-battery', color: '#3b82f6', badge: 'none', stock: 14,
          specs: { Voltage: '60V', Capacity: '30Ah', Warranty: '2 Years' } },
        { id: 'PRD010', name: 'Tubeless EV Tyre (Pair)', category: 'spare', price: 3299, mrp: 4499, icon: 'fa-circle-dot', color: '#64748b', badge: 'none', stock: 40,
          specs: { Size: '90/90-12', Type: 'Tubeless', Grip: 'All-Weather' } }
    ];

    /* ---------- AREA COORDINATES (Amethi region, for map) ---------- */
    const AREA_COORDS = {
        'Amethi Railway Station': [26.1530, 81.8050],
        'Amethi Bus Stand':       [26.1605, 81.8115],
        'Amethi City':            [26.1570, 81.8090],
        'Gauriganj':              [26.2205, 81.6905],
        'Jagdishpur':             [26.4500, 81.5300],
        'Musafirkhana':           [26.3700, 81.8000],
        'Bhadar':                 [26.1205, 81.8605],
        'Ratapur':                [26.1400, 81.8300],
        'Ngardeeh':               [26.1705, 81.8405],
        'Durgapur Road':          [26.1005, 81.7905],
        'Munshiganj':             [26.1900, 81.7505],
        'Shahgarh':               [26.0805, 81.8705],
        'Pure Obhariya':          [26.1300, 81.8005],
        'Ghoraha':                [26.1105, 81.8105]
    };

    function coords(area) {
        return AREA_COORDS[area] || [26.1570, 81.8090];
    }

    /* Deterministic mid-point (driver simulation) */
    function midPoint(a, b, t) {
        const p = coords(a), q = coords(b);
        t = t == null ? 0.5 : t;
        return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    }

    /* ---------- STORE ---------- */
    let store = null;

    function seed() {
        return {
            rides: [],
            orders: [],
            products: JSON.parse(JSON.stringify(SEED_PRODUCTS)),
            drivers: JSON.parse(JSON.stringify(SEED_DRIVERS)),
            customers: [],
            wallet: {},
            config: {
                appName: 'Apna Electric One',
                currency: '₹',
                commission: 20,          // % platform commission
                surge: 1.0,
                cancelFee: 10
            }
        };
    }

    function load() {
        if (store) return store;
        try {
            const raw = localStorage.getItem(STORE_KEY);
            store = raw ? JSON.parse(raw) : seed();
        } catch (e) { store = seed(); }
        if (!store.rides) store.rides = [];
        if (!store.orders) store.orders = [];
        if (!store.products || !store.products.length) store.products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
        if (!store.drivers || !store.drivers.length) store.drivers = JSON.parse(JSON.stringify(SEED_DRIVERS));
        if (!store.customers) store.customers = [];
        if (!store.wallet) store.wallet = {};
        if (!store.config) store.config = seed().config;
        return store;
    }

    function saveLocalOnly() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(load())); } catch (e) { /* full */ }
    }

    /* Firestore sync helpers */
    function syncPush(coll, obj) {
        if (window.FB && window.FB.ready) { try { window.FB.set(coll, obj); } catch (e) { /* ignore */ } }
    }
    function syncDel(coll, id) {
        if (window.FB && window.FB.ready) { try { window.FB.del(coll, id); } catch (e) { /* ignore */ } }
    }

    function save() { saveLocalOnly(); }

    function reset() {
        localStorage.removeItem(STORE_KEY);
        store = null;
        load(); save();
    }

    /* ---------- HELPERS ---------- */
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
        });
    }
    function num(v) { const n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; }
    function money(n) { return '₹' + num(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
    function uid(prefix) { return (prefix || 'ID') + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 900 + 100); }
    function nowTime() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
    function nowDate() { return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    function vehicle(id) { return VEHICLES.filter(function (v) { return v.id === id; })[0] || VEHICLES[0]; }
    function initials(n) { return (n || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ''; }).join('').toUpperCase(); }

    /* Deterministic pseudo-distance between two areas (2.0 - 18.9 km) */
    function distance(a, b) {
        if (!a || !b) return 5;
        if (a === b) return 1.5;
        const key = [a, b].sort().join('|');
        let h = 0;
        for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000;
        return Math.round((2 + (h % 170) / 10) * 10) / 10;
    }

    function fare(vehicleId, km) {
        const v = vehicle(vehicleId);
        const cfg = load().config;
        const mins = Math.max(3, Math.round(km * 3));
        const raw = v.base + v.perKm * km + v.perMin * mins;
        return { total: Math.round(raw * cfg.surge), base: v.base, km: km, mins: mins, perKm: v.perKm };
    }

    /* ---------- RIDES ---------- */
    const FLOW = ['requested', 'accepted', 'arriving', 'ongoing', 'completed'];

    function createRide(data) {
        const s = load();
        const f = fare(data.vehicle, data.km);
        const ride = {
            id: uid('R'),
            otp: String(Math.floor(1000 + Math.random() * 9000)),
            customer: data.customer,        // { name, phone }
            pickup: data.pickup,
            drop: data.drop,
            vehicle: data.vehicle,
            km: data.km,
            fare: f.total,
            mins: f.mins,
            payment: data.payment || 'Cash',
            status: 'requested',
            driverId: null,
            driverName: '',
            plate: '',
            rating: 0,
            createdAt: Date.now(),
            date: nowDate(),
            time: nowTime(),
            timeline: [{ status: 'requested', at: nowTime() }]
        };
        s.rides.unshift(ride);
        save();
        syncPush('rides', ride);
        return ride;
    }

    function getRide(id) { return load().rides.filter(function (r) { return r.id === id; })[0]; }

    function updateRide(id, patch) {
        const r = getRide(id);
        if (!r) return null;
        Object.keys(patch).forEach(function (k) { r[k] = patch[k]; });
        save();
        syncPush('rides', r);
        return r;
    }

    function setStatus(id, status) {
        const r = getRide(id);
        if (!r) return null;
        r.status = status;
        r.timeline.push({ status: status, at: nowTime() });
        if (status === 'completed') {
            const drv = load().drivers.filter(function (d) { return d.id === r.driverId; })[0];
            if (drv) {
                drv.trips = (drv.trips || 0) + 1;
                drv.earnings = (drv.earnings || 0) + Math.round(r.fare * (1 - load().config.commission / 100));
                drv.status = drv.online ? 'available' : 'offline';
            }
            if (r.payment === 'Wallet') {
                const w = load().wallet;
                const k = r.customer.phone;
                w[k] = Math.max(0, (w[k] || 0) - r.fare);
            }
        }
        save();
        syncPush('rides', r);
        if (r.driverId) syncPush('drivers', load().drivers.filter(function (d) { return d.id === r.driverId; })[0]);
        return r;
    }

    function assignDriver(rideId, driverId) {
        const s = load();
        const d = s.drivers.filter(function (x) { return x.id === driverId; })[0];
        const r = getRide(rideId);
        if (!d || !r) return null;
        r.driverId = d.id; r.driverName = d.name; r.plate = d.plate;
        d.status = 'busy';
        save();
        return setStatus(rideId, 'accepted');
    }

    function cancelRide(id) {
        const r = getRide(id);
        if (r && r.driverId) {
            const d = load().drivers.filter(function (x) { return x.id === r.driverId; })[0];
            if (d) d.status = d.online ? 'available' : 'offline';
        }
        return setStatus(id, 'cancelled');
    }

    /* ---------- WALLET ---------- */
    function walletBalance(phone) { return load().wallet[phone] || 0; }
    function walletAdd(phone, amt) {
        const s = load();
        s.wallet[phone] = (s.wallet[phone] || 0) + num(amt);
        save();
        return s.wallet[phone];
    }

    /* ---------- ORDERS (Sale) ---------- */
    function product(id) { return load().products.filter(function (p) { return p.id === id; })[0]; }

    function emi(price, months) {
        months = months || 12;
        // simple 12% annual interest EMI
        const r = 0.12 / 12;
        const e = price * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
        return Math.round(e);
    }

    function createOrder(data) {
        const s = load();
        const p = product(data.productId);
        if (!p) return null;
        const order = {
            id: uid('ORD'),
            productId: p.id,
            productName: p.name,
            category: p.category,
            price: p.price,
            qty: data.qty || 1,
            total: p.price * (data.qty || 1),
            customer: data.customer,          // { name, phone, address }
            payment: data.payment || 'Cash on Delivery',
            type: data.type || 'buy',         // buy | testride
            status: 'placed',                 // placed | confirmed | delivered | cancelled
            date: nowDate(),
            time: nowTime(),
            createdAt: Date.now()
        };
        s.orders.unshift(order);
        save();
        syncPush('orders', order);
        return order;
    }

    function updateOrderStatus(id, status) {
        const o = load().orders.filter(function (x) { return x.id === id; })[0];
        if (!o) return null;
        o.status = status;
        save();
        syncPush('orders', o);
        return o;
    }

    function cancelOrder(id) { return updateOrderStatus(id, 'cancelled'); }

    function orderStats() {
        const s = load();
        const live = s.orders.filter(function (o) { return o.status !== 'cancelled'; });
        return {
            total: s.orders.length,
            placed: s.orders.filter(function (o) { return o.status === 'placed'; }).length,
            delivered: s.orders.filter(function (o) { return o.status === 'delivered'; }).length,
            cancelled: s.orders.filter(function (o) { return o.status === 'cancelled'; }).length,
            revenue: live.reduce(function (a, o) { return a + num(o.total); }, 0),
            products: s.products.length,
            lowStock: s.products.filter(function (p) { return num(p.stock) <= 5; }).length
        };
    }

    /* ---------- WHATSAPP ALERTS ---------- */
    function lowStockProducts() {
        const s = load();
        const lvl = num(s.config.lowStockLevel || 5);
        return s.products.filter(function (p) { return num(p.stock) <= lvl; })
            .sort(function (a, b) { return num(a.stock) - num(b.stock); });
    }

    function pendingOrders() {
        return load().orders.filter(function (o) { return o.status === 'placed' || o.status === 'confirmed'; });
    }

    function waOpen(msg) {
        const cfg = load().config || {};
        const n = String(cfg.whatsapp || '').replace(/\D/g, '');
        window.open('https://wa.me/' + n + '?text=' + encodeURIComponent(msg), '_blank');
        return true;
    }

    function whatsappLowStock() {
        const list = lowStockProducts();
        if (!list.length) return { ok: false, msg: 'Sab stock theek hai' };
        const cfg = load().config || {};
        const body = list.map(function (p) { return '• ' + p.name + ' — ' + p.stock + ' pcs left  [' + p.id + ']'; }).join('\n');
        const msg = '*' + (cfg.appName || 'Apna Electric One') + ' — LOW STOCK ALERT*\n' +
            'Date: ' + nowDate() + '\n\n' + body + '\n\n' +
            'Total ' + list.length + ' items reorder karne hain.\nKripya maal mangwa lein. 🙏';
        waOpen(msg);
        return { ok: true, count: list.length };
    }

    function whatsappPendingOrders() {
        const list = pendingOrders();
        if (!list.length) return { ok: false, msg: 'Koi pending order nahi' };
        const cfg = load().config || {};
        const body = list.slice(0, 20).map(function (o) {
            return '• ' + o.id + ' — ' + o.customer.name + ' (' + o.customer.phone + ')\n   ' +
                o.productName + ' × ' + o.qty + ' — ' + (o.type === 'testride' ? 'Test Ride' : money(o.total));
        }).join('\n');
        const total = list.filter(function (o) { return o.type !== 'testride'; })
            .reduce(function (a, o) { return a + num(o.total); }, 0);
        const msg = '*' + (cfg.appName || 'Apna Electric One') + ' — PENDING ORDERS*\n' +
            'Date: ' + nowDate() + '\n\n' + body + '\n' +
            (list.length > 20 ? '\n...aur ' + (list.length - 20) + ' orders\n' : '') +
            '\n*Pending Amount: ' + money(total) + '*\n' +
            'Total ' + list.length + ' orders pending hain. 🙏';
        waOpen(msg);
        return { ok: true, count: list.length };
    }

    function copyText(txt) {
        if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(function () {});
    }

    /* ---------- AUTH (simple demo) ---------- */
    function getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; } }
    function setUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }
    function logout() { localStorage.removeItem(USER_KEY); location.href = 'index.html'; }

    /* ---------- STATS ---------- */
    function stats() {
        const s = load();
        const done = s.rides.filter(function (r) { return r.status === 'completed'; });
        const cancelled = s.rides.filter(function (r) { return r.status === 'cancelled'; });
        const gross = done.reduce(function (a, r) { return a + num(r.fare); }, 0);
        const commission = Math.round(gross * s.config.commission / 100);
        return {
            totalRides: s.rides.length,
            completed: done.length,
            cancelled: cancelled.length,
            active: s.rides.filter(function (r) { return ['requested', 'accepted', 'arriving', 'ongoing'].indexOf(r.status) > -1; }).length,
            drivers: s.drivers.length,
            online: s.drivers.filter(function (d) { return d.online; }).length,
            gross: gross,
            commission: commission,
            driverPayout: gross - commission
        };
    }

    /* ---------- PUBLIC ---------- */
    window.EV = {
        VEHICLES: VEHICLES, AREAS: AREAS, CATEGORIES: CATEGORIES,
        load: load, save: save, reset: reset,
        saveLocalOnly: saveLocalOnly, syncPush: syncPush, syncDel: syncDel,
        esc: esc, num: num, money: money, uid: uid,
        nowTime: nowTime, nowDate: nowDate,
        vehicle: vehicle, initials: initials,
        coords: coords, midPoint: midPoint, AREA_COORDS: AREA_COORDS,
        distance: distance, fare: fare,
        createRide: createRide, getRide: getRide, updateRide: updateRide,
        setStatus: setStatus, assignDriver: assignDriver, cancelRide: cancelRide,
        product: product, emi: emi,
        createOrder: createOrder, updateOrderStatus: updateOrderStatus,
        cancelOrder: cancelOrder, orderStats: orderStats,
        lowStockProducts: lowStockProducts, pendingOrders: pendingOrders,
        whatsappLowStock: whatsappLowStock, whatsappPendingOrders: whatsappPendingOrders,
        copyText: copyText,
        walletBalance: walletBalance, walletAdd: walletAdd,
        getUser: getUser, setUser: setUser, logout: logout,
        stats: stats, FLOW: FLOW
    };
})();
