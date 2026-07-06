document.addEventListener('DOMContentLoaded', () => {
    const rawInput = document.getElementById('raw-input');
    const base64Output = document.getElementById('base64-output');
    const charCount = document.getElementById('char-count');
    const copyBtn = document.getElementById('copy-btn');
    const workspace = document.querySelector('.lab-workspace');

    // 1. Safe Base64 Encoding supporting Emojis and Special Characters (UTF-8)
    function encodeToBase64(str) {
        if (!str) return '';
        try {
            // First we convert string characters to a UTF-8 bytes array string, then encode to base64
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
                return String.fromCharCode(parseInt(p1, 16));
            }));
        } catch (e) {
            console.error("Encoding error: ", e);
            return "Error processing stream stream string data.";
        }
    }

    // 2. Main Process Logic
    function processTransformation() {
        const value = rawInput.value;
        
        // Dynamic character counter update
        charCount.textContent = `${value.length} character${value.length !== 1 ? 's' : ''}`;

        // Trigger or remove the laboratory processing stream animation
        if (value.length > 0) {
            workspace.classList.add('processing');
            base64Output.value = encodeToBase64(value);
        } else {
            workspace.classList.remove('processing');
            base64Output.value = '';
        }

        // Persistent Session Storage
        localStorage.setItem('lab_base64_session_input', value);
    }

    // 3. One-Click Clipboard Copying Feature
    copyBtn.addEventListener('click', async () => {
        const textToCopy = base64Output.value;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            
            // Visual laboratory success state transition
            copyBtn.classList.add('copied');
            copyBtn.textContent = 'COPIED!';
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.textContent = 'Copy Output';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });

    // 4. Listeners for Instant Input Processing
    rawInput.addEventListener('input', processTransformation);

    // 5. Restore Session Workspace from Persistent Storage
    const savedSessionData = localStorage.getItem('lab_base64_session_input');
    if (savedSessionData) {
        rawInput.value = savedSessionData;
        processTransformation();
    }
});