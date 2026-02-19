function doPost(e) {
  try {
    // Get the active sheet (Sheet1 by default)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming JSON payload from the web app
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.name || !data.section || !data.list || data.score === undefined || data.total === undefined) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Missing required fields'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Append the row to the spreadsheet
    // Columns: [Timestamp, Name, Section, List, Score, Total Possible Score]
    sheet.appendRow([
      new Date(),
      data.name,
      data.section,
      data.list,
      data.score,
      data.total
    ]);
    
    // Return a success response
    return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Handle parsing or execution errors
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    const rows = data.slice(1);
    
    // Sort by Score (desc), then Time (asc)
    const sorted = rows.sort((a, b) => {
       if (b[4] !== a[4]) {
          return b[4] - a[4]; // Highest score first
       }
       return a[0] - b[0]; // Earliest time first
    });
    
    // Take top 10
    const top10 = sorted.slice(0, 10).map(row => ({
       timestamp: row[0],
       name: row[1],
       section: row[2],
       list: row[3],
       score: row[4],
       total: row[5]
    }));
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success', leaderboard: top10}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight CORS requests from the browser
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
