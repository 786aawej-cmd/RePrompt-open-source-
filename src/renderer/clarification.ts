document.addEventListener('DOMContentLoaded', () => {
    const originalTextSpan = document.getElementById('originalText') as HTMLSpanElement;
    const clarificationInput = document.getElementById('clarificationInput') as HTMLTextAreaElement;
    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
    const cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement;
    const closeBtn = document.getElementById('closeBtn') as HTMLButtonElement;

    window.clarificationAPI.onInitClarification((originalText: string) => {
        // Truncate if too long to display cleanly
        const displayLength = 100;
        const displayTxt = originalText.length > displayLength
            ? originalText.substring(0, displayLength) + '...'
            : originalText;
        originalTextSpan.textContent = `"${displayTxt}"`;
    });

    const submit = () => {
        const text = clarificationInput.value.trim();
        window.clarificationAPI.submitClarification(text);
    };

    const cancel = () => {
        window.clarificationAPI.cancelClarification();
    };

    submitBtn.addEventListener('click', submit);
    cancelBtn.addEventListener('click', cancel);
    closeBtn.addEventListener('click', cancel);

    // Ctrl+Enter to submit, Escape to cancel
    clarificationInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            submit();
        } else if (e.key === 'Escape') {
            cancel();
        }
    });
});
