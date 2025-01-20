chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "downloadZip") {
      // Convert array buffer back to blob
      const blob = new Blob([message.data], { type: 'application/zip' });
      const blobURL = URL.createObjectURL(blob);
  
      // Trigger the download
      const a = document.createElement("a");
      a.href = blobURL;
      a.download = "ftp_download.zip";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobURL);
    } else if (message.action === "error") {
      alert(message.message);
    }
  });
  
  document.getElementById("download").addEventListener("click", async () => {
    try{
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url?.startsWith("ftp://")) {
        chrome.runtime.sendMessage({ action: "startDownload", url: tab.url });
        } else {
        alert("Please navigate to an FTP directory to use this extension.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while initiating the download.");
    }
  });
  