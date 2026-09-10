let isRendering = false

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MAX_CANVAS_DIM   = 4096   // Safari iOS hard cap
const REFERENCE_WIDTH  = 1200   // baseline for proportional scaling
const OVERLAY_H_RATIO  = 0.13   // overlay height = 13% of image height
const OVERLAY_W_RATIO  = 0.92   // overlay width  = 92% of image width
const MIN_OVERLAY_H    = 110    // px — absolute floor regardless of image size
const MAX_OVERLAY_H    = 340    // px — cap so it doesn't eat the whole image

// ─────────────────────────────────────────────
// CLAMP
// ─────────────────────────────────────────────
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

// ─────────────────────────────────────────────
// MEASURE WRAPPED TEXT HEIGHT
// ─────────────────────────────────────────────
function measureTextBlockHeight(ctx, text, maxWidth, lineHeight, maxLines) {
  if (!text) return lineHeight
  const words = text.split(" ")
  let line = "", lines = 0
  for (const word of words) {
    const test = line ? line + " " + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines++
      line = word
      if (lines >= maxLines) break
    } else {
      line = test
    }
  }
  if (line) lines++
  return Math.min(lines, maxLines) * lineHeight
}

// ─────────────────────────────────────────────
// MAIN RENDER
// ─────────────────────────────────────────────
async function renderFinalImage() {
  if (isRendering) return null

  const originalImg = document.getElementById("img")
  if (!originalImg || !originalImg.src || originalImg.naturalWidth === 0) return null

  isRendering = true

  try {
    // ── 1. Resolve final render dimensions ──────────────────────────────────
    // For file export we NEVER multiply by devicePixelRatio — the native image
    // pixels are already the full resolution.  DPR only matters when drawing
    // to an on-screen canvas for display purposes.
    let renderW = originalImg.naturalWidth
    let renderH = originalImg.naturalHeight

    // Downsample if larger than browser canvas cap (silent blank canvas bug)
    if (renderW > MAX_CANVAS_DIM || renderH > MAX_CANVAS_DIM) {
      const ratio = Math.min(MAX_CANVAS_DIM / renderW, MAX_CANVAS_DIM / renderH)
      renderW = Math.round(renderW * ratio)
      renderH = Math.round(renderH * ratio)
    }

    const W = renderW
    const H = renderH

    const canvas  = document.createElement("canvas")
    const ctx     = canvas.getContext("2d")
    canvas.width  = W
    canvas.height = H

    // Draw source image at final render size
    ctx.drawImage(originalImg, 0, 0, W, H)

    // ── 2. Proportional scale factor ────────────────────────────────────────
    // Everything is sized relative to the actual render width, anchored to
    // REFERENCE_WIDTH so the overlay looks the same on a 800px image as a
    // 4032px image — just rendered at higher pixel density.
    const scale = W / REFERENCE_WIDTH   // e.g. 3.36 for 4032px image — NO clamping

    // ── 3. Typography ────────────────────────────────────────────────────────
    // Scale up with the image, but keep an absolute pixel floor so tiny images
    // still have readable text.
    const FS_CITY = Math.max(Math.round(30 * scale), 22)
    const FS_INFO = Math.max(Math.round(19 * scale), 15)
    const LH_INFO = Math.round(FS_INFO * 1.45)

    // ── 4. Overlay box dimensions ───────────────────────────────────────────
    const MARGIN  = Math.max(Math.round(H * 0.018), 10)
    const OVW     = Math.round(W * OVERLAY_W_RATIO)
    const OVX     = Math.round((W - OVW) / 2)
    const RADIUS  = Math.max(Math.round(14 * scale), 8)
    const PAD     = Math.max(Math.round(14 * scale), 10)

    // Overlay height: proportional to image, but clamped to sensible range
    const OVH = clamp(Math.round(H * OVERLAY_H_RATIO), MIN_OVERLAY_H, MAX_OVERLAY_H)
    const OVY = H - OVH - MARGIN

    // ── 5. Thumbnail (map) ──────────────────────────────────────────────────
    // Sized relative to overlay height so it always fits inside the box
    const MAP_SIZE = Math.round(OVH * 0.72)
    const MAP_X    = OVX + PAD
    const MAP_Y    = OVY + Math.round((OVH - MAP_SIZE) / 2)

    // ── 6. Text layout ──────────────────────────────────────────────────────
    const TEXT_X = MAP_X + MAP_SIZE + Math.round(PAD * 1.6)
    const TEXT_W = (OVX + OVW) - TEXT_X - PAD

    // Measure actual content height for vertical centering
    ctx.font = FS_INFO + "px -apple-system, BlinkMacSystemFont, Arial, sans-serif"

    const addressHeight = measureTextBlockHeight(
      ctx,
      overlayData.location || "",
      TEXT_W,
      LH_INFO,
      2
    )

    const hasCoords = overlayData.lat !== "" && overlayData.lon !== ""
    const textBlockH =
      FS_CITY              // city line
      + Math.round(FS_CITY * 0.28) // gap after city
      + addressHeight      // address (1–2 lines)
      + (hasCoords ? LH_INFO : 0)  // coords line
      + LH_INFO            // date/time line

    const CONTENT_CENTER_Y = OVY + OVH / 2
    const TEXT_Y = CONTENT_CENTER_Y - textBlockH / 2

    // ── 7. Draw overlay background ──────────────────────────────────────────
    ctx.save()
    roundRect(ctx, OVX, OVY, OVW, OVH, RADIUS)
    ctx.fillStyle = "rgba(12, 12, 12, 0.82)"
    ctx.fill()
    ctx.restore()

    // ── 8. Map thumbnail ─────────────────────────────────────────────────────
    const lat = overlayData.lat
    const lon = overlayData.lon

    if (lat !== "" && lon !== "") {
      const esriURL =
        "https://server.arcgisonline.com/ArcGIS/rest/services/" +
        "World_Imagery/MapServer/export" +
        "?bbox=" + getBbox(parseFloat(lat), parseFloat(lon), 0.001) +
        "&bboxSR=4326&size=512,512&imageSR=102100&format=png&f=image"

      try {
        const mapImg = await loadImage(esriURL)
        ctx.save()
        roundRect(ctx, MAP_X, MAP_Y, MAP_SIZE, MAP_SIZE, RADIUS * 0.45)
        ctx.clip()
        ctx.drawImage(mapImg, MAP_X, MAP_Y, MAP_SIZE, MAP_SIZE)
        ctx.restore()
      } catch (e) {
        ctx.save()
        roundRect(ctx, MAP_X, MAP_Y, MAP_SIZE, MAP_SIZE, RADIUS * 0.45)
        ctx.fillStyle = "#162016"
        ctx.fill()
        ctx.restore()
      }

      drawLocationPin(ctx, MAP_X + MAP_SIZE / 2, MAP_Y + MAP_SIZE / 2, MAP_SIZE * 0.10)
    }

    // ── 9. Text rendering ────────────────────────────────────────────────────
    ctx.textBaseline = "top"
    let TY = TEXT_Y

    // City + flag
    const cityParts = [overlayData.city, overlayData.state, overlayData.country].filter(Boolean)
    const cityText  = cityParts.join(", ")
    const flagCode  = (overlayData.countryCode || "").toLowerCase()

    const FLAG_H   = Math.round(FS_CITY * 0.68)
    const FLAG_W   = Math.round(FLAG_H * (4 / 3))
    const FLAG_GAP = Math.round(FS_CITY * 0.22)

    ctx.font      = "700 " + FS_CITY + "px -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    ctx.fillStyle = "#ffffff"

    const availCityW  = TEXT_W - (flagCode ? FLAG_W + FLAG_GAP : 0)
    const cityClipped = clipText(ctx, cityText, availCityW)
    const cityTextW   = ctx.measureText(cityClipped).width

    ctx.fillText(cityClipped, TEXT_X, TY)

    if (flagCode) {
      const flagURL = "https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/flags/4x3/" + flagCode + ".svg"
      const flagX   = TEXT_X + cityTextW + FLAG_GAP
      const flagY   = TY + Math.round((FS_CITY - FLAG_H) / 2)

      try {
        const flagImg = await loadImage(flagURL)
        ctx.save()
        roundRect(ctx, flagX, flagY, FLAG_W, FLAG_H, Math.round(FLAG_H * 0.12))
        ctx.clip()
        ctx.drawImage(flagImg, flagX, flagY, FLAG_W, FLAG_H)
        ctx.restore()
      } catch (e) {
        console.warn("Flag load failed:", flagCode)
      }
    }

    TY += FS_CITY + Math.round(FS_CITY * 0.28)

    // Address (wrapped, max 2 lines)
    ctx.font      = FS_INFO + "px -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.86)"
    TY = drawWrappedText(ctx, overlayData.location || "", TEXT_X, TY, TEXT_W, LH_INFO, 2)

    // Coordinates
    if (hasCoords) {
      const coordLine = "Lat " + lat + "°   Long " + lon + "°"
      ctx.fillStyle = "rgba(255,255,255,0.70)"
      ctx.fillText(clipText(ctx, coordLine, TEXT_W), TEXT_X, TY)
      TY += LH_INFO
    }

    // Date / time
    ctx.fillStyle = "rgba(255,255,255,0.70)"
    const dtLine = buildDateTimeLine()
    ctx.fillText(clipText(ctx, dtLine, TEXT_W), TEXT_X, TY)

    isRendering = false
    return canvas

  } catch (err) {
    console.error("Render error:", err)
    isRendering = false
    return null
  }
}

// ─────────────────────────────────────────────
// LOCATION PIN
// ─────────────────────────────────────────────
function drawLocationPin(ctx, cx, cy, r) {
  ctx.save()

  const bodyR   = r
  const pinH    = r * 2.4
  const tipY    = cy + pinH * 0.5
  const centerY = cy - pinH * 0.1

  ctx.shadowColor   = "rgba(0,0,0,0.55)"
  ctx.shadowBlur    = r * 0.8
  ctx.shadowOffsetY = r * 0.3

  ctx.beginPath()
  ctx.arc(cx, centerY, bodyR, Math.PI, 0, false)
  ctx.bezierCurveTo(cx + bodyR, centerY + bodyR * 0.8, cx + bodyR * 0.4, tipY - r * 0.3, cx, tipY)
  ctx.bezierCurveTo(cx - bodyR * 0.4, tipY - r * 0.3, cx - bodyR, centerY + bodyR * 0.8, cx - bodyR, centerY)
  ctx.closePath()
  ctx.fillStyle = "#e53935"
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.arc(cx, centerY, bodyR * 0.38, 0, Math.PI * 2)
  ctx.fillStyle = "white"
  ctx.fill()

  ctx.restore()
}

// ─────────────────────────────────────────────
// DATE / TIME
// ─────────────────────────────────────────────
function buildDateTimeLine() {
  const dateStr = document.getElementById("date").value
  const timeStr = document.getElementById("time").value

  let datePart = ""
  if (dateStr) {
    const d       = new Date(dateStr + "T00:00:00")
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" })
    const day     = String(d.getDate()).padStart(2, "0")
    const month   = String(d.getMonth() + 1).padStart(2, "0")
    const year    = d.getFullYear()
    datePart      = weekday + ", " + day + "/" + month + "/" + year
  }

  let timePart = ""
  if (timeStr) {
    const [h, m] = timeStr.split(":").map(Number)
    const ampm   = h >= 12 ? "PM" : "AM"
    const h12    = h % 12 === 0 ? 12 : h % 12
    timePart     = String(h12).padStart(2, "0") + ":" + String(m).padStart(2, "0") + " " + ampm
  }

  return [datePart, timePart, getGMTOffset()].filter(Boolean).join("  ")
}

function getGMTOffset() {
  const offset = -new Date().getTimezoneOffset()
  const sign   = offset >= 0 ? "+" : "-"
  const abs    = Math.abs(offset)
  const h      = String(Math.floor(abs / 60)).padStart(2, "0")
  const m      = String(abs % 60).padStart(2, "0")
  return "GMT" + sign + h + ":" + m
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function getBbox(lat, lon, delta) {
  return [
    (lon - delta).toFixed(6),
    (lat - delta).toFixed(6),
    (lon + delta).toFixed(6),
    (lat + delta).toFixed(6)
  ].join(",")
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  if (!text) return y + lineHeight

  const words = text.split(" ")
  let line  = ""
  let lines = []

  for (const word of words) {
    const test = line ? line + " " + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
      if (lines.length >= maxLines) break
    } else {
      line = test
    }
  }

  if (lines.length < maxLines && line) {
    lines.push(line)
  } else if (lines.length >= maxLines && line) {
    lines[maxLines - 1] = clipText(ctx, lines[maxLines - 1] + " " + line, maxWidth)
  }

  for (const l of lines) {
    ctx.fillText(l, x, y)
    y += lineHeight
  }

  return y
}

function clipText(ctx, text, maxWidth) {
  if (!text) return ""
  if (ctx.measureText(text).width <= maxWidth) return text
  while (text.length > 0 && ctx.measureText(text + "…").width > maxWidth) {
    text = text.slice(0, -1)
  }
  return text + "…"
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img       = new Image()
    img.crossOrigin = "anonymous"
    img.onload      = () => resolve(img)
    img.onerror     = reject
    img.src         = src
  })
}

async function updatePreview() {
  if (isRendering) return
  const img = document.getElementById("img")
  if (!img || !img.src || img.naturalWidth === 0) return

  clearTimeout(updatePreview._timer)
  updatePreview._timer = setTimeout(async () => {
    await renderFinalImage()
  }, 100)
}