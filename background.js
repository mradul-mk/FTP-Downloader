chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "startDownload") {
      const baseURL = message.url;
  
      try {
        const zip = new JSZip(); // Create a new ZIP instance
        await downloadRecursive(baseURL, zip, "");
        const content = await zip.generateAsync({ type: "blob" });
  
        // Trigger the download of the ZIP file
        const blobURL = URL.createObjectURL(content);
        chrome.downloads.download({
          url: blobURL,
          filename: "ftp_download.zip"
        });
  
        alert("Download started. Check your downloads folder for the ZIP file.");
      } catch (error) {
        console.error("Error downloading files:", error);
        alert("An error occurred while downloading files.");
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
      .map(match => match[1]) // Extract the URL part
      .filter(link => link !== "../") // Exclude the parent directory
      .map(link => new URL(link, url).href); // Resolve relative URLs to absolute URLs
  
    return links;
  }
  
  // Fetch a file's content as a Blob
  async function fetchFile(url) {
    const response = await fetch(url);
    return await response.blob(); // Return the file's binary content
  }
  