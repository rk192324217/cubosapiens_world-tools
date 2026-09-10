// EXPORT MODULE
// Renders image and shows a preview modal before downloading

document.addEventListener("DOMContentLoaded", () => {

document
.getElementById("renderBtn")
.addEventListener("click", openPreviewModal)

document
.getElementById("modalDownload")
.addEventListener("click", downloadFromModal)

document
.getElementById("modalClose")
.addEventListener("click", closePreviewModal)

// close when clicking dark backdrop
document
.getElementById("previewModal")
.addEventListener("click", e => {
if(e.target === document.getElementById("previewModal"))
{
closePreviewModal()
}
})

// close on Escape key
document.addEventListener("keydown", e => {
if(e.key === "Escape") closePreviewModal()
})

})


// ── Open modal ────────────────────────────────────────

async function openPreviewModal()
{

const originalImg = document.getElementById("img")

if(!originalImg || !originalImg.src || originalImg.naturalWidth === 0)
{
alert("Please upload a photo first.")
return
}

// Show modal with loading state
const modal       = document.getElementById("previewModal")
const previewImg  = document.getElementById("modalPreviewImg")
const spinner     = document.getElementById("modalSpinner")
const downloadBtn = document.getElementById("modalDownload")

modal.classList.add("open")
spinner.style.display    = "flex"
previewImg.style.display = "none"
downloadBtn.disabled     = true


// Render
const canvas = await renderFinalImage()

spinner.style.display    = "none"

if(!canvas)
{
alert("Render failed. Please try again.")
closePreviewModal()
return
}

// Show rendered preview
previewImg.src           = canvas.toDataURL("image/jpeg", 0.95)
previewImg.style.display = "block"
downloadBtn.disabled     = false

// Store canvas for download
modal._canvas = canvas

}


// ── Download from modal ───────────────────────────────

function downloadFromModal()
{

const modal = document.getElementById("previewModal")

if(!modal._canvas) return

const link      = document.createElement("a")
link.download   = generateFileName()
link.href       = modal._canvas.toDataURL("image/jpeg", 0.95)
link.click()

  // increment real counter in Cloudflare KV
  incrementDownload()

}


// ── Close modal ───────────────────────────────────────

function closePreviewModal()
{

const modal = document.getElementById("previewModal")

modal.classList.remove("open")

const previewImg = document.getElementById("modalPreviewImg")
previewImg.src   = ""

modal._canvas    = null

}


// ── File name ─────────────────────────────────────────

function generateFileName()
{

const now  = new Date()
const date = now.toISOString().slice(0, 10)
const time = now.toTimeString().slice(0, 5).replace(":", "-")

return "CuboGPS-" + date + "_" + time + ".jpg"

}