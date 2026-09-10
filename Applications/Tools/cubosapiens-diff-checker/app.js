"use strict";

const STORAGE_KEY = "diffChecker.theme";

const elements = {
    leftText: document.querySelector("#leftText"),
    rightText: document.querySelector("#rightText"),
    compareBtn: document.querySelector("#compareBtn"),
    swapBtn: document.querySelector("#swapBtn"),
    clearBtn: document.querySelector("#clearBtn"),
    copyBtn: document.querySelector("#copyBtn"),
    themeBtn: document.querySelector("#themeBtn"),
    stats: document.querySelector("#stats"),
    diffOutput: document.querySelector("#diffOutput")
};

let currentDiff = [];

function splitLines(text) {
    return text.replace(/\r\n/g, "\n").split("\n");
}

/**
 * Creates a line-based diff using a longest common subsequence table.
 */
function createDiff(originalText, modifiedText) {
    const original = splitLines(originalText);
    const modified = splitLines(modifiedText);

    const rows = original.length;
    const columns = modified.length;

    const table = Array.from(
        { length: rows + 1 },
        () => new Uint32Array(columns + 1)
    );

    for (let row = rows - 1; row >= 0; row -= 1) {
        for (let column = columns - 1; column >= 0; column -= 1) {
            table[row][column] =
                original[row] === modified[column]
                    ? table[row + 1][column + 1] + 1
                    : Math.max(
                          table[row + 1][column],
                          table[row][column + 1]
                      );
        }
    }

    const diff = [];
    let row = 0;
    let column = 0;
    let originalLine = 1;
    let modifiedLine = 1;

    while (row < rows && column < columns) {
        if (original[row] === modified[column]) {
            diff.push({
                type: "unchanged",
                text: original[row],
                originalLine,
                modifiedLine
            });

            row += 1;
            column += 1;
            originalLine += 1;
            modifiedLine += 1;
        } else if (table[row + 1][column] >= table[row][column + 1]) {
            diff.push({
                type: "removed",
                text: original[row],
                originalLine,
                modifiedLine: null
            });

            row += 1;
            originalLine += 1;
        } else {
            diff.push({
                type: "added",
                text: modified[column],
                originalLine: null,
                modifiedLine
            });

            column += 1;
            modifiedLine += 1;
        }
    }

    while (row < rows) {
        diff.push({
            type: "removed",
            text: original[row],
            originalLine,
            modifiedLine: null
        });

        row += 1;
        originalLine += 1;
    }

    while (column < columns) {
        diff.push({
            type: "added",
            text: modified[column],
            originalLine: null,
            modifiedLine
        });

        column += 1;
        modifiedLine += 1;
    }

    return diff;
}

function createDiffLine(item) {
    const line = document.createElement("div");
    line.className = `diff-line ${item.type}`;

    const lineNumber = document.createElement("span");
    lineNumber.className = "diff-number";

    if (item.type === "added") {
        lineNumber.textContent = item.modifiedLine ?? "";
    } else {
        lineNumber.textContent = item.originalLine ?? "";
    }

    const marker = document.createElement("span");
    marker.className = "diff-marker";
    marker.setAttribute("aria-hidden", "true");

    if (item.type === "added") {
        marker.textContent = "+";
    } else if (item.type === "removed") {
        marker.textContent = "−";
    } else {
        marker.textContent = " ";
    }

    const content = document.createElement("span");
    content.className = "diff-content";
    content.textContent = item.text || " ";

    line.append(lineNumber, marker, content);

    return line;
}

function renderDiff(diff) {
    elements.diffOutput.replaceChildren();

    if (diff.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-result";
        message.textContent = "No comparison result available.";
        elements.diffOutput.append(message);
        return;
    }

    const fragment = document.createDocumentFragment();

    diff.forEach((item) => {
        fragment.append(createDiffLine(item));
    });

    elements.diffOutput.append(fragment);
}

function updateStats(diff) {
    const added = diff.filter((item) => item.type === "added").length;
    const removed = diff.filter((item) => item.type === "removed").length;
    const unchanged = diff.filter(
        (item) => item.type === "unchanged"
    ).length;

    if (added === 0 && removed === 0) {
        setStatus(
            `Texts are identical. ${unchanged} unchanged line${
                unchanged === 1 ? "" : "s"
            }.`,
            "success"
        );
        return;
    }

    setStatus(
        `${added} added, ${removed} removed, ${unchanged} unchanged.`,
        "success"
    );
}

function setStatus(message, status = "info") {
    elements.stats.textContent = message;
    elements.stats.dataset.status = status;
}

function compareTexts() {
    const originalText = elements.leftText.value;
    const modifiedText = elements.rightText.value;

    if (!originalText && !modifiedText) {
        currentDiff = [];
        renderDiff(currentDiff);
        setStatus("Enter text in at least one editor.", "error");
        elements.leftText.focus();
        return;
    }

    try {
        currentDiff = createDiff(originalText, modifiedText);
        renderDiff(currentDiff);
        updateStats(currentDiff);
    } catch (error) {
        console.error("Diff comparison failed:", error);
        setStatus("The comparison could not be completed.", "error");
    }
}

function swapTexts() {
    const originalText = elements.leftText.value;
    elements.leftText.value = elements.rightText.value;
    elements.rightText.value = originalText;

    compareTexts();
    setStatus("Inputs swapped and compared.", "success");
}

function clearTexts() {
    elements.leftText.value = "";
    elements.rightText.value = "";
    currentDiff = [];

    elements.diffOutput.innerHTML =
        '<p class="empty-result">The comparison result will appear here.</p>';

    setStatus("Ready to compare.");
    elements.leftText.focus();
}

function formatDiffForClipboard(diff) {
    return diff
        .map((item) => {
            const marker =
                item.type === "added"
                    ? "+"
                    : item.type === "removed"
                      ? "-"
                      : " ";

            return `${marker} ${item.text}`;
        })
        .join("\n");
}

async function copyResult() {
    if (currentDiff.length === 0) {
        setStatus("Compare text before copying the result.", "error");
        return;
    }

    const output = formatDiffForClipboard(currentDiff);

    try {
        await navigator.clipboard.writeText(output);
        setStatus("Diff result copied.", "success");
    } catch (error) {
        const temporaryTextArea = document.createElement("textarea");
        temporaryTextArea.value = output;
        temporaryTextArea.setAttribute("readonly", "");
        temporaryTextArea.style.position = "fixed";
        temporaryTextArea.style.opacity = "0";

        document.body.append(temporaryTextArea);
        temporaryTextArea.select();

        const copied = document.execCommand("copy");
        temporaryTextArea.remove();

        setStatus(
            copied
                ? "Diff result copied."
                : "Copy failed. Select the result manually.",
            copied ? "success" : "error"
        );
    }
}

function getInitialTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    const isDark = theme === "dark";
    elements.themeBtn.setAttribute("aria-pressed", String(isDark));

    localStorage.setItem(STORAGE_KEY, theme);
}

function toggleTheme() {
    const currentTheme =
        document.documentElement.dataset.theme === "dark"
            ? "dark"
            : "light";

    applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function handleKeyboardShortcuts(event) {
    const commandKey = event.ctrlKey || event.metaKey;

    if (!commandKey) {
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();
        compareTexts();
        return;
    }

    if (event.shiftKey && event.key.toLowerCase() === "x") {
        event.preventDefault();
        swapTexts();
        return;
    }

    if (event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copyResult();
    }
}

elements.compareBtn.addEventListener("click", compareTexts);
elements.swapBtn.addEventListener("click", swapTexts);
elements.clearBtn.addEventListener("click", clearTexts);
elements.copyBtn.addEventListener("click", copyResult);
elements.themeBtn.addEventListener("click", toggleTheme);
document.addEventListener("keydown", handleKeyboardShortcuts);

applyTheme(getInitialTheme());