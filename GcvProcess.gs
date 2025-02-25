function createFolderIfNotExists(folderName, color) {
  try {
    var folder = DriveApp.getFoldersByName(folderName).next();
    Logger.log('Folder "' + folderName + '" already exists.');
    return folder;
  } catch (e) {
    // Create the folder if it doesn't exist.
    folder = DriveApp.createFolder(folderName);
    setFolderColor(folder.getId(), color);
    Logger.log('Folder "' + folderName + '" created successfully.');
    return folder;
  }
}

function setFolderColor(folderId, colorCode) {
  // Use the Drive Advanced Service
  Drive.Files.update({ folderColorRgb: colorCode }, folderId);
}

function uploadFiles(e) {
  try {
    // Retrieve selected parameters from the UI
    var selected_color = e.commonEventObject.formInputs['colorDropdown'].stringInputs.value[0];
    var color = colorPalette[selected_color];
    var itemIds = e.parameters.itemIds.split(','); // Get selected file IDs
    var docName = e.commonEventObject.formInputs['textInput'].stringInputs.value[0];
    var folderName = e.commonEventObject.formInputs['folderNameInput'].stringInputs.value[0];

    // Create or get the specified folder
    var docFolder = createFolderIfNotExists(folderName, color);

    // Log for debugging
    console.log('Processing files:', itemIds);

    // Iterate over selected files
    var combinedText = ""; // To combine all OCR results if needed
    itemIds.forEach(function (fileId) {
      // Get file metadata
      var file = Drive.Files.get(fileId);
      console.log("Processing file:", file.title);

      // Fetch the file content
      var blob;
      if (file.mimeType === MimeType.GOOGLE_DOCS || file.mimeType === MimeType.GOOGLE_SHEETS || file.mimeType === MimeType.GOOGLE_SLIDES) {
        // Use exportLinks for Google Docs, Sheets, or Slides
        var exportLink = file.exportLinks['application/pdf'];
        blob = UrlFetchApp.fetch(exportLink, {
          headers: {
            Authorization: "Bearer " + ScriptApp.getOAuthToken()
          }
        }).getBlob();
      } else {
        // Use getMedia() for regular files like PDFs, images, etc.
        blob = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media", {
          headers: {
            Authorization: "Bearer " + ScriptApp.getOAuthToken()
          }
        }).getBlob();
      }

      // Send the file content to Google Cloud Vision API and process the result
      var ocrText = processWithVisionAPI(blob);
      combinedText += `\n--- OCR Result for ${file.name} ---\n` + ocrText;
    });

    // Create a Google Doc to save the OCR results
    saveTextToGoogleDoc(docName, combinedText, docFolder);

    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText("Files processed and OCR results saved successfully!"))
      .build();
  } catch (error) {
    console.error('Error in uploadFiles:', error);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText("An error occurred: " + error.message))
      .build();
  }
}


function processWithVisionAPI(blob) {
  // Google Cloud Vision API endpoint and key
  var visionApiUrl = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAhhtQhzNB3FjdG6y1a2xr671AFZVF6GNk";

  // Prepare the payload for Cloud Vision API
  var payload = {
    requests: [
      {
        image: {
          content: Utilities.base64Encode(blob.getBytes())
        },
        features: [
          {
            type: "DOCUMENT_TEXT_DETECTION"
          }
        ]
      }
    ]
  };

  try {
    // Send the request to the Cloud Vision API
    var response = UrlFetchApp.fetch(visionApiUrl, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });

    // Parse the OCR result
    var ocrResult = JSON.parse(response.getContentText());
    //return JSON.stringify(ocrResult);
    return processOcrResponse(ocrResult);
    //return extractTextFromOcrResult(ocrResult);
  } catch (error) {
    console.error("Error processing file with Cloud Vision OCR:", error);
    return "Error processing file with Cloud Vision OCR:"+error;
  }
}


function extractTextFromOcrResult(ocrResult) {
  try {
    var textAnnotation = ocrResult.responses[0].fullTextAnnotation;
    return textAnnotation ? textAnnotation.text : "No text found.";
  } catch (error) {
    console.error("Error extracting text from OCR result:", error);
    return "Error extracting text from OCR result.";
  }
}

function saveTextToGoogleDoc(docName, text, folder) {
  // Create a new Google Doc
  var doc = DocumentApp.create(docName + " - OCR Results");
  doc.getBody().appendParagraph(text);
  doc.saveAndClose();

  // Move the document to the specified folder
  var docFile = DriveApp.getFileById(doc.getId());
  docFile.moveTo(folder);
  //folder.addFile(docFile);
  //DriveApp.getRootFolder().removeFile(docFile); // Remove from My Drive

  console.log("OCR result saved to Google Doc: " + docName);
}



