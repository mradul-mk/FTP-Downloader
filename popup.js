chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "downloadZip") {
      const blobURL = URL.createObjectURL(message.blob);
  
      // Trigger the download
      const a = document.createElement("a");
      a.href = blobURL;
      a.download = "ftp_download.zip";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobURL);
    } else if (message.action === "error") {
      alert(message.message);
    }
  });
  
  document.getElementById("download").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url?.startsWith("ftp://")) {
      chrome.runtime.sendMessage({ action: "startDownload", url: tab.url });
    } else {
      alert("Please navigate to an FTP directory to use this extension.");
    }
  });
  