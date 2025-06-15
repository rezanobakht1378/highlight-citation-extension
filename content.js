// Create a floating button for adding highlights
const highlightButton = document.createElement("button");
highlightButton.id = "highlight-button";
highlightButton.textContent = "➕ Add to Highlights";
document.body.appendChild(highlightButton);

document.addEventListener("mouseup", (event) => {
    const selection = window.getSelection().toString().trim();
    if (!selection) {
        highlightButton.style.display = "none";
        return;
    }

    // Position the button exactly at the cursor's position
    const { pageX: x, pageY: y } = event;
    highlightButton.style.left = `${x}px`;
    highlightButton.style.top = `${y}px`;
    highlightButton.style.display = "block";

    highlightButton.onclick = () => {
        const title = document.title || "Untitled";
        const pageUrl = window.location.href;

        // Safely extract DOI from the citation_doi meta tag
        let doi = null;
        const doiMeta = document.querySelector('meta[name="citation_doi"]');
        if (doiMeta && doiMeta.hasAttribute("content")) {
            doi = doiMeta.getAttribute("content").trim();
        }

        // Fallback to URL if DOI is not available
        const citation = doi ? `DOI: ${doi}` : `URL: ${pageUrl}`;
        console.log(`Selected text: ${selection}`);
        console.log(`Citation: ${citation}`);

        const highlightEntry = {
            text: selection,
            citation: citation,
            title: title,
            url: pageUrl,
            doi: doi || null, // Explicitly set null if DOI is not found
            timestamp: new Date().toISOString()
        };

        try {
            if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ type: "SAVE_HIGHLIGHT", payload: highlightEntry }, (response) => {
                    if (!response || response.error) {
                        console.error("Error from background script:", response ? response.error : "No response");
                        //alert("❌ Failed to save highlight. Please try again.");
                    } else {
                        console.log("Highlight saved successfully:", response);
                        //alert("✅ Highlight added successfully!");
                    }
                });
            } else {
                console.warn("Chrome Extensions API is not available in this context.");
                //alert("⚠️ Highlight could not be saved because the Chrome Extensions API is unavailable. Please check your extension permissions.");
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            //alert("❌ An unexpected error occurred. Please try again.");
        }

        highlightButton.style.display = "none"; // Hide the button after saving
    };
});
