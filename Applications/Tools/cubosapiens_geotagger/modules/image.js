const MIN_WIDTH = 250 

document.addEventListener("DOMContentLoaded", () => {

    const imgInput = document.getElementById("imgInput")
    imgInput.addEventListener("change", handleUpload)

})

function handleUpload(event)
{

    const file = event.target.files[0]

    if(!file) return

    const reader = new FileReader()

    reader.onload = function(e)
    {

        const img = document.getElementById("img")

        img.src = e.target.result

        img.onload = function()
        {

            // ── Width check ───────────────────────────────
            if(img.naturalWidth < MIN_WIDTH)
            {
                const currentWidth = img.naturalWidth

                // Reset back to placeholder state
                img.src = ""
                img.classList.remove("loaded")
                document.getElementById("imgPlaceholder").classList.remove("hidden")
                document.getElementById("overlay").classList.add("hidden")

                // Clear file input so user can re-select
                event.target.value = ""

                showUploadError(
                    "Image too narrow",
                    "Your image is " + currentWidth + "px wide. " +
                    "Please upload an image at least " + MIN_WIDTH + "px wide " +
                    "so the GPS overlay fits properly."
                )

                return
            }

            // ── All good — show image ─────────────────────
            img.classList.add("loaded")
            document.getElementById("imgPlaceholder").classList.add("hidden")
            document.getElementById("overlay").classList.remove("hidden")
            hideUploadError()
            updatePreview()

        }

    }

    reader.readAsDataURL(file)

}


// Show friendly error below the image box

function showUploadError(title, message)
{

    let el = document.getElementById("uploadError")

    if(!el)
    {
        el = document.createElement("div")
        el.id = "uploadError"
        const imageBox = document.querySelector(".image-box")
        imageBox.parentNode.insertBefore(el, imageBox.nextSibling)
    }

    el.innerHTML =
        "<strong>⚠ " + title + "</strong><span>" + message + "</span>"

    el.style.display = "flex"

}

function hideUploadError()
{

    const el = document.getElementById("uploadError")
    if(el) el.style.display = "none"

}