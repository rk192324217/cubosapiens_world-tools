const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const emptyState = document.getElementById("emptyState");
const mergeButton = document.getElementById("mergeButton");
const clearButton = document.getElementById("clearButton");
const fileCount = document.getElementById("fileCount");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

let orderedFiles = [];
let draggedId = null;

function setMessage(element, message) {
  element.querySelector("span").textContent = message;
  element.classList.toggle("is-visible", Boolean(message));
}

function clearMessages() {
  setMessage(errorMessage, "");
  setMessage(successMessage, "");
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatPageCount(pageCount) {
  if (!pageCount) {
    return "Reading pages";
  }

  if (pageCount === "Unknown") {
    return "Unknown pages";
  }

  return `${pageCount} page${pageCount === 1 ? "" : "s"}`;
}

function createFileId(file) {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function createPdfPreview(fileRecord) {
  try {
    const arrayBuffer = await fileRecord.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.3 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    fileRecord.pageCount = pdf.numPages;
    fileRecord.thumbnail = canvas.toDataURL("image/png");
  } catch (error) {
    fileRecord.pageCount = "Unknown";
    fileRecord.thumbnail = "";
    setMessage(errorMessage, `Could not read "${fileRecord.file.name}". Please confirm it is a valid PDF.`);
  } finally {
    renderFileList();
  }
}

function renderFileList() {
  const hasFiles = orderedFiles.length > 0;

  emptyState.style.display = hasFiles ? "none" : "grid";
  fileCount.textContent = hasFiles
    ? `${orderedFiles.length} PDF${orderedFiles.length === 1 ? "" : "s"} loaded`
    : "No PDFs loaded";
  mergeButton.disabled = orderedFiles.length < 2;
  clearButton.disabled = orderedFiles.length === 0;

  fileList.querySelectorAll(".pdf-card").forEach((card) => card.remove());

  orderedFiles.forEach((fileRecord) => {
    const card = document.createElement("article");
    card.className = "pdf-card";
    card.draggable = true;
    card.dataset.id = fileRecord.id;
    card.setAttribute("aria-label", `${fileRecord.file.name}, merge position ${orderedFiles.indexOf(fileRecord) + 1}`);

    const safeName = escapeAttribute(fileRecord.file.name);

    card.innerHTML = `
      <div class="drag-handle" title="Drag to reorder" aria-hidden="true">
        <i class="fa-solid fa-grip-vertical"></i>
      </div>
      <div class="thumbnail-frame">
        ${fileRecord.thumbnail
          ? `<img src="${fileRecord.thumbnail}" alt="First page preview of ${safeName}">`
          : `<i class="fa-solid fa-spinner thumbnail-loading" aria-hidden="true"></i>`}
      </div>
      <div class="file-info">
        <p class="file-name"></p>
        <div class="file-meta">
          <span><i class="fa-solid fa-hard-drive" aria-hidden="true"></i>${formatFileSize(fileRecord.file.size)}</span>
          <span><i class="fa-regular fa-file-lines" aria-hidden="true"></i>${formatPageCount(fileRecord.pageCount)}</span>
        </div>
      </div>
      <button class="remove-button" type="button" aria-label="Remove ${safeName}">
        <i class="fa-solid fa-trash" aria-hidden="true"></i>
      </button>
    `;

    card.querySelector(".file-name").textContent = fileRecord.file.name;
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("dragleave", handleDragLeave);
    card.addEventListener("drop", handleDrop);
    card.addEventListener("dragend", handleDragEnd);
    card.querySelector(".remove-button").addEventListener("click", () => removeFile(fileRecord.id));

    fileList.appendChild(card);
  });
}

function isPdfFile(file) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function addFiles(fileListItems) {
  clearMessages();
  const incomingFiles = Array.from(fileListItems);
  const invalidFiles = incomingFiles.filter((file) => !isPdfFile(file));
  const pdfFiles = incomingFiles.filter(isPdfFile);

  if (invalidFiles.length) {
    setMessage(errorMessage, "Only PDF files are supported. Non-PDF files were skipped.");
  }

  if (!pdfFiles.length) {
    return;
  }

  const newRecords = pdfFiles.map((file) => ({
    id: createFileId(file),
    file,
    pageCount: null,
    thumbnail: "",
  }));

  orderedFiles = [...orderedFiles, ...newRecords];
  renderFileList();
  newRecords.forEach(createPdfPreview);
}

function removeFile(id) {
  clearMessages();
  orderedFiles = orderedFiles.filter((fileRecord) => fileRecord.id !== id);
  renderFileList();
}

function handleDragStart(event) {
  draggedId = event.currentTarget.dataset.id;
  event.currentTarget.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedId);
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
  event.dataTransfer.dropEffect = "move";
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("drag-over");
}

function handleDrop(event) {
  event.preventDefault();
  const targetId = event.currentTarget.dataset.id;
  event.currentTarget.classList.remove("drag-over");

  if (!draggedId || draggedId === targetId) {
    return;
  }

  const fromIndex = orderedFiles.findIndex((fileRecord) => fileRecord.id === draggedId);
  const toIndex = orderedFiles.findIndex((fileRecord) => fileRecord.id === targetId);

  if (fromIndex === -1 || toIndex === -1) {
    return;
  }

  const [movedFile] = orderedFiles.splice(fromIndex, 1);
  orderedFiles.splice(toIndex, 0, movedFile);
  renderFileList();
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove("dragging");
  fileList.querySelectorAll(".drag-over").forEach((card) => card.classList.remove("drag-over"));
  draggedId = null;
}

function setMergingState(isMerging) {
  mergeButton.disabled = isMerging || orderedFiles.length < 2;
  clearButton.disabled = isMerging || orderedFiles.length === 0;
  fileInput.disabled = isMerging;
  mergeButton.innerHTML = isMerging
    ? `<i class="fa-solid fa-spinner" aria-hidden="true"></i><span>Merging...</span>`
    : `<i class="fa-solid fa-layer-group" aria-hidden="true"></i><span>Merge PDFs</span>`;
}

async function mergePdfs() {
  if (orderedFiles.length < 2) {
    return;
  }

  clearMessages();
  setMergingState(true);

  try {
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const fileRecord of orderedFiles) {
      const arrayBuffer = await fileRecord.file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "merged_output.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);

    setMessage(successMessage, "Merged PDF download has started.");
  } catch (error) {
    setMessage(errorMessage, "Something went wrong while merging. Please try again with valid PDF files.");
  } finally {
    setMergingState(false);
  }
}

uploadZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadZone.classList.add("drag-active");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("drag-active");
});

uploadZone.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadZone.classList.remove("drag-active");
  addFiles(event.dataTransfer.files);
});

uploadZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", (event) => {
  addFiles(event.target.files);
  event.target.value = "";
});

mergeButton.addEventListener("click", mergePdfs);

clearButton.addEventListener("click", () => {
  clearMessages();
  orderedFiles = [];
  fileInput.value = "";
  renderFileList();
});

renderFileList();
