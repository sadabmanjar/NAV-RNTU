function doPost(e) {
  try {
    // 1. Get the active spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 2. Extract values from the incoming POST request
    var name = e.parameter.Name;
    var email = e.parameter.Email;
    var message = e.parameter.Message;
    var timestamp = new Date();
    
    // 3. Append the data to the next empty row
    sheet.appendRow([timestamp, name, email, message]);
    
    // 4. Return success response
    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch(error) {
    return ContentService.createTextOutput("Error: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
