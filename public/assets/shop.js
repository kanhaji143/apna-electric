/* ============================================================
   APNA ELECTRIC ONE — EV Showroom (Sale)
   Path: public/assets/shop.js
   ============================================================ */

(function () {
    'use strict';

    let cat = 'all';
    const $ = function (id) { return document.getElementById(id); };

    function toast(msg) {
        const t = $('toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(t._t);
        t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
    }

    function badge(p) {
        if (p.badge === 'bestseller') return '<span class="badge red prod-badge">Bestseller</span>';
        if (p.badge === 'new') return '<span class="badge green prod-badge">New</span>';
        if (p.badge === 'premium') return '<span class="badge orange prod-badge">Premium</span>';
        return '';
    }

    function off(p) { return Math.round((1 - p.price / p.mrp) * 100); }

    /* ---------- RENDER ---------- */
    function renderCats() {
        $('catBar').innerHTML = EV.CATEGORIES.map(function (c) {
            return '<button class="cat-chip' + (c.id === cat ? ' sel' : '') + '" onclick="Shop.cat(\'' + c.id + '\')">' +
                '<i class="fas ' + c.icon + '"></i> ' + c.name + '</button>';
        }).join('');
    }

    function renderProducts() {
        const all = EV.load().products;
        const list = cat === 'all' ? all : all.filter(function (p) { return p.category === cat; });

        if (!list.length) {
            $('prodGrid').innerHTML = '<div class="card" style="grid-column:1/-1"><div class="empty"><i class="fas fa-box-open"></i>Is category mein koi product nahi</div></div>';
            return;
        }

        $('prodGrid').innerHTML = list.map(function (p) {
            const specs = Object.keys(p.specs || {}).slice(0, 2).map(function (k) {
                return k + ': ' + p.specs[k];
            }).join(' · ');
            const out = p.stock <= 0;
            return '<div class="prod" onclick="Shop.open(\'' + p.id + '\')">' +
                badge(p) +
                '<div class="prod-img"><i class="fas ' + p.icon + '" style="color:' + p.color + '"></i></div>' +
                '<div class="prod-body">' +
                    '<div class="prod-name">' + EV.esc(p.name) + '</div>' +
                    '<div class="prod-spec">' + EV.esc(specs) + '</div>' +
                    '<div class="prod-price"><span class="now">' + EV.money(p.price) + '</span>' +
                        '<span class="mrp">' + EV.money(p.mrp) + '</span>' +
                        '<span class="off">' + off(p) + '% off</span></div>' +
                    '<div class="prod-emi">EMI from ' + EV.money(EV.emi(p.price, 12)) + '/mo</div>' +
                    (out
                        ? '<button class="btn btn-light btn-block btn-sm" disabled>Out of Stock</button>'
                        : '<button class="btn btn-primary btn-block btn-sm" onclick="event.stopPropagation();Shop.open(\'' + p.id + '\')"><i class="fas fa-cart-shopping"></i> Buy Now</button>') +
                '</div>' +
            '</div>';
        }).join('');
    }

    /* ---------- PRODUCT MODAL ---------- */
    function open(id) {
        const p = EV.product(id);
        if (!p) return;
        const specs = Object.keys(p.specs || {}).map(function (k) {
            return '<div class="spec-item"><div class="k">' + EV.esc(k) + '</div><div class="v">' + EV.esc(p.specs[k]) + '</div></div>';
        }).join('');

        $('modalHost').innerHTML =
            '<div class="modal-overlay active" onclick="Shop.close()"></div>' +
            '<div class="modal-box active">' +
                '<div class="modal-head"><h3>' + EV.esc(p.name) + '</h3>' +
                '<button class="modal-x" onclick="Shop.close()">&times;</button></div>' +
                '<div class="modal-body">' +
                    '<div style="height:150px;display:flex;align-items:center;justify-content:center;font-size:64px;background:linear-gradient(135deg,#f8fafc,#eef2f7);border-radius:12px">' +
                        '<i class="fas ' + p.icon + '" style="color:' + p.color + '"></i></div>' +
                    '<div class="prod-price" style="margin-top:14px"><span class="now" style="font-size:24px">' + EV.money(p.price) + '</span>' +
                        '<span class="mrp">' + EV.money(p.mrp) + '</span>' +
                        '<span class="off">' + off(p) + '% off</span></div>' +
                    '<div class="prod-emi" style="font-size:13px">EMI from <strong>' + EV.money(EV.emi(p.price, 12)) + '/month</strong> (12 months)</div>' +
                    '<div class="spec-grid">' + specs + '</div>' +
                    '<div style="font-size:12.5px;color:var(--muted)">' +
                        (p.stock > 0 ? '<i class="fas fa-circle-check" style="color:var(--brand)"></i> In Stock (' + p.stock + ' available)' : '<i class="fas fa-circle-xmark" style="color:var(--danger)"></i> Out of Stock') +
                    '</div>' +
                '</div>' +
                '<div class="modal-foot">' +
                    '<button class="btn btn-light" onclick="Shop.testRide(\'' + p.id + '\')"><i class="fas fa-motorcycle"></i> Test Ride</button>' +
                    '<button class="btn btn-primary" onclick="Shop.order(\'' + p.id + '\')"' + (p.stock <= 0 ? ' disabled' : '') + '><i class="fas fa-cart-shopping"></i> Buy Now</button>' +
                '</div>' +
            '</div>';
    }

    function close() { $('modalHost').innerHTML = ''; }

    /* ---------- ORDER FORM ---------- */
    function orderForm(productId, type) {
        const p = EV.product(productId);
        if (!p) return;
        const u = EV.getUser() || {};
        const isTest = type === 'testride';

        $('modalHost').innerHTML =
            '<div class="modal-overlay active" onclick="Shop.close()"></div>' +
            '<div class="modal-box active">' +
                '<div class="modal-head"><h3>' + (isTest ? 'Book Free Test Ride' : 'Place Order') + '</h3>' +
                '<button class="modal-x" onclick="Shop.close()">&times;</button></div>' +
                '<div class="modal-body">' +
                    '<div style="background:var(--bg);border-radius:10px;padding:12px;margin-bottom:16px;display:flex;gap:12px;align-items:center">' +
                        '<i class="fas ' + p.icon + '" style="font-size:26px;color:' + p.color + '"></i>' +
                        '<div><div style="font-weight:700;font-size:14px">' + EV.esc(p.name) + '</div>' +
                        '<div style="font-size:12.5px;color:var(--muted)">' + (isTest ? 'Free test ride · 15 min' : EV.money(p.price) + ' · EMI ' + EV.money(EV.emi(p.price, 12)) + '/mo') + '</div></div>' +
                    '</div>' +
                    '<div class="form-group"><label>Full Name *</label><input class="form-control" id="oName" value="' + EV.esc(u.name || '') + '"></div>' +
                    '<div class="form-group"><label>Mobile *</label><input class="form-control" id="oPhone" value="' + EV.esc(u.phone || '') + '" maxlength="10"></div>' +
                    (isTest ? '' : '<div class="form-group"><label>Delivery Address</label><textarea class="form-control" rows="2" id="oAddr"></textarea></div>') +
                    (isTest
                        ? '<div class="form-group"><label>Preferred Date</label><input type="date" class="form-control" id="oDate"></div>'
                        : '<div class="form-group"><label>Payment Method</label><select class="form-control" id="oPay">' +
                          '<option>Cash on Delivery</option><option>UPI</option><option>Pay Online (Razorpay)</option><option>EMI (12 months)</option><option>Bank Transfer</option></select></div>') +
                '</div>' +
                '<div class="modal-foot">' +
                    '<button class="btn btn-light" onclick="Shop.close()">Cancel</button>' +
                    '<button class="btn btn-primary" onclick="Shop.submit(\'' + p.id + '\',\'' + type + '\')">' +
                        '<i class="fas fa-check"></i> ' + (isTest ? 'Book Test Ride' : 'Confirm Order') + '</button>' +
                '</div>' +
            '</div>';
    }

    function submit(productId, type) {
        const name = $('oName').value.trim();
        const phone = $('oPhone').value.trim();
        if (!name) { toast('Name daalein'); return; }
        if (!/^\d{10}$/.test(phone)) { toast('10 digit mobile number daalein'); return; }

        const isTest = type === 'testride';
        const customer = {
            name: name,
            phone: phone,
            address: isTest ? '' : ($('oAddr') ? $('oAddr').value.trim() : '')
        };
        const payMode = isTest ? 'Free' : ($('oPay') ? $('oPay').value : 'Cash on Delivery');
        const p = EV.product(productId);

        function done(paymentLabel) {
            const o = EV.createOrder({
                productId: productId,
                qty: 1,
                customer: customer,
                type: isTest ? 'testride' : 'buy',
                payment: paymentLabel
            });
            EV.setUser({ name: name, phone: phone });
            toast(isTest ? 'Test ride booked! Hum call karenge.' : 'Order placed! ' + o.id);
            close();
            renderOrders();
        }

        if (!isTest && payMode === 'Pay Online (Razorpay)' && window.Pay && Pay.available()) {
            toast('Payment window khul raha hai...');
            Pay.start({
                amount: p.price,
                description: p.name,
                name: name,
                phone: phone,
                notes: { type: 'shop', productId: productId }
            }).then(function (res) {
                done('Razorpay (' + (res.razorpay_payment_id || 'paid') + ')');
            }).catch(function (e) {
                if (String(e.message) !== 'cancelled') toast('Payment fail: ' + e.message);
                else toast('Payment cancel kiya');
            });
            return;
        }

        if (!isTest && payMode === 'Pay Online (Razorpay)') {
            toast('Razorpay key set nahi hai — Admin → Settings mein daalein');
            return;
        }

        done(payMode);
    }

    /* ---------- ORDERS ---------- */
    function renderOrders() {
        const u = EV.getUser();
        const tbody = $('ordersBody');
        if (!tbody) return;
        const all = EV.load().orders;
        const mine = u && u.phone ? all.filter(function (o) { return o.customer.phone === u.phone; }) : all;

        if (!mine.length) {
            tbody.innerHTML = '<tr><td colspan="6"><div class="empty"><i class="fas fa-cart-shopping"></i>Abhi koi order nahi</div></td></tr>';
            return;
        }
        tbody.innerHTML = mine.slice(0, 10).map(function (o) {
            return '<tr>' +
                '<td><strong>' + o.id + '</strong><div style="font-size:11px;color:var(--muted)">' + EV.esc(o.date) + '</div></td>' +
                '<td>' + EV.esc(o.productName) + '</td>' +
                '<td>' + o.qty + '</td>' +
                '<td><strong>' + (o.type === 'testride' ? 'Free' : EV.money(o.total)) + '</strong></td>' +
                '<td>' + (o.type === 'testride' ? '<span class="badge blue">Test Ride</span>' : '<span class="badge grey">Purchase</span>') + '</td>' +
                '<td>' + statusBadge(o.status) + '</td>' +
            '</tr>';
        }).join('');
    }

    function statusBadge(st) {
        const map = { placed: 'orange', confirmed: 'blue', delivered: 'green', cancelled: 'red' };
        const lbl = { placed: 'Placed', confirmed: 'Confirmed', delivered: 'Delivered', cancelled: 'Cancelled' };
        return '<span class="badge ' + (map[st] || 'grey') + '">' + (lbl[st] || st) + '</span>';
    }

    window.Shop = {
        cat: function (c) { cat = c; renderCats(); renderProducts(); },
        open: open, close: close,
        order: function (id) { orderForm(id, 'buy'); },
        testRide: function (id) { orderForm(id, 'testride'); },
        submit: submit
    };

    document.addEventListener('DOMContentLoaded', function () {
        EV.load();
        renderCats();
        renderProducts();
        renderOrders();
        if (window.FB) FB.onChange = function () { renderProducts(); renderOrders(); };
    });
})();
