# FTP-Downloader
FTP Downloader is a simple, easy to use Chrome extension which downloads the the files on your ftp server recursively.

# How to load?

1. Go to chrome://extensions/ in Chrome.
2. Enable "Developer mode."
3. Click "Load unpacked" and select the folder containing your extension.
4. Navigate to an FTP URL and click the extension to start downloading.

# How to Use? 

A. Popup Interaction:

Navigate to an FTP directory in your browser and click "Download All" in the popup.

B. Recursive Download:

All href links are parsed, and ../ (parent directory) is excluded.
Files are downloaded using the Chrome downloads.download API.
Subdirectories are processed recursively.
Download Files:

C. Files are saved to the default downloads folder of the browser.