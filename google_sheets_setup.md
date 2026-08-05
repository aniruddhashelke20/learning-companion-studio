# Google Sheets Integration Guide

This guide explains how to stream your clickstream data directly into a Google Sheet in real-time using a simple Google Apps Script web service.

---

## Step 1: Create the Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a **Blank Spreadsheet**.
2. Give your spreadsheet a name (e.g., `LearnLog Clickstream Logs`).

## Step 2: Paste the Apps Script Code
1. In the top menu, click **Extensions** > **Apps Script**.
2. Delete any default code in the editor (`Code.gs`) and paste the following script:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Create header row if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", 
        "Event ID", 
        "User ID", 
        "User Name", 
        "User Email", 
        "Event Name", 
        "Component", 
        "Event Context", 
        "Origin", 
        "IP Address", 
        "Description", 
        "Resource Type", 
        "Resource ID", 
        "Metadata"
      ]);
      // Format headers: Bold with a light-gray background
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#f1f5f9");
    }
    
    // Append the event data
    sheet.appendRow([
      data.timestamp,
      data.eventId,
      data.userId,
      data.userName,
      data.userEmail,
      data.eventName,
      data.component,
      data.eventContext,
      data.origin,
      data.ipAddress,
      data.description,
      data.resourceType,
      data.resourceId,
      data.metadata
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click the **Save** icon (diskette) at the top of the editor.

## Step 3: Deploy the Script as a Web App
1. In the top-right corner, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure the settings:
   - **Description**: `LearnLog Clickstream Receiver`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: **`Anyone`** (This allows your backend server to push events securely without requiring OAuth logins).
4. Click **Deploy**.
5. Google will ask you to authorize access. Click **Authorize access**, choose your account, click **Advanced** (at the bottom), and then click **Go to Untitled project (unsafe)**. Allow the permissions.
6. Once deployed, copy the **Web app URL** (it should look like `https://script.google.com/macros/s/.../exec`).

## Step 4: Configure the Node.js Server
1. Open the file `server/.env` in your code editor.
2. Paste your copied Web App URL:
   ```env
   GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/YOUR-DEPLOYED-URL/exec
   ```
3. Restart your development server (`npm run dev`).
4. **All future clicks, video plays, page views, and quiz submissions will automatically stream into your Google Sheet!**
