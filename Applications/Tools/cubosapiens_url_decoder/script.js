document.addEventListener('DOMContentLoaded', () => {
    const rawUrlInput = document.getElementById('raw-url');
    const decodedUrlOutput = document.getElementById('decoded-url');
    const copyBtn = document.getElementById('copy-btn');
    const systemStatus = document.getElementById('system-status');

    // 1. Core Decoding Function with Error Detection
    function processUrl() {
        const rawValue = rawUrlInput.value;
        
        // Save current input to persistent session storage
        localStorage.setItem('lab_url_decoder_session', rawValue);

        // Handle empty input state
        if (rawValue.trim() === '') {
            decodedUrlOutput.value = '';
            systemStatus.textContent = '[STATUS: AWAITING PAYLOAD]';
            systemStatus.className = 'status-ok';
            return;
        }

        try {
            // Attempt to decode the URL string
            const decodedValue = decodeURIComponent(rawValue);
            decodedUrlOutput.value = decodedValue;
            
            // Success UI State
            systemStatus.textContent = '[STATUS: OK - PACKET DECODED SUCCESSFULLY]';
            systemStatus.className = 'status-ok';
        } catch (error) {
            // Error Handling UI State for malformed URIs
            decodedUrlOutput.value = 'ERROR: Unable to decode payload. Malformed URI sequence detected.';
            systemStatus.textContent = '[CRITICAL ERROR: MALFORMED URL SEQUENCE DETECTED]';
            systemStatus.className = 'status-error';
        }
    }

    // 2. Copy to Clipboard Feature
    copyBtn.addEventListener('click', async () => {
        const textToCopy = decodedUrlOutput.value;
        
        // Prevent copying if empty or if there is an active error
        if (!textToCopy || textToCopy.startsWith('ERROR:')) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            
            // Visual success feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '[PAYLOAD COPIED]';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    });

    // 3. Live Conversion Listener
    rawUrlInput.addEventListener('input', processUrl);

    // 4. Restore Previous Session from Storage
    const savedSession = localStorage.getItem('lab_url_decoder_session');
    if (savedSession) {
        rawUrlInput.value = savedSession;
        processUrl();
    }
});