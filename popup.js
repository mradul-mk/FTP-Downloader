var _chunkIndex = 0;
var _blobs = [];

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "downloadZip") {
      // new chunk received
      _chunkIndex++;

      const progressbar = document.getElementById("progress-bar")
      progressbar.style.width = String((_chunkIndex/request.data.chunks)*100) + '%'

      var bytes = new Uint8Array(request.data.blobAsText.length);
      for(var i=0; i<bytes.length; i++){
        bytes[i] = request.data.blobAsText.charCodeAt(i);
      }
      // store blob
      _blobs.push(new Blob([bytes], {type: request.data.mimeString}));

      if(_chunkIndex == request.data.chunks) {
        // merge all chunks
        for(j=0; j<_blobs.length;j++) {
          var mergedBlob;
          if(j>0){
            mergedBlob = new Blob([mergedBlob, _blobs[j]], {type: request.data.mimeString});
          }
          else{
            mergedBlob = new Blob([_blobs[j]], {type: request.data.mimeString});
          }
        }

        saveBlobToFile(mergedBlob, "files.zip", request.data.mimeString);
      }
    }
  });


  function saveBlobToFile(mergedBlob, fileName){
    const blob = new Blob([mergedBlob], { type: 'application/zip' });
    const blobURL = URL.createObjectURL(blob);

    // trigger download
    const a = document.createElement("a");
    a.href = blobURL;
    a.download = fileName;
    a.style.display = "none";
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobURL);
  }
  
  document.getElementById("download").addEventListener("click", async () => {
    try{
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url?.startsWith("ftp://")) {
          document.getElementById("progress-container").style.display = "block";
          document.getElementById("progress-bar").style.width = "0%";
          chrome.runtime.sendMessage({ action: "startDownload", url: tab.url });
        } else {
        alert("Please navigate to an FTP directory to use this extension.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while initiating the download.");
    }
  });
  