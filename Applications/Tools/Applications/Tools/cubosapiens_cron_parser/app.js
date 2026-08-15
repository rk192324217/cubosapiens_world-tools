const input = document.getElementById("cronInput");
const output = document.getElementById("output");

document.getElementById("parseBtn").addEventListener("click", () => {
    const value = input.value.trim();

    if (value === "") {
        output.innerHTML = "⚠️ Please enter a cron expression.";
        return;
    }

    const parts = value.split(/\s+/);

    if (parts.length !== 5) {
        output.innerHTML = "❌ Invalid cron expression. Use 5 fields.";
        return;
    }

    output.innerHTML =
        "Minute : " + parts[0] + "<br>" +
        "Hour : " + parts[1] + "<br>" +
        "Day of Month : " + parts[2] + "<br>" +
        "Month : " + parts[3] + "<br>" +
        "Day of Week : " + parts[4];
});

document.getElementById("clearBtn").addEventListener("click", () => {
    input.value = "";
    output.innerHTML = "Enter a cron expression and click Parse.";
    input.focus();
});

document.getElementById("copyBtn").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(output.innerText);
        alert("Output copied successfully!");
    } catch (err) {
        alert("Copy failed.");
    }
});

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        document.getElementById("parseBtn").click();
    }
});
