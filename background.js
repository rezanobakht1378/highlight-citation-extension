let highlights = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SAVE_HIGHLIGHT") {
        highlights.push(message.payload);
        chrome.storage.local.set({ highlights });
    }
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get("highlights", (data) => {
        if (!data.highlights) {
            chrome.storage.local.set({ highlights: [] });
        }
    });
});
