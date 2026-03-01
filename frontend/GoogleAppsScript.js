function doPost(e) {
  try {
    // 1. Get the active spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 2. Extract values from the incoming POST request map
    var type = e.parameter.Type || 'Unknown';
    var name = e.parameter.Name || '';
    var email = e.parameter.Email || '';
    var phone = e.parameter.Phone || '';
    var purpose = e.parameter.Purpose || '';
    var message = e.parameter.Message || '';
    var timestamp = new Date();
    
    // 3. Append the data to the next empty row
    // Columns: Timestamp | Type | Name | Email | Phone | Purpose/Organization | Message
    sheet.appendRow([timestamp, type, name, email, phone, purpose, message]);
    
    // 4. Return success response
    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch(error) {
    return ContentService.createTextOutput("Error: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
