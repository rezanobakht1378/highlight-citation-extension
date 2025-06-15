document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("highlight-list");
    chrome.storage.local.get("highlights", (data) => {
        const highlights = data.highlights || [];
        if (highlights.length === 0) {
            const noHighlights = document.getElementById("no-highlights");
            if (noHighlights) noHighlights.style.display = "block";
            return;
        }
        highlights.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "mb-3 list-unstyled"; // spacing and no default bullet

            li.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Highlight ${index + 1}</h5>
                        <p class="card-text"><strong>Text:</strong> ${item.text}</p>
                        <p class="card-text"><strong>Citation:</strong> <em>${item.citation || "No citation available"}</em></p>
                        ${item.doi ? `<p class="card-text"><strong>DOI:</strong> ${item.doi}</p>` : ""}
                        <button class="btn btn-danger btn-sm delete-highlight" data-index="${index}">Delete</button>
                    </div>
                </div>
            `;
            list.appendChild(li);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll(".delete-highlight").forEach(button => {
            button.addEventListener("click", (event) => {
                const index = parseInt(event.target.getAttribute("data-index"));
                highlights.splice(index, 1);
                chrome.storage.local.set({ highlights }, () => {
                    location.reload(); // Reload to update the list
                });
            });
        });
    });

    const downloadButton = document.getElementById("download");
    if (downloadButton) {
        downloadButton.addEventListener("click", () => {
            chrome.storage.local.get("highlights", (data) => {
                const highlights = data.highlights || [];
                if (highlights.length === 0) {
                    alert("❌ No highlights to download.");
                    return;
                }
                const blob = new Blob([JSON.stringify(highlights, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                chrome.downloads.download({
                    url: url,
                    filename: "highlights_with_doi.json"
                }, () => {
                    URL.revokeObjectURL(url); // Revoke the object URL after download
                });
            });
        });
    }

    const downloadWordButton = document.getElementById("download-word");
    if (downloadWordButton) {
        downloadWordButton.addEventListener("click", () => {
            chrome.storage.local.get("highlights", (data) => {
                const highlights = data.highlights || [];
                if (highlights.length === 0) {
                    alert("❌ No highlights to download.");
                    return;
                }
                let htmlContent = "<html><head><meta charset='UTF-8'></head><body>";
                highlights.forEach(item => {
                    htmlContent += `<p><strong>Text:</strong> ${item.text}<br/><br/>`;
                    if (item.doi) {
                        htmlContent += `<strong>DOI:</strong> ${item.doi}<br/>`;
                    } else {
                        htmlContent += `<strong>URL:</strong> ${item.url}<br/>`;
                    }
                    htmlContent += `</p><hr/>`;
                });
                htmlContent += "</body></html>";
    
                const blob = new Blob(['\ufeff', htmlContent], {
                    type: 'application/msword'
                });
    
                const url = URL.createObjectURL(blob);
                chrome.downloads.download({
                    url: url,
                    filename: "highlights.doc"
                }, () => {
                    URL.revokeObjectURL(url); // Revoke the object URL after download
                });
            });
        });
    }
});
