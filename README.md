# ⚡ Apna Electric One — EV Ride Booking + Shop (PWA)

**Live site:** https://apna-electric-one.web.app

A Progressive Web App for booking electric rides and shopping — customers book
rides, drivers manage trips, admin oversees everything, plus an in-app shop.

| Role | Page | What it does |
|---|---|---|
| 👤 Customer | `/` | Book electric rides in seconds, ride history, payments |
| 🛵 Driver | `/driver.html` | Driver app — accept & manage rides |
| 🛍 Shop | `/shop.html` | EV accessories & products store |
| 🛡 Admin | `/admin.html` | Admin panel — rides, payments, settings |
| ⚙ Settings | `/settings.html` | App configuration |

## ✨ Highlights

- **PWA** — installable on phones (`manifest.json` + `service-worker.js`, offline-friendly)
- **Payments** — integrated payment flow (`payment.js`)
- **Auth** — customer / driver / admin roles (`auth.js`)
- **No build step** — plain HTML/CSS/JS, deploy straight to Firebase

## 🛠 Tech stack

- **Frontend:** Vanilla HTML / CSS / JavaScript (PWA)
- **Backend:** Firebase (Hosting + Firestore + Auth)

## 📁 Project structure

```
public/
├── index.html        # Customer app
├── driver.html       # Driver app
├── shop.html         # Shop
├── admin.html        # Admin panel
├── assets/           # JS modules (app, auth, customer, driver, shop, payment…)
├── manifest.json     # PWA manifest
└── service-worker.js # Offline caching
```

## 🚀 Deploy

```bash
firebase login
firebase deploy --only hosting
```

---

*Owner: kanhadigimkt · kanhadigimkt@gmail.com*
