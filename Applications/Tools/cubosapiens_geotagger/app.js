// APP CONTROLLER
// Initializes CUBO GPS CAM

// ─────────────────────────────────────────────────────────
// WORKER URL — replace with your actual Worker URL
// const WORKER_URL = "https://cubo-counter.srk8115939.workers.dev"
// ─────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", initApp)

function initApp()
{
console.log("CUBO GPS CAM initialized")
initializeTheme()   // 1. apply saved theme class to body
addThemeToggle()    // 2. create toggle button
updateLogo()        // 3. set correct logo AFTER everything is ready
initCounters()      // 4. load counters
initCookieBanner()  // 5. cookie consent
}


// ── Theme ──────────────────────────────────────────────────

function initializeTheme()
{
const savedTheme = localStorage.getItem("theme")
if(savedTheme === "dark")
{
document.body.classList.add("dark")
}
}

function addThemeToggle()
{
const header    = document.querySelector("header")
const toggleBtn = document.createElement("button")
toggleBtn.id        = "themeToggle"
toggleBtn.title     = "Toggle dark mode"
toggleBtn.className = "header-toggle"
updateToggleLabel(toggleBtn)
toggleBtn.addEventListener("click", () =>
{
document.body.classList.toggle("dark")
const isDark = document.body.classList.contains("dark")
localStorage.setItem("theme", isDark ? "dark" : "light")
updateToggleLabel(toggleBtn)
updateLogo()        // swap logo on every toggle click
})
header.appendChild(toggleBtn)
}

function updateToggleLabel(btn)
{
const isDark          = document.body.classList.contains("dark")
btn.textContent       = isDark ? "☀ Light" : "☾ Dark"
btn.style.color       = isDark ? "#e34949" : "#000"
btn.style.borderColor = isDark ? "#e34949" : "#000"
// NOTE: updateLogo() is NOT called here anymore
// It was causing timing issues — now called explicitly
}

// Swap logo based on current theme
function updateLogo()
{
const logo   = document.getElementById("headerLogo")
const isDark = document.body.classList.contains("dark")
if(!logo) return
logo.src = isDark ? "assets/logo_dark.png" : "assets/logo_light.png"
}


// ── Counters ───────────────────────────────────────────────

async function initCounters()
{
if(!sessionStorage.getItem("visited"))
{
sessionStorage.setItem("visited", "1")
trackVisit()
}
loadCounters()
}

async function trackVisit()
{
try
{
await fetch(WORKER_URL + "/counter/visit", { method: "POST" })
}
catch(err) {}
}

async function loadCounters()
{
try
{
const res  = await fetch(WORKER_URL + "/counter")
const data = await res.json()
animateCounter("counterValue", data.visits)
const counterEl = document.getElementById("headerCounter")
if(counterEl)
{
counterEl.title =
"👁 " + (data.visits    || 0).toLocaleString() + " visits\n" +
"📷 " + (data.downloads || 0).toLocaleString() + " photos downloaded"
}
}
catch(err)
{
console.log("Counter unavailable:", err.message)
const el = document.getElementById("headerCounter")
if(el) el.style.display = "block"
}
}

async function incrementDownload()
{
try
{
const res  = await fetch(WORKER_URL + "/counter/download", { method: "POST" })
const data = await res.json()
const counterEl = document.getElementById("headerCounter")
if(counterEl && data.downloads)
{
const visits = parseInt(
document.getElementById("counterValue").textContent.replace(/,/g, "")
) || 0
counterEl.title =
"👁 " + visits.toLocaleString()         + " visits\n" +
"📷 " + data.downloads.toLocaleString() + " photos downloaded"
}
}
catch(err)
{
console.log("Download counter failed:", err.message)
}
}

function animateCounter(elementId, target)
{
const el = document.getElementById(elementId)
if(!el) return
const start    = parseInt(el.textContent.replace(/,/g, "")) || 0
const duration = 1400
const steps    = 50
const diff     = target - start
if(diff <= 0)
{
el.textContent = target.toLocaleString()
return
}
let current = start
const increment = Math.max(1, Math.round(diff / steps))
const timer = setInterval(() =>
{
current = Math.min(current + increment, target)
el.textContent = current.toLocaleString()
if(current >= target)
{
clearInterval(timer)
el.textContent = target.toLocaleString()
}
}, Math.round(duration / steps))
}
// ── Cookie banner ─────────────────────────────────

function initCookieBanner()
{
if(localStorage.getItem("cookie_consent")) return

setTimeout(() => {
const banner = document.getElementById("cookieBanner")
if(banner) banner.classList.add("visible")
}, 900)

const acceptBtn  = document.getElementById("cookieAccept")
const declineBtn = document.getElementById("cookieDecline")

if(acceptBtn)
{
acceptBtn.addEventListener("click", () => {
localStorage.setItem("cookie_consent", "accepted")
hideCookieBanner()
})
}

if(declineBtn)
{
declineBtn.addEventListener("click", () => {
localStorage.setItem("cookie_consent", "declined")
hideCookieBanner()
})
}
}

function hideCookieBanner()
{
const banner = document.getElementById("cookieBanner")
if(!banner) return
banner.style.transform = "translateY(100%)"
setTimeout(() => banner.remove(), 400)
}