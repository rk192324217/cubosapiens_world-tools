// MAP MODULE
// Handles map, coordinates, and location detection

let map
let marker



// initialize map

function initMap()
{

const defaultPos = [20.5937, 78.9629]

map = L.map("map").setView(defaultPos, 5)

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
maxZoom: 19,
attribution: "© OpenStreetMap"
}
).addTo(map)

map.on("click", onMapClick)

}



// handle map click

function onMapClick(e)
{

const lat = e.latlng.lat
const lon = e.latlng.lng

setMarker(lat, lon)

fetchAddress(lat, lon)

setCoords(lat, lon)

}



// place marker

function setMarker(lat, lon)
{

if(marker)
{
marker.remove()
}

marker = L.marker([lat, lon]).addTo(map)

map.setView([lat, lon], 14)

}



// parse coordinate string

function parseCoords(text)
{

const parts = text.split(",")

if(parts.length !== 2)
{
alert("Invalid coordinate format. Use: lat, lon")
return null
}

const lat = parseFloat(parts[0].trim())
const lon = parseFloat(parts[1].trim())

if(isNaN(lat) || isNaN(lon))
{
alert("Invalid coordinate numbers")
return null
}

return { lat, lon }

}



// locate from pasted coordinates

function locateFromInput()
{

const txt = document.getElementById("coordInput").value

const res = parseCoords(txt)

if(!res) return

setMarker(res.lat, res.lon)

fetchAddress(res.lat, res.lon)

setCoords(res.lat, res.lon)

}



// reverse geocode → address + structured components

function fetchAddress(lat, lon)
{

const url =
"https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
lat + "&lon=" + lon + "&addressdetails=1"

fetch(url)
.then(r => r.json())
.then(data => {

if(!data) return

// full address string for locText sidebar
if(data.display_name)
{
document.getElementById("locText").innerText =
data.display_name

setLocation(data.display_name)
}

// structured fields for overlay header line
if(data.address)
{
setAddressComponents(data.address)
}

})
.catch(err => console.warn("Geocode error:", err))

}



// current GPS location

function useCurrentLocation()
{

if(!navigator.geolocation)
{
alert("GPS not supported by this browser")
return
}

navigator.geolocation.getCurrentPosition(

pos => {

const lat = pos.coords.latitude
const lon = pos.coords.longitude

setMarker(lat, lon)

fetchAddress(lat, lon)

setCoords(lat, lon)

},

err => {

alert("Location access denied or unavailable")

}

)

}



// event listeners

document.addEventListener("DOMContentLoaded", () => {

initMap()

document
.getElementById("locateBtn")
.addEventListener("click", locateFromInput)

document
.getElementById("useGPS")
.addEventListener("click", useCurrentLocation)

})