// OVERLAY MODULE
// Handles overlay data and rendering

const overlayData =
{
location: "",    // full display_name from Nominatim
city:     "",    // city / town / village
state:    "",    // state / province
country:  "",    // country name
countryCode: "", // 2-letter ISO code for flag emoji
lat:  "",
lon:  "",
date: "",
time: ""
}



// update full location string + structured fields

function setLocation(name)
{

overlayData.location = name

renderOverlay()

}


// store structured address components from Nominatim

function setAddressComponents(addressObj)
{

overlayData.city =
addressObj.city ||
addressObj.town ||
addressObj.village ||
addressObj.suburb ||
addressObj.county ||
""

overlayData.state =
addressObj.state ||
addressObj.province ||
""

overlayData.country =
addressObj.country || ""

overlayData.countryCode =
(addressObj.country_code || "").toUpperCase()

renderOverlay()

}



// convert country code → flag emoji

function countryCodeToFlag(code)
{

if(!code || code.length !== 2) return ""

return [...code.toUpperCase()]
.map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
.join("")

}



// update coordinates

function setCoords(lat, lon)
{

overlayData.lat = lat.toFixed(6)

overlayData.lon = lon.toFixed(6)

renderOverlay()

}



// update date

function setDate(date)
{

overlayData.date = date

renderOverlay()

}



// update time

function setTime(time)
{

overlayData.time = time

renderOverlay()

}



// render overlay DOM labels + re-render canvas preview

function renderOverlay()
{

const flag = countryCodeToFlag(overlayData.countryCode)

const cityLine =
[overlayData.city, overlayData.state, overlayData.country]
.filter(Boolean)
.join(", ")

document.getElementById("ovLocation").innerText =
(cityLine ? cityLine + " " + flag : overlayData.location).trim()

document.getElementById("ovLat").innerText =
overlayData.lat ? "Lat " + overlayData.lat : ""

document.getElementById("ovLon").innerText =
overlayData.lon ? "Lon " + overlayData.lon : ""

document.getElementById("ovDate").innerText =
overlayData.date

document.getElementById("ovTime").innerText =
overlayData.time

const img = document.getElementById("img")

if(img && img.src && img.naturalWidth > 0)
{
updatePreview()
}

}