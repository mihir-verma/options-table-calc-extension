document.getElementById("run").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "runCalculations" });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');

    // Retrieve the current state of the extension
    chrome.storage.local.get('extensionEnabled', data => {
        const isEnabled = data.extensionEnabled !== false; // Default to true
        updateButtonText(isEnabled);
    });

    // Toggle the extension state when the button is clicked
    toggleButton.addEventListener('click', () => {
        chrome.storage.local.get('extensionEnabled', data => {
            const isEnabled = data.extensionEnabled !== false;
            const newState = !isEnabled;

            // Save the new state
            chrome.storage.local.set({ extensionEnabled: newState }, () => {
                updateButtonText(newState);
                // Optionally, notify the content script of the state change
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleExtension', state: newState });
                });
            });
        });
    });

    // Function to update button text based on the extension state
    function updateButtonText(isEnabled) {
        toggleButton.textContent = isEnabled ? 'Disable Extension' : 'Enable Extension';
    }
});