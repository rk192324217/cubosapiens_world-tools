/* ============================================================
   Cubo Random Text Generator — script.js
   ============================================================ */

// ── 1. Dictionary & Word Banks ──

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", 
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", 
  "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud", 
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", 
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", 
  "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", 
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", 
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", 
  "est", "laborum"
];

const ENGLISH_WORDS = [
  "algorithm", "application", "database", "developer", "ecosystem", "framework", 
  "interface", "javascript", "network", "parameter", "responsive", "security", 
  "server", "software", "variable", "constant", "function", "galaxy", "gravity", 
  "quantum", "nebula", "stellar", "horizon", "journey", "adventure", "forest", 
  "ocean", "summit", "climate", "glacier", "mountain", "valley", "canyon", "desert", 
  "volcano", "tsunami", "earthquake", "cyclone", "hurricane", "blizzard", "avalanche", 
  "aurora", "eclipse", "comet", "asteroid", "meteor", "constellation", "supernova", 
  "blackhole", "telescope", "microscope", "laboratory", "experiment", "discovery", 
  "innovation", "technology", "artificial", "intelligence", "automation", "robotics", 
  "cybernetics", "nanotechnology", "biotechnology", "genetics", "evolution", "mutation", 
  "natural", "selection", "predator", "prey", "camouflage", "migration", "hibernation", 
  "photosynthesis", "chlorophyll", "ecosystem", "biodiversity", "conservation", 
  "renewable", "energy", "solar", "turbine", "geothermal", "hydroelectric", "biomass", 
  "infrastructure", "metropolis", "architecture", "monument", "cathedral", "skyscraper", 
  "aqueduct", "viaduct", "suspension", "bridge", "tunnel", "subway", "locomotive", 
  "aerodynamics", "supersonic", "spacecraft", "astronaut", "cosmonaut", "satellite", 
  "orbit", "trajectory", "telecommunication", "fiber", "optics", "broadband", "wireless", 
  "bluetooth", "cryptography", "encryption", "decryption", "hashing", "signature", 
  "blockchain", "ledger", "transaction", "currency", "inflation", "recession", 
  "market", "portfolio", "investment", "dividend", "commodity", "derivative", 
  "arbitrage", "entrepreneur", "corporation", "syndicate", "consortium", "alliance", 
  "strategy", "tactics", "maneuver", "victory", "triumph", "celebration", "festival"
];

const MOCK_NAMES = [
  "Alex Rivera", "Jordan Smith", "Taylor Chen", "Morgan Davis", "Sam Wilson", 
  "Chris Evans", "Jamie Oliver", "Pat Taylor", "Robin Hood", "Drew Barry", 
  "Casey Jones", "Riley Reid", "Skyler White", "Jesse Pinkman", "Walter Hartwell"
];

const MOCK_CATEGORIES = ["Electronics", "Apparel", "Home & Garden", "Books", "Sports", "Health"];

const MOCK_ROLES = ["Admin", "Editor", "Contributor", "Subscriber", "Moderator"];

// ── 2. Helper Functions ──

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate capitalized word
function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Generate a random sentence from a word list
function generateRawSentence(wordList, minWords, maxWords) {
  const len = getRandomInt(minWords, maxWords);
  const sentenceWords = [];
  
  for (let i = 0; i < len; i++) {
    sentenceWords.push(getRandomElement(wordList));
  }
  
  // Add comma optionally
  if (len > 8 && Math.random() > 0.75) {
    const commaIndex = getRandomInt(3, len - 3);
    sentenceWords[commaIndex] += ",";
  }
  
  return capitalize(sentenceWords.join(" ")) + ".";
}

// Generate a random paragraph from a word list
function generateRawParagraph(wordList, minSentences, maxSentences, minWords, maxWords) {
  const len = getRandomInt(minSentences, maxSentences);
  const sentences = [];
  
  for (let i = 0; i < len; i++) {
    sentences.push(generateRawSentence(wordList, minWords, maxWords));
  }
  
  return sentences.join(" ");
}

// ── 3. DOM References & State ──

const state = {
  currentType: "lorem",
  theme: "light",
  isFullscreen: false
};

const dom = {
  themeToggle: document.getElementById("themeToggle"),
  btnFullscreen: document.getElementById("btnFullscreen"),
  typeButtons: document.querySelectorAll(".type-btn"),
  
  // Settings Options
  optsCount: document.getElementById("optsCount"),
  optsLorem: document.getElementById("optsLorem"),
  optsSentenceWords: document.getElementById("optsSentenceWords"),
  optsParagraphSentences: document.getElementById("optsParagraphSentences"),
  optsPasswords: document.getElementById("optsPasswords"),
  optsMock: document.getElementById("optsMock"),
  optsFormat: document.getElementById("optsFormat"),
  
  // Inputs
  labelCount: document.getElementById("labelCount"),
  inputCount: document.getElementById("inputCount"),
  valCount: document.getElementById("valCount"),
  chkStartLorem: document.getElementById("chkStartLorem"),
  
  inputMinSentenceWords: document.getElementById("inputMinSentenceWords"),
  inputMaxSentenceWords: document.getElementById("inputMaxSentenceWords"),
  valSentenceWords: document.getElementById("valSentenceWords"),
  
  inputMinParagraphSentences: document.getElementById("inputMinParagraphSentences"),
  inputMaxParagraphSentences: document.getElementById("inputMaxParagraphSentences"),
  valParagraphSentences: document.getElementById("valParagraphSentences"),
  
  inputPasswordLen: document.getElementById("inputPasswordLen"),
  valPassLen: document.getElementById("valPassLen"),
  chkPassUpper: document.getElementById("chkPassUpper"),
  chkPassLower: document.getElementById("chkPassLower"),
  chkPassNum: document.getElementById("chkPassNum"),
  chkPassSym: document.getElementById("chkPassSym"),
  chkPassReadable: document.getElementById("chkPassReadable"),
  
  selectMockType: document.getElementById("selectMockType"),
  selectFormat: document.getElementById("selectFormat"),
  optJsonFormat: document.getElementById("optJsonFormat"),
  
  // Action triggers
  btnGenerate: document.getElementById("btnGenerate"),
  btnCopy: document.getElementById("btnCopy"),
  btnDownload: document.getElementById("btnDownload"),
  btnClear: document.getElementById("btnClear"),
  
  // Output area
  textOutput: document.getElementById("textOutput"),
  
  // Stats
  statParagraphs: document.getElementById("statParagraphs"),
  statSentences: document.getElementById("statSentences"),
  statWords: document.getElementById("statWords"),
  statCharacters: document.getElementById("statCharacters"),
  statReadingTime: document.getElementById("statReadingTime"),
  
  // Toast container
  toastContainer: document.getElementById("toastContainer")
};

// ── 4. Theme & Fullscreen Handling ──

function initTheme() {
  const savedTheme = localStorage.getItem("cubo-text-gen-theme") || "light";
  setTheme(savedTheme);
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("cubo-text-gen-theme", theme);
}

dom.themeToggle.addEventListener("click", () => {
  setTheme(state.theme === "light" ? "dark" : "light");
});

dom.btnFullscreen.addEventListener("click", () => {
  state.isFullscreen = !state.isFullscreen;
  if (state.isFullscreen) {
    document.body.classList.add("fullscreen-active");
    dom.btnFullscreen.innerHTML = '<i class="fa-solid fa-minimize"></i>';
    showToast("Fullscreen Mode enabled");
  } else {
    document.body.classList.remove("fullscreen-active");
    dom.btnFullscreen.innerHTML = '<i class="fa-solid fa-expand"></i>';
  }
});

// ESC exits fullscreen
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.isFullscreen) {
    state.isFullscreen = false;
    document.body.classList.remove("fullscreen-active");
    dom.btnFullscreen.innerHTML = '<i class="fa-solid fa-expand"></i>';
  }
});

// ── 5. Toast Notifications ──

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
  
  dom.toastContainer.appendChild(toast);
  
  // Fade out and remove
  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 2200);
}

// ── 6. UI Settings & Tab Navigation ──

function updateUISettings(type) {
  state.currentType = type;
  
  // Toggle active class on tab buttons
  dom.typeButtons.forEach(btn => {
    if (btn.dataset.type === type) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Hide all option subgroups first
  dom.optsCount.style.display = "none";
  dom.optsLorem.style.display = "none";
  dom.optsSentenceWords.style.display = "none";
  dom.optsParagraphSentences.style.display = "none";
  dom.optsPasswords.style.display = "none";
  dom.optsMock.style.display = "none";
  
  // Show standard formats and reset
  dom.optJsonFormat.style.display = "none";
  if (dom.selectFormat.value === "json" && type !== "mock" && type !== "words" && type !== "sentences" && type !== "paragraphs" && type !== "lorem") {
    dom.selectFormat.value = "plain";
  }

  // Set default counts and displays based on selected Type
  switch (type) {
    case "lorem":
      dom.optsCount.style.display = "flex";
      dom.optsLorem.style.display = "flex";
      dom.labelCount.textContent = "Paragraph Count";
      dom.inputCount.min = "1";
      dom.inputCount.max = "30";
      dom.inputCount.value = "5";
      dom.valCount.textContent = "5";
      dom.optJsonFormat.style.display = "block";
      break;
    case "words":
      dom.optsCount.style.display = "flex";
      dom.labelCount.textContent = "Word Count";
      dom.inputCount.min = "5";
      dom.inputCount.max = "500";
      dom.inputCount.value = "100";
      dom.valCount.textContent = "100";
      dom.optJsonFormat.style.display = "block";
      break;
    case "sentences":
      dom.optsCount.style.display = "flex";
      dom.optsSentenceWords.style.display = "flex";
      dom.labelCount.textContent = "Sentence Count";
      dom.inputCount.min = "1";
      dom.inputCount.max = "100";
      dom.inputCount.value = "10";
      dom.valCount.textContent = "10";
      dom.optJsonFormat.style.display = "block";
      break;
    case "paragraphs":
      dom.optsCount.style.display = "flex";
      dom.optsSentenceWords.style.display = "flex";
      dom.optsParagraphSentences.style.display = "flex";
      dom.labelCount.textContent = "Paragraph Count";
      dom.inputCount.min = "1";
      dom.inputCount.max = "30";
      dom.inputCount.value = "5";
      dom.valCount.textContent = "5";
      dom.optJsonFormat.style.display = "block";
      break;
    case "passwords":
      dom.optsCount.style.display = "flex";
      dom.optsPasswords.style.display = "flex";
      dom.labelCount.textContent = "Password Count";
      dom.inputCount.min = "1";
      dom.inputCount.max = "50";
      dom.inputCount.value = "5";
      dom.valCount.textContent = "5";
      break;
    case "mock":
      dom.optsCount.style.display = "flex";
      dom.optsMock.style.display = "flex";
      dom.labelCount.textContent = "Records Count";
      dom.inputCount.min = "1";
      dom.inputCount.max = "100";
      dom.inputCount.value = "10";
      dom.valCount.textContent = "10";
      dom.optJsonFormat.style.display = "block";
      
      // Auto switch format to json for user/product/todo mock structures
      if (dom.selectMockType.value !== "posts") {
        dom.selectFormat.value = "json";
      }
      break;
  }
}

// Attach Tab button click events
dom.typeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    updateUISettings(btn.dataset.type);
  });
});

// Update value displays for sliders
dom.inputCount.addEventListener("input", (e) => {
  dom.valCount.textContent = e.target.value;
});

dom.inputPasswordLen.addEventListener("input", (e) => {
  dom.valPassLen.textContent = e.target.value;
});

// Min/Max validator syncs
function handleDualRangeSync(minEl, maxEl, valEl, suffix = "") {
  let min = parseInt(minEl.value);
  let max = parseInt(maxEl.value);
  
  if (min > max) {
    max = min;
    maxEl.value = min;
  }
  
  valEl.textContent = `${min} - ${max}${suffix}`;
}

[dom.inputMinSentenceWords, dom.inputMaxSentenceWords].forEach(el => {
  el.addEventListener("change", () => {
    handleDualRangeSync(dom.inputMinSentenceWords, dom.inputMaxSentenceWords, dom.valSentenceWords);
  });
});

[dom.inputMinParagraphSentences, dom.inputMaxParagraphSentences].forEach(el => {
  el.addEventListener("change", () => {
    handleDualRangeSync(dom.inputMinParagraphSentences, dom.inputMaxParagraphSentences, dom.valParagraphSentences);
  });
});

// When Mock Type changes, adjust format selection automatically
dom.selectMockType.addEventListener("change", () => {
  if (dom.selectMockType.value === "posts") {
    dom.selectFormat.value = "markdown";
  } else {
    dom.selectFormat.value = "json";
  }
});

// ── 7. Text Generation Core Logic ──

function generateText() {
  const count = parseInt(dom.inputCount.value);
  const format = dom.selectFormat.value;
  let generatedData = "";
  
  try {
    switch (state.currentType) {
      case "lorem":
        generatedData = generateLorem(count, format);
        break;
      case "words":
        generatedData = generateWords(count, format);
        break;
      case "sentences":
        generatedData = generateSentences(count, format);
        break;
      case "paragraphs":
        generatedData = generateParagraphs(count, format);
        break;
      case "passwords":
        generatedData = generatePasswords(count);
        break;
      case "mock":
        generatedData = generateMockData(count, format);
        break;
    }

    dom.textOutput.value = generatedData;
    updateStats(generatedData);
    showToast("Random text generated successfully!");
  } catch (error) {
    console.error(error);
    showToast("Error generating text. Check your config.", "error");
  }
}

// 1. Lorem Ipsum
function generateLorem(count, format) {
  const paragraphs = [];
  const startWithLorem = dom.chkStartLorem.checked;

  for (let i = 0; i < count; i++) {
    let p = generateRawParagraph(LOREM_WORDS, 4, 8, 8, 15);
    
    // Inject traditional opening
    if (i === 0 && startWithLorem) {
      const leading = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
      p = leading + p.charAt(0).toLowerCase() + p.slice(1);
    }
    paragraphs.push(p);
  }

  return formatOutput(paragraphs, format);
}

// 2. Words
function generateWords(count, format) {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(getRandomElement(ENGLISH_WORDS));
  }

  if (format === "json") {
    return JSON.stringify(words, null, 2);
  } else if (format === "html") {
    return words.map(w => `<span>${w}</span>`).join(" ");
  } else if (format === "markdown") {
    return words.map(w => `**${w}**`).join(" ");
  }
  return words.join(" ");
}

// 3. Sentences
function generateSentences(count, format) {
  const minW = parseInt(dom.inputMinSentenceWords.value);
  const maxW = parseInt(dom.inputMaxSentenceWords.value);
  const sentences = [];

  for (let i = 0; i < count; i++) {
    sentences.push(generateRawSentence(ENGLISH_WORDS, minW, maxW));
  }

  if (format === "json") {
    return JSON.stringify(sentences, null, 2);
  } else if (format === "html") {
    return sentences.map(s => `<li>${s}</li>`).join("\n");
  } else if (format === "markdown") {
    return sentences.map(s => `- ${s}`).join("\n");
  }
  return sentences.join(" ");
}

// 4. Paragraphs
function generateParagraphs(count, format) {
  const minW = parseInt(dom.inputMinSentenceWords.value);
  const maxW = parseInt(dom.inputMaxSentenceWords.value);
  const minS = parseInt(dom.inputMinParagraphSentences.value);
  const maxS = parseInt(dom.inputMaxParagraphSentences.value);
  const paragraphs = [];

  for (let i = 0; i < count; i++) {
    paragraphs.push(generateRawParagraph(ENGLISH_WORDS, minS, maxS, minW, maxW));
  }

  return formatOutput(paragraphs, format);
}

// 5. Passwords
function generatePasswords(count) {
  const len = parseInt(dom.inputPasswordLen.value);
  const u = dom.chkPassUpper.checked;
  const l = dom.chkPassLower.checked;
  const n = dom.chkPassNum.checked;
  const s = dom.chkPassSym.checked;
  const avoidConfusing = dom.chkPassReadable.checked;

  let upperPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lowerPool = "abcdefghijklmnopqrstuvwxyz";
  let numPool = "0123456789";
  let symPool = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (avoidConfusing) {
    upperPool = upperPool.replace(/[IO]/g, "");
    lowerPool = lowerPool.replace(/[loi]/g, "");
    numPool = numPool.replace(/[01]/g, "");
    symPool = symPool.replace(/[|]/g, "");
  }

  let fullPool = "";
  if (u) fullPool += upperPool;
  if (l) fullPool += lowerPool;
  if (n) fullPool += numPool;
  if (s) fullPool += symPool;

  if (!fullPool) {
    return "Please select at least one character set!";
  }

  const passwords = [];
  for (let i = 0; i < count; i++) {
    let p = "";
    // Ensure at least one char of each selected pool is included
    if (u) p += getRandomElement(upperPool);
    if (l) p += getRandomElement(lowerPool);
    if (n) p += getRandomElement(numPool);
    if (s) p += getRandomElement(symPool);

    while (p.length < len) {
      p += getRandomElement(fullPool);
    }
    // Shuffle the generated password
    p = p.split('').sort(() => 0.5 - Math.random()).join('');
    passwords.push(p);
  }

  return passwords.join("\n");
}

// 6. Mock Data
function generateMockData(count, format) {
  const schema = dom.selectMockType.value;
  const resultList = [];

  for (let i = 1; i <= count; i++) {
    switch (schema) {
      case "users":
        const name = getRandomElement(MOCK_NAMES);
        const user = {
          id: 1000 + i,
          name: name,
          username: name.toLowerCase().replace(/\s/g, "_"),
          email: `${name.toLowerCase().replace(/\s/g, ".")}@example.com`,
          role: getRandomElement(MOCK_ROLES),
          status: Math.random() > 0.2 ? "Active" : "Inactive",
          createdAt: new Date(Date.now() - getRandomInt(0, 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        resultList.push(user);
        break;

      case "products":
        const prod = {
          id: 5000 + i,
          name: `Cubo ${getRandomElement(ENGLISH_WORDS).toUpperCase()} Pro`,
          price: parseFloat((getRandomInt(10, 500) + Math.random()).toFixed(2)),
          category: getRandomElement(MOCK_CATEGORIES),
          inStock: Math.random() > 0.15,
          rating: parseFloat((3 + Math.random() * 2).toFixed(1)),
          sku: `CUBO-${getRandomInt(1000, 9999)}`,
          description: generateRawSentence(ENGLISH_WORDS, 6, 12)
        };
        resultList.push(prod);
        break;

      case "posts":
        const title = generateRawSentence(ENGLISH_WORDS, 4, 8).replace(/\./g, "");
        const post = {
          id: i,
          title: title,
          slug: title.toLowerCase().replace(/\s/g, "-"),
          author: getRandomElement(MOCK_NAMES),
          excerpt: generateRawSentence(ENGLISH_WORDS, 10, 20),
          content: generateRawParagraph(ENGLISH_WORDS, 3, 5, 8, 15),
          published: Math.random() > 0.3
        };
        resultList.push(post);
        break;

      case "todos":
        const todo = {
          id: 200 + i,
          task: `Verify ${getRandomElement(ENGLISH_WORDS)} functionality`,
          completed: Math.random() > 0.5,
          priority: getRandomElement(["High", "Medium", "Low"]),
          dueDate: new Date(Date.now() + getRandomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        resultList.push(todo);
        break;
    }
  }

  // Format the outputs
  if (schema === "posts" && format === "markdown") {
    let md = "";
    resultList.forEach(p => {
      md += `# ${p.title}\n\n`;
      md += `*Author: ${p.author}* | *Status: ${p.published ? "Published" : "Draft"}*\n\n`;
      md += `> ${p.excerpt}\n\n`;
      md += `${p.content}\n\n`;
      md += `## Features & Technical details\n`;
      md += `- Custom mock data identifier: ${p.id}\n`;
      md += `- URL Safe Slug: \`${p.slug}\`\n\n`;
      md += `***\n\n`;
    });
    return md.trim();
  }

  if (format === "html") {
    if (schema === "posts") {
      return resultList.map(p => `
<article>
  <h1>${p.title}</h1>
  <p><em>By ${p.author}</em></p>
  <blockquote>${p.excerpt}</blockquote>
  <p>${p.content}</p>
</article>
      `).join("\n");
    }
    // Return standard JSON wrapped in <pre> styling tags
    return `<pre><code>${JSON.stringify(resultList, null, 2)}</code></pre>`;
  }

  return JSON.stringify(resultList, null, 2);
}

// Helper: Formats list of paragraphs based on chosen type
function formatOutput(paragraphs, format) {
  if (format === "json") {
    return JSON.stringify(paragraphs, null, 2);
  } else if (format === "html") {
    return paragraphs.map(p => `<p>${p}</p>`).join("\n\n");
  } else if (format === "markdown") {
    return paragraphs.map(p => `Paragraph ${p}`).join("\n\n"); // Wait, standard markdown paragraph is just double newline
    return paragraphs.join("\n\n");
  }
  return paragraphs.join("\n\n");
}

// ── 8. Live Statistics Estimators ──

function updateStats(text) {
  if (!text || text.trim() === "") {
    resetStats();
    return;
  }

  // Character count
  const characters = text.length;

  // Words count
  const wordsArray = text.trim().split(/\s+/).filter(w => w.length > 0);
  const words = wordsArray.length;

  // Sentences count (matches . ? !)
  const sentenceMatches = text.match(/[.!?]+/g);
  const sentences = sentenceMatches ? sentenceMatches.length : 0;

  // Paragraphs count (splitting by double newline or article tag wrappers)
  let paragraphs = 0;
  if (state.currentType === "passwords") {
    paragraphs = text.split("\n").filter(line => line.trim().length > 0).length;
  } else {
    paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  }

  // Reading time (200 words per minute average)
  const totalSeconds = Math.max(1, Math.round((words / 200) * 60));
  let readingTime = `${totalSeconds}s`;
  if (totalSeconds >= 60) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    readingTime = `${mins}m ${secs}s`;
  }

  // Write values
  dom.statParagraphs.textContent = paragraphs;
  dom.statSentences.textContent = sentences;
  dom.statWords.textContent = words;
  dom.statCharacters.textContent = characters;
  dom.statReadingTime.textContent = readingTime;
}

function resetStats() {
  dom.statParagraphs.textContent = "0";
  dom.statSentences.textContent = "0";
  dom.statWords.textContent = "0";
  dom.statCharacters.textContent = "0";
  dom.statReadingTime.textContent = "0s";
}

// ── 9. Tool Toolbar Interactivity (Copy, Download, Clear) ──

function copyToClipboard() {
  const content = dom.textOutput.value;
  if (!content) {
    showToast("Nothing to copy!", "error");
    return;
  }

  navigator.clipboard.writeText(content)
    .then(() => {
      showToast("Copied to clipboard!");
    })
    .catch(err => {
      console.error(err);
      // Fallback method
      dom.textOutput.select();
      document.execCommand("copy");
      showToast("Copied to clipboard!");
    });
}

function downloadAsFile() {
  const content = dom.textOutput.value;
  if (!content) {
    showToast("Nothing to download!", "error");
    return;
  }

  const format = dom.selectFormat.value;
  let filename = "random_text";
  let mime = "text/plain";
  
  if (state.currentType === "passwords") {
    filename = "passwords";
  } else if (state.currentType === "mock") {
    filename = `mock_${dom.selectMockType.value}`;
  }

  switch (format) {
    case "json":
      filename += ".json";
      mime = "application/json";
      break;
    case "html":
      filename += ".html";
      mime = "text/html";
      break;
    case "markdown":
      filename += ".md";
      mime = "text/markdown";
      break;
    default:
      filename += ".txt";
      mime = "text/plain";
  }

  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);

  showToast(`Downloaded ${filename}!`);
}

function clearOutput() {
  dom.textOutput.value = "";
  resetStats();
  showToast("Output cleared!");
}

// Attach action events
dom.btnGenerate.addEventListener("click", generateText);
dom.btnCopy.addEventListener("click", copyToClipboard);
dom.btnDownload.addEventListener("click", downloadAsFile);
dom.btnClear.addEventListener("click", clearOutput);

// ── 10. Keyboard Shortcuts ──

document.addEventListener("keydown", (e) => {
  // Ctrl + Shift + G OR Ctrl + Enter to generate
  if ((e.ctrlKey && e.shiftKey && e.code === "KeyG") || (e.ctrlKey && e.key === "Enter")) {
    e.preventDefault();
    generateText();
  }
  
  // Ctrl + L to clear
  if (e.ctrlKey && e.code === "KeyL") {
    e.preventDefault();
    clearOutput();
  }
});

// ── 11. Initialization ──

window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateUISettings("lorem");
  
  // Detect if running inside an iframe (Next.js portal wrapper)
  if (window.self !== window.top) {
    document.body.classList.add("embed-mode");
  }
});
