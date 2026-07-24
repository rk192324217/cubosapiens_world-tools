const input = document.getElementById("cronInput");
const output = document.getElementById("output");

document.getElementById("parseBtn").addEventListener("click", () => {
    const value = input.value.trim();

    if (value === "") {
        output.innerHTML = "Please enter a cron expression.";
        return;
    }

    const parts = value.split(" ");

    if (parts.length !== 5) {
        output.innerHTML = "Invalid cron expression. Use 5 fields.";
        return;
    }

    output.innerHTML = `
        <b>Minute:</b> ${parts[0]} <br>
        <b>Hour:</b> ${parts[1]} <br>
        <b>Day of Month:</b> ${parts[2]} <br>
        <b>Month:</b> ${parts[3]} <br>
        <b>Day of Week:</b> ${parts[4]}
    `;
});

document.getElementById("clearBtn").addEventListener("click", () => {
    input.value = "";
    output.innerHTML = "Enter a cron expression and click Parse.";
});

document.getElementById("copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(output.innerText);
    alert("Output copied!");
});
