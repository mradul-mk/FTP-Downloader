document.getElementById("download").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url?.startsWith("ftp://")) {
      chrome.runtime.sendMessage({ action: "startDownload", url: tab.url });
      alert("Download started. Check your downloads folder.");
    } else {
      alert("Please navigate to an FTP directory to use this extension.");
    }
  });
  