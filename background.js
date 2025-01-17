importScripts("jszip.min.js");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "startDownload") {
    const baseURL = message.url;

    try {
      const zip = new JSZip(); // Create a new ZIP instance
      await downloadRecursive(baseURL, zip, "");
      const content = await zip.generateAsync({ type: "blob" });

      // Send the ZIP blob to the popup
      chrome.runtime.sendMessage({ action: "downloadZip", blob: content });
    } catch (error) {
      console.error("Error downloading files:", error);
      chrome.runtime.sendMessage({ action: "error", message: "An error occurred while downloading files." });
    }
  }
});

// Recursively fetch directory listings and download files
async function downloadRecursive(url, zip, folderPath) {
  const items = await fetchDirectory(url);

  for (const item of items) {
    if (item.endsWith("/")) {
      // If it's a folder, create it in the ZIP and recurse
      const folderName = decodeURIComponent(item.substring(url.length));
      const subFolder = zip.folder(folderPath + folderName);
      await downloadRecursive(item, zip, `${folderPath}${folderName}/`);
    } else {
      // If it's a file, download its contents and add to ZIP
      const fileName = decodeURIComponent(item.substring(url.length));
      const fileContent = await fetchFile(item);
      zip.file(`${folderPath}${fileName}`, fileContent);
    }
  }
}

// Fetch directory listing and parse links
async function fetchDirectory(url) {
  const response = await fetch(url);
  const text = await response.text();
  
  // Parse links from the directory listing and exclude parent directory "../"
  const matches = Array.from(text.matchAll(/href="([^"]+)"/g));
  const links = matches
    .map(match => match[1])
    .filter(link => link !== "../")
    .map(link => new URL(link, url).href);

  return links;
}

// Fetch a file's content as a Blob
async function fetchFile(url) {
  const response = await fetch(url);
  return await response.blob();
}
