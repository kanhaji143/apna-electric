/* ============================================================
   APNA ELECTRIC ONE — Admin CRM
   Path: public/assets/admin.js
   ============================================================ */

(function () {
    'use strict';

    const $ = function (id) { return document.getElementById(id); };

    function toast(msg) {
        const t = $('toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(t._t);
        t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
    }

    /* ---------- RENDER ---------- */
    function render() {
        const s = EV.load();
        const st = EV.stats();

        // stats
        const os = EV.orderStats();
        $('statsGrid').innerHTML = [
            { i: 'fa-route', c: 'green', v: st.totalRides, l: 'Total Rides' },
            { i: 'fa-circle-check', c: 'blue', v: st.completed, l: 'Completed' },
            { i: 'fa-satellite-dish', c: 'orange', v: st.active, l: 'Active Now' },
            { i: 'fa-xmark', c: 'red', v: st.cancelled, l: 'Cancelled' },
            { i: 'fa-motorcycle', c: 'purple', v: st.drivers, l: 'Total Drivers' },
            { i: 'fa-signal', c: 'green', v: st.online, l: 'Online Now' },
            { i: 'fa-indian-rupee-sign', c: 'green', v: EV.money(st.gross), l: 'Ride Revenue' },
            { i: 'fa-percent', c: 'blue', v: EV.money(st.commission), l: 'Platform Commission' },
            { i: 'fa-cart-shopping', c: 'purple', v: os.total, l: 'Shop Orders' },
            { i: 'fa-box', c: 'blue', v: os.products, l: 'Products' },
            { i: 'fa-tags', c: 'green', v: EV.money(os.revenue), l: 'Sale Revenue' },
            { i: 'fa-triangle-exclamation', c: 'orange', v: os.lowStock, l: 'Low Stock Items' }
        ].map(function (x) {
            return '<div class="stat-card"><div class="stat-icon ' + x.c + '"><i class="fas ' + x.i + '"></i></div>' +
                   '<div><div class="stat-value">' + x.v + '</div><div class="stat-label">' + x.l + '</div></div></div>';
        }).join('');

        // status chart
        const groups = [
            { k: 'requested', l: 'Searching', c: '#f59e0b' },
            { k: 'accepted', l: 'Assigned', c: '#3b82f6' },
            { k: 'arriving', l: 'Arriving', c: '#6366f1' },
            { k: 'ongoing', l: 'On Trip', c: '#10b981' },
            { k: 'completed', l: 'Completed', c: '#059669' },
            { k: 'cancelled', l: 'Cancelled', c: '#ef4444' }
        ];
        const counts = groups.map(function (g) {
            return s.rides.filter(function (r) { return r.status === g.k; }).length;
        });
        const max = Math.max.apply(null, counts.concat([1]));
        $('statusChart').innerHTML = groups.map(function (g, i) {
            const pct = Math.round(counts[i] / max * 100);
            return '<div style="margin-bottom:12px">' +
                '<div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;margin-bottom:5px"><span>' + g.l + '</span><span>' + counts[i] + '</span></div>' +
                '<div style="height:9px;background:#f1f5f9;border-radius:6px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:' + g.c + ';border-radius:6px"></div></div></div>';
        }).join('');

        // revenue
        $('revBox').innerHTML =
            row('Gross Revenue', EV.money(st.gross), 'var(--text)') +
            row('Platform Commission (' + s.config.commission + '%)', EV.money(st.commission), 'var(--brand-dark)') +
            row('Driver Payout', EV.money(st.driverPayout), 'var(--info)') +
            row('Completed Rides', st.completed, 'var(--muted)') +
            '<div style="border-top:1px dashed var(--border);margin-top:10px;padding-top:12px">' +
            row('Avg. per Ride', st.completed ? EV.money(Math.round(st.gross / st.completed)) : EV.money(0), 'var(--text)') +
            '</div>';

        // rides table
        const filter = $('rideFilter').value;
        const rides = s.rides.filter(function (r) { return !filter || r.status === filter; });
        $('ridesBody').innerHTML = rides.length ? rides.slice(0, 40).map(function (r) {
            const v = EV.vehicle(r.vehicle);
            return '<tr>' +
                '<td><strong>' + r.id + '</strong><div style="font-size:11px;color:var(--muted)">' + EV.esc(r.date) + '</div></td>' +
                '<td>' + EV.esc(r.customer.name) + '<div style="font-size:11px;color:var(--muted)">' + EV.esc(r.customer.phone) + '</div></td>' +
                '<td>' + EV.esc(r.pickup) + ' → ' + EV.esc(r.drop) + '<div style="font-size:11px;color:var(--muted)">' + r.km + ' km</div></td>' +
                '<td><i class="fas ' + v.icon + '" style="color:' + v.color + '"></i> ' + v.name + '</td>' +
                '<td>' + (r.driverName ? EV.esc(r.driverName) : '<span style="color:var(--muted)">—</span>') + '</td>' +
                '<td><strong>' + EV.money(r.fare) + '</strong></td>' +
                '<td>' + EV.esc(r.payment) + '</td>' +
                '<td>' + badge(r.status) + '</td>' +
            '</tr>';
        }).join('') : '<tr><td colspan="8"><div class="empty"><i class="fas fa-route"></i>Koi ride nahi</div></td></tr>';

        // drivers table
        $('driversBody').innerHTML = s.drivers.map(function (d) {
            const v = EV.vehicle(d.vehicle);
            return '<tr>' +
                '<td><div class="cell-user"><div class="avatar">' + EV.initials(d.name) + '</div>' +
                '<div><div class="cn">' + EV.esc(d.name) + '</div><div class="cs">' + EV.esc(d.id) + ' · ' + EV.esc(d.phone) + '</div></div></div></td>' +
                '<td><i class="fas ' + v.icon + '" style="color:' + v.color + '"></i> ' + v.name + '<div style="font-size:11px;color:var(--muted)">' + EV.esc(d.plate) + '</div></td>' +
                '<td>' + EV.esc(d.area) + '</td>' +
                '<td>' + (d.trips || 0) + '</td>' +
                '<td><strong>' + EV.money(d.earnings || 0) + '</strong></td>' +
                '<td>' + (d.online ? '<span class="badge green">Online</span>' : '<span class="badge grey">Offline</span>') + '</td>' +
                '<td style="white-space:nowrap">' +
                    '<button class="btn btn-light btn-sm" onclick="Adm.editDriver(\'' + d.id + '\')"><i class="fas fa-pen"></i></button> ' +
                    '<button class="btn btn-light btn-sm" onclick="Adm.delDriver(\'' + d.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</td>' +
            '</tr>';
        }).join('');

        // orders table
        const ofilter = $('orderFilter').value;
        const orders = s.orders.filter(function (o) { return !ofilter || o.status === ofilter; });
        $('ordersBody').innerHTML = orders.length ? orders.slice(0, 40).map(function (o) {
            return '<tr>' +
                '<td><strong>' + o.id + '</strong><div style="font-size:11px;color:var(--muted)">' + EV.esc(o.date) + '</div></td>' +
                '<td>' + EV.esc(o.customer.name) + '<div style="font-size:11px;color:var(--muted)">' + EV.esc(o.customer.phone) + '</div></td>' +
                '<td>' + EV.esc(o.productName) + '</td>' +
                '<td>' + o.qty + '</td>' +
                '<td><strong>' + (o.type === 'testride' ? 'Free' : EV.money(o.total)) + '</strong></td>' +
                '<td>' + (o.type === 'testride' ? '<span class="badge blue">Test Ride</span>' : '<span class="badge grey">Purchase</span>') + '</td>' +
                '<td>' + orderBadge(o.status) + '</td>' +
                '<td style="white-space:nowrap">' +
                    '<select class="form-control" style="width:auto;padding:5px 8px;font-size:12px" onchange="Adm.setOrderStatus(\'' + o.id + '\',this.value)">' +
                        ['placed', 'confirmed', 'delivered', 'cancelled'].map(function (x) {
                            return '<option value="' + x + '"' + (o.status === x ? ' selected' : '') + '>' + x.charAt(0).toUpperCase() + x.slice(1) + '</option>';
                        }).join('') +
                    '</select>' +
                '</td>' +
            '</tr>';
        }).join('') : '<tr><td colspan="8"><div class="empty"><i class="fas fa-cart-shopping"></i>Koi order nahi</div></td></tr>';

        // products table
        $('productsBody').innerHTML = s.products.map(function (p) {
            const c = EV.CATEGORIES.filter(function (x) { return x.id === p.category; })[0] || { name: p.category };
            const low = EV.num(p.stock) <= 5;
            return '<tr>' +
                '<td><div class="cell-user"><div class="avatar" style="background:' + p.color + '22;color:' + p.color + '"><i class="fas ' + p.icon + '"></i></div>' +
                '<div><div class="cn">' + EV.esc(p.name) + '</div><div class="cs">' + EV.esc(p.id) + '</div></div></div></td>' +
                '<td>' + EV.esc(c.name) + '</td>' +
                '<td><strong>' + EV.money(p.price) + '</strong></td>' +
                '<td style="color:var(--muted);text-decoration:line-through">' + EV.money(p.mrp) + '</td>' +
                '<td>' + (low ? '<span class="badge red">' + p.stock + ' left</span>' : '<span class="badge green">' + p.stock + '</span>') + '</td>' +
                '<td style="white-space:nowrap">' +
                    '<button class="btn btn-light btn-sm" onclick="Adm.editProduct(\'' + p.id + '\')"><i class="fas fa-pen"></i></button> ' +
                    '<button class="btn btn-light btn-sm" onclick="Adm.delProduct(\'' + p.id + '\')"><i class="fas fa-trash"></i></button>' +
                '</td>' +
            '</tr>';
        }).join('');

        // config
        $('cfgComm').value = s.config.commission;
        $('cfgSurge').value = s.config.surge;
        $('cfgCancel').value = s.config.cancelFee;
        if ($('cfgRzp')) $('cfgRzp').value = s.config.razorpayKey || '';
    }

    function row(l, v, c) {
        return '<div style="display:flex;justify-content:space-between;font-size:13.5px;padding:6px 0"><span style="color:var(--muted)">' + l + '</span><span style="font-weight:700;color:' + c + '">' + v + '</span></div>';
    }

    function badge(st) {
        const map = { requested: 'orange', accepted: 'blue', arriving: 'blue', ongoing: 'green', completed: 'green', cancelled: 'red' };
        const lbl = { requested: 'Searching', accepted: 'Assigned', arriving: 'Arriving', ongoing: 'On Trip', completed: 'Completed', cancelled: 'Cancelled' };
        return '<span class="badge ' + (map[st] || 'grey') + '">' + (lbl[st] || st) + '</span>';
    }

    function orderBadge(st) {
        const map = { placed: 'orange', confirmed: 'blue', delivered: 'green', cancelled: 'red' };
        const lbl = { placed: 'Placed', confirmed: 'Confirmed', delivered: 'Delivered', cancelled: 'Cancelled' };
        return '<span class="badge ' + (map[st] || 'grey') + '">' + (lbl[st] || st) + '</span>';
    }

    function setOrderStatus(id, st) {
        EV.updateOrderStatus(id, st);
        toast('Order ' + id + ' → ' + st);
        render();
    }

    /* ---------- PRODUCT MODAL ---------- */
    function productForm(p) {
        p = p || {};
        const sp = p.specs || {};
        const catOpts = EV.CATEGORIES.filter(function (c) { return c.id !== 'all'; }).map(function (c) {
            return '<option value="' + c.id + '"' + (p.category === c.id ? ' selected' : '') + '>' + c.name + '</option>';
        }).join('');
        const badgeOpts = ['none', 'bestseller', 'new', 'premium'].map(function (b) {
            return '<option value="' + b + '"' + (p.badge === b ? ' selected' : '') + '>' + b + '</option>';
        }).join('');

        $('modalHost').innerHTML =
            '<div class="modal-overlay active" onclick="Adm.closeModal()"></div>' +
            '<div class="modal-box active">' +
                '<div class="modal-head"><h3>' + (p.id ? 'Edit Product' : 'Add Product') + '</h3>' +
                '<button class="modal-x" onclick="Adm.closeModal()">&times;</button></div>' +
                '<div class="modal-body">' +
                    '<div class="form-group"><label>Product ID *</label><input class="form-control" id="pId" value="' + EV.esc(p.id || '') + '"' + (p.id ? ' readonly' : '') + '></div>' +
                    '<div class="form-group"><label>Name *</label><input class="form-control" id="pName" value="' + EV.esc(p.name || '') + '"></div>' +
                    '<div class="form-group"><label>Category</label><select class="form-control" id="pCat">' + catOpts + '</select></div>' +
                    '<div class="form-group"><label>Price (₹) *</label><input type="number" class="form-control" id="pPrice" value="' + (p.price || '') + '"></div>' +
                    '<div class="form-group"><label>MRP (₹)</label><input type="number" class="form-control" id="pMrp" value="' + (p.mrp || '') + '"></div>' +
                    '<div class="form-group"><label>Stock</label><input type="number" class="form-control" id="pStock" value="' + (p.stock != null ? p.stock : 10) + '"></div>' +
                    '<div class="form-group"><label>Badge</label><select class="form-control" id="pBadge">' + badgeOpts + '</select></div>' +
                    '<div class="form-group"><label>Icon (FontAwesome class)</label><input class="form-control" id="pIcon" value="' + EV.esc(p.icon || 'fa-motorcycle') + '"></div>' +
                    '<div class="form-group"><label>Color</label><input type="color" class="form-control" id="pColor" value="' + EV.esc(p.color || '#10b981') + '" style="height:44px;padding:4px"></div>' +
                    '<div style="font-size:12px;color:var(--muted);margin-top:6px">Specs (jaise Range, Speed)</div>' +
                    '<div class="form-group"><input class="form-control" id="pSpec1" placeholder="Range: 120 km" value="' + EV.esc(sp.Range || '') + '"></div>' +
                    '<div class="form-group"><input class="form-control" id="pSpec2" placeholder="Speed: 85 km/h" value="' + EV.esc(sp.Speed || '') + '"></div>' +
                '</div>' +
                '<div class="modal-foot">' +
                    '<button class="btn btn-light" onclick="Adm.closeModal()">Cancel</button>' +
                    '<button class="btn btn-primary" onclick="Adm.saveProduct(' + (p.id ? 'true' : 'false') + ')"><i class="fas fa-floppy-disk"></i> Save</button>' +
                '</div>' +
            '</div>';
    }

    function addProduct() { productForm(null); }

    function editProduct(id) {
        const p = EV.load().products.filter(function (x) { return x.id === id; })[0];
        if (p) productForm(p);
    }

    function saveProduct(isEdit) {
        const s = EV.load();
        const id = $('pId').value.trim().toUpperCase();
        const name = $('pName').value.trim();
        const price = EV.num($('pPrice').value);
        if (!id || !name || !price) { toast('ID, Name aur Price zaroori hai'); return; }

        const specs = {};
        const s1 = $('pSpec1').value.trim(), s2 = $('pSpec2').value.trim();
        if (s1) { const a = s1.split(':'); specs[(a[0] || '').trim() || 'Spec 1'] = (a[1] || '').trim(); }
        if (s2) { const b = s2.split(':'); specs[(b[0] || '').trim() || 'Spec 2'] = (b[1] || '').trim(); }

        const rec = {
            id: id, name: name,
            category: $('pCat').value,
            price: price,
            mrp: EV.num($('pMrp').value) || price,
            stock: EV.num($('pStock').value),
            badge: $('pBadge').value,
            icon: $('pIcon').value.trim() || 'fa-motorcycle',
            color: $('pColor').value,
            specs: specs
        };

        const idx = s.products.map(function (p) { return p.id; }).indexOf(id);
        if (isEdit && idx > -1) { s.products[idx] = rec; toast('Product updated'); }
        else {
            if (idx > -1) { toast('Product ID already exists'); return; }
            s.products.push(rec); toast('Product added');
        }
        EV.save();
        EV.syncPush('products', rec);
        closeModal();
        render();
    }

    function delProduct(id) {
        if (!confirm('Delete product ' + id + '?')) return;
        const s = EV.load();
        s.products = s.products.filter(function (p) { return p.id !== id; });
        EV.save();
        EV.syncDel('products', id);
        render();
        toast('Product deleted');
    }

    /* ---------- DRIVER MODAL ---------- */
    function driverForm(d) {
        d = d || {};
        const vehOpts = EV.VEHICLES.map(function (v) {
            return '<option value="' + v.id + '"' + (d.vehicle === v.id ? ' selected' : '') + '>' + v.name + '</option>';
        }).join('');
        const areaOpts = EV.AREAS.map(function (a) {
            return '<option value="' + EV.esc(a) + '"' + (d.area === a ? ' selected' : '') + '>' + EV.esc(a) + '</option>';
        }).join('');

        $('modalHost').innerHTML =
            '<div class="modal-overlay active" onclick="Adm.closeModal()"></div>' +
            '<div class="modal-box active">' +
                '<div class="modal-head"><h3>' + (d.id ? 'Edit Driver' : 'Add Driver') + '</h3>' +
                '<button class="modal-x" onclick="Adm.closeModal()">&times;</button></div>' +
                '<div class="modal-body">' +
                    '<div class="form-group"><label>Driver ID *</label><input class="form-control" id="fId" value="' + EV.esc(d.id || '') + '"' + (d.id ? ' readonly' : '') + '></div>' +
                    '<div class="form-group"><label>Name *</label><input class="form-control" id="fName" value="' + EV.esc(d.name || '') + '"></div>' +
                    '<div class="form-group"><label>Phone</label><input class="form-control" id="fPhone" value="' + EV.esc(d.phone || '') + '"></div>' +
                    '<div class="form-group"><label>Vehicle Type</label><select class="form-control" id="fVeh">' + vehOpts + '</select></div>' +
                    '<div class="form-group"><label>Plate No</label><input class="form-control" id="fPlate" value="' + EV.esc(d.plate || '') + '"></div>' +
                    '<div class="form-group"><label>Area</label><select class="form-control" id="fArea">' + areaOpts + '</select></div>' +
                    '<div class="form-group"><label>PIN</label><input class="form-control" id="fPin" value="' + EV.esc(d.pin || '1234') + '"></div>' +
                '</div>' +
                '<div class="modal-foot">' +
                    '<button class="btn btn-light" onclick="Adm.closeModal()">Cancel</button>' +
                    '<button class="btn btn-primary" onclick="Adm.saveDriver(' + (d.id ? 'true' : 'false') + ')"><i class="fas fa-floppy-disk"></i> Save</button>' +
                '</div>' +
            '</div>';
    }

    function addDriver() { driverForm(null); }

    function editDriver(id) {
        const d = EV.load().drivers.filter(function (x) { return x.id === id; })[0];
        if (d) driverForm(d);
    }

    function saveDriver(isEdit) {
        const s = EV.load();
        const id = $('fId').value.trim().toUpperCase();
        const name = $('fName').value.trim();
        if (!id || !name) { toast('ID aur Name zaroori hai'); return; }

        const rec = {
            id: id, name: name,
            phone: $('fPhone').value.trim(),
            vehicle: $('fVeh').value,
            plate: $('fPlate').value.trim(),
            area: $('fArea').value,
            pin: $('fPin').value.trim() || '1234',
            rating: 5, status: 'offline', online: false, trips: 0, earnings: 0
        };

        const idx = s.drivers.map(function (d) { return d.id; }).indexOf(id);
        if (isEdit && idx > -1) {
            rec.rating = s.drivers[idx].rating;
            rec.trips = s.drivers[idx].trips;
            rec.earnings = s.drivers[idx].earnings;
            rec.online = s.drivers[idx].online;
            rec.status = s.drivers[idx].status;
            s.drivers[idx] = rec;
            toast('Driver updated');
        } else {
            if (idx > -1) { toast('Driver ID already exists'); return; }
            s.drivers.push(rec);
            toast('Driver added');
        }
        EV.save();
        EV.syncPush('drivers', rec);
        closeModal();
        render();
    }

    function delDriver(id) {
        if (!confirm('Delete driver ' + id + '?')) return;
        const s = EV.load();
        s.drivers = s.drivers.filter(function (d) { return d.id !== id; });
        EV.save();
        EV.syncDel('drivers', id);
        render();
        toast('Driver deleted');
    }

    function closeModal() { $('modalHost').innerHTML = ''; }

    /* ---------- CONFIG ---------- */
    function saveCfg() {
        const s = EV.load();
        s.config.commission = EV.num($('cfgComm').value) || 20;
        s.config.surge = EV.num($('cfgSurge').value) || 1;
        s.config.cancelFee = EV.num($('cfgCancel').value) || 0;
        s.config.razorpayKey = ($('cfgRzp') ? $('cfgRzp').value.trim() : '');
        EV.save();
        EV.syncPush('config', Object.assign({ id: 'app' }, s.config));
        toast('Settings saved');
        render();
    }

    function reset() {
        if (!confirm('Reset ALL data (rides + drivers) to default?')) return;
        EV.reset();
        render();
        toast('Data reset');
    }

    /* ============================================================
       SETTINGS PAGE
       ============================================================ */
    function renderSettings() {
        const s = EV.load();
        const c = s.config || {};
        if ($('setName'))   $('setName').value   = c.appName || 'Apna Electric One';
        if ($('setPhone'))  $('setPhone').value  = c.phone || '';
        if ($('setAddr'))   $('setAddr').value   = c.address || '';
        if ($('setWa'))     $('setWa').value     = c.whatsapp || '';
        if ($('setLow'))    $('setLow').value    = c.lowStockLevel || 5;
        if ($('setComm'))   $('setComm').value   = c.commission || 20;
        if ($('setSurge'))  $('setSurge').value  = c.surge || 1;
        if ($('setCancel')) $('setCancel').value = c.cancelFee || 0;
        if ($('setRzp'))    $('setRzp').value    = c.razorpayKey || '';

        const rz = $('rzpStatus');
        if (rz) {
            const ok = window.Pay && Pay.available();
            rz.innerHTML = ok
                ? '<span class="badge green"><i class="fas fa-circle-check"></i> Razorpay active</span> Online payment chalu hai.'
                : '<span class="badge orange"><i class="fas fa-triangle-exclamation"></i> Key set nahi</span> Abhi Cash/UPI simulation chalega.';
        }

        const box = $('syncBox');
        if (box) {
            const fb = window.FB || {};
            const online = !!fb.ready;
            const last = fb.lastSync ? new Date(fb.lastSync).toLocaleTimeString('en-IN') : '—';
            box.innerHTML =
                '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
                    '<div class="stat-icon ' + (online ? 'green' : 'red') + '" style="width:42px;height:42px;font-size:17px">' +
                        '<i class="fas ' + (online ? 'fa-cloud-arrow-up' : 'fa-cloud-slash') + '"></i></div>' +
                    '<div><div style="font-weight:700;font-size:15px">' + (online ? 'Connected' : 'Offline') + '</div>' +
                    '<div style="font-size:12.5px;color:var(--muted)">' +
                        (online ? 'Project: apna-electric-one · Last sync: ' + last : (fb.error || 'Firestore available nahi')) +
                    '</div></div>' +
                '</div>' +
                '<div style="font-size:13px;color:var(--muted);line-height:1.8">' +
                    'Data cloud mein save hota hai — <strong>sab devices pe same dikhega</strong>. ' +
                    'Ek phone pe order karo, doosre pe turant update ho jayega.' +
                '</div>';
        }
    }

    function saveSettings() {
        const s = EV.load();
        s.config.appName = $('setName').value.trim() || 'Apna Electric One';
        s.config.phone = $('setPhone').value.trim();
        s.config.address = $('setAddr').value.trim();
        s.config.whatsapp = $('setWa').value.trim();
        s.config.lowStockLevel = EV.num($('setLow').value) || 5;
        s.config.commission = EV.num($('setComm').value) || 20;
        s.config.surge = EV.num($('setSurge').value) || 1;
        s.config.cancelFee = EV.num($('setCancel').value) || 0;
        s.config.razorpayKey = $('setRzp').value.trim();
        EV.save();
        EV.syncPush('config', Object.assign({ id: 'app' }, s.config));
        toast('Settings saved');
        renderSettings();
    }

    function testLowStock() {
        const r = EV.whatsappLowStock();
        toast(r.ok ? (r.count + ' low stock items — WhatsApp khul raha hai') : r.msg);
    }

    function testPending() {
        const r = EV.whatsappPendingOrders();
        toast(r.ok ? (r.count + ' pending orders — WhatsApp khul raha hai') : r.msg);
    }

    window.Adm = {
        render: render, addDriver: addDriver, editDriver: editDriver, saveDriver: saveDriver,
        delDriver: delDriver, closeModal: closeModal, saveCfg: saveCfg, reset: reset,
        addProduct: addProduct, editProduct: editProduct, saveProduct: saveProduct,
        delProduct: delProduct, setOrderStatus: setOrderStatus,
        renderSettings: renderSettings, saveSettings: saveSettings,
        testLowStock: testLowStock, testPending: testPending
    };

    document.addEventListener('DOMContentLoaded', function () {
        EV.load();
        const p = document.body.getAttribute('data-page');
        if (p === 'settings') {
            renderSettings();
            if (window.FB) FB.onChange = function () { renderSettings(); };
        } else {
            render();
            setInterval(render, 3000);
            if (window.FB) FB.onChange = function () { render(); };
        }
    });
})();
