document.addEventListener('DOMContentLoaded', () => {
    const minutesSelect = document.getElementById('cron-minutes');
    const hoursSelect = document.getElementById('cron-hours');
    const domSelect = document.getElementById('cron-dom');
    const monthSelect = document.getElementById('cron-month');
    const dowSelect = document.getElementById('cron-dow');
    const presetSelect = document.getElementById('preset-select');
    const cronOutput = document.getElementById('cron-output');
    const explanationText = document.getElementById('cron-explanation');
    const copyBtn = document.getElementById('copy-btn');

    // Human readable mappings
    const translations = {
        minutes: { '*': 'every minute', '0': 'at minute 00', '*/5': 'every 5 minutes', '*/15': 'every 15 minutes', '*/30': 'every 30 minutes' },
        hours: { '*': 'of every hour', '0': 'at midnight (00:00)', '12': 'at noon (12:00)', '*/2': 'every 2 hours', '*/6': 'every 6 hours' },
        dom: { '*': 'every day', '1': 'on the 1st day of the month', '15': 'on the 15th day of the month', 'L': 'on the last day of the month' },
        month: { '*': 'of every month', '1': 'in January', '6': 'in June', '12': 'in December' },
        dow: { '*': 'every day of the week', '1-5': 'on weekdays (Monday through Friday)', '0,6': 'on weekends (Saturday and Sunday)', '1': 'on Mondays', '5': 'on Fridays' }
    };

    function updateDisplayAndStorage() {
        const expression = `${minutesSelect.value} ${hoursSelect.value} ${domSelect.value} ${monthSelect.value} ${dowSelect.value}`;
        cronOutput.value = expression;

        // Generate Human Readable text
        const exp = `Runs ${translations.minutes[minutesSelect.value]} ${translations.hours[hoursSelect.value]}, ${translations.dom[domSelect.value]} ${translations.month[monthSelect.value]}, ${translations.dow[dowSelect.value]}.`;
        explanationText.textContent = exp;

        // Persistent Storage
        localStorage.setItem('savedCron', expression);
    }

    // Individual select change listeners
    [minutesSelect, hoursSelect, domSelect, monthSelect, dowSelect].forEach(element => {
        element.addEventListener('change', () => {
            presetSelect.value = ""; // Clear preset dropdown on manual adjustment
            updateDisplayAndStorage();
        });
    });

    // Preset selection change listener
    presetSelect.addEventListener('change', (e) => {
        if (!e.target.value) return;
        const parts = e.target.value.split(' ');
        minutesSelect.value = parts[0];
        hoursSelect.value = parts[1];
        domSelect.value = parts[2];
        monthSelect.value = parts[3];
        dowSelect.value = parts[4];
        updateDisplayAndStorage();
    });

    // Copy Button Functionality
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(cronOutput.value).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            copyBtn.style.backgroundColor = '#2ea44f';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = 'var(--success-color)';
            }, 1500);
        });
    });

    // Load initial values from localStorage if present
    const savedCron = localStorage.getItem('savedCron');
    if (savedCron) {
        const parts = savedCron.split(' ');
        if (parts.length === 5) {
            minutesSelect.value = parts[0];
            hoursSelect.value = parts[1];
            domSelect.value = parts[2];
            monthSelect.value = parts[3];
            dowSelect.value = parts[4];
        }
    }
    updateDisplayAndStorage(); // Run initial compile
});