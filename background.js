importScripts("jszip.min.js");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "startDownload") {
    const baseURL = message.url;

    try {
      const zip = new JSZip(); // Create a new ZIP instance
      await downloadRecursive(baseURL, zip, "");
      const content = await zip.generateAsync({ type: "blob" });
      sendBlobToApp(content);
    } catch (error) {
      console.error("Error downloading files:", error);
      chrome.runtime.sendMessage({ 
        action: "error", 
        message: "An error occurred while downloading files." 
      });
    }
  }
});

function sendBlobToApp(blob){
  /**
   * Read the blob in chunks and send to app
   * Keep chuck size small to prevent app from crashing 
   * 1KB chunks
   */
  var CHUNK_SIZE = 256*1024;
  var start = 0;
  var stop = CHUNK_SIZE;

  var remainder = blob.size % CHUNK_SIZE;
  var chunks = Math.floor(blob.size / CHUNK_SIZE);
  var chunkIndex = 0;

  if(remainder!=0) chunks = chunks + 1;

  var fr = new FileReader();
  fr.onload = function () {
    var message = {
      "blobAsText": fr.result,
      "mimeString": "application/octet-stream",
      "chunks": chunks
    };

    chrome.runtime.sendMessage({
      action: "downloadZip",
      data: message
    });
    // read the next chunk of bytes
    processChunk();
  };
  fr.onerror = function(){
    console.log("An error occurred while reading");
  };
  processChunk();

  function processChunk(){
    chunkIndex++;
    // exit if no more chunks
    if(chunkIndex>chunks){
      return;
    }

    if(chunkIndex == chunks && remainder!=0){
      stop = start+remainder;
    }

    var blobChunk = blob.slice(start, stop);

    // prepare next chunk
    start = stop;
    stop = stop + CHUNK_SIZE;

    fr.readAsBinaryString(blobChunk);
  }
}

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
