/* ============================================================
   APNA ELECTRIC ONE — Razorpay Payment
   Path: public/assets/payment.js
   ------------------------------------------------------------
   Razorpay key Admin CRM → Settings mein daalein.
   Key na ho to app Cash/UPI simulation pe chalta rahega.
   ============================================================ */

(function () {
    'use strict';

    let loading = null;

    function key() {
        try {
            const c = EV.load().config || {};
            return (c.razorpayKey || '').trim();
        } catch (e) { return ''; }
    }

    function available() {
        const k = key();
        return !!k && k.indexOf('rzp_') === 0;
    }

    function loadSdk() {
        if (window.Razorpay) return Promise.resolve(true);
        if (loading) return loading;
        loading = new Promise(function (resolve, reject) {
            const s = document.createElement('script');
            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
            s.onload = function () { resolve(true); };
            s.onerror = function () { reject(new Error('Razorpay SDK load failed')); };
            document.head.appendChild(s);
        });
        return loading;
    }

    /**
     * opts = { amount (₹), name, description, phone, email, notes,
     *          onSuccess(paymentId), onFailure(err), onDismiss() }
     */
    function start(opts) {
        if (!available()) {
            return Promise.reject(new Error('Razorpay key set nahi hai'));
        }
        return loadSdk().then(function () {
            return new Promise(function (resolve, reject) {
                const rzp = new window.Razorpay({
                    key: key(),
                    amount: Math.round(opts.amount * 100),   // paise
                    currency: 'INR',
                    name: 'Apna Electric One',
                    description: opts.description || 'Payment',
                    image: 'icon-192.png',
                    prefill: {
                        name: opts.name || '',
                        contact: opts.phone || '',
                        email: opts.email || ''
                    },
                    notes: opts.notes || {},
                    theme: { color: '#10b981' },
                    handler: function (res) {
                        if (opts.onSuccess) opts.onSuccess(res.razorpay_payment_id || 'paid');
                        resolve(res);
                    },
                    modal: {
                        ondismiss: function () {
                            if (opts.onDismiss) opts.onDismiss();
                            reject(new Error('cancelled'));
                        }
                    }
                });
                rzp.on('payment.failed', function (resp) {
                    const d = (resp && resp.error && resp.error.description) || 'Payment failed';
                    if (opts.onFailure) opts.onFailure(d);
                    reject(new Error(d));
                });
                rzp.open();
            });
        });
    }

    window.Pay = { available: available, start: start, key: key };
})();
