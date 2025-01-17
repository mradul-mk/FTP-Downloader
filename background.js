chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "startDownload") {
      const baseURL = message.url;
  
      try {
        await downloadRecursive(baseURL);
        alert("Download started for all files and folders.");
      } catch (error) {
        console.error("Error downloading files:", error);
        alert("An error occurred while downloading files.");
      }
    }
  });
  
  // Recursively fetch directory listings and download files
  async function downloadRecursive(url) {
    const items = await fetchDirectory(url);
  
    for (const item of items) {
      if (item.endsWith("/")) {
        // If it's a folder, recurse
        await downloadRecursive(item);
      } else {
        // If it's a file, download it
        chrome.downloads.download({ url: item });
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
      .filter(link => link !== "../") // Exclude parent directory
      .map(link => new URL(link, url).href); // Resolve relative URLs to absolute URLs
  
    return links;
  }
  