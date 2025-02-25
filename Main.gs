function onDriveItemsSelected(e) {
  console.log('Event object:', JSON.stringify(e)); // Log the entire event object

  try {

    if (!e || !e.drive || !e.drive.selectedItems) {
      console.error('Invalid event object:', e);
      return createFileCard('No files selected.\nSelect max.30 images')
      //return createFileCard('No files selected.\nSelect max.100 images',undefined,undefined,undefined,undefined,undefined,fileSelectionMode);

    }

    var original_selection = e.drive.selectedItems
    var items = e.drive.selectedItems.slice(0, 30);

    // Check if all selected items are valid files
    var allValidFiles = items.every(function (item) {
      return (
        item.mimeType === MimeType.JPEG ||
        item.mimeType === MimeType.PNG ||
        item.mimeType === MimeType.PDF
      );
    });

    if (!allValidFiles) {
      return createFileCard('Please select only JPG, PNG, or PDF files.');
    }

    console.log('Selected items:', JSON.stringify(items)); // Log selected items


    var text = items.map(function (item) {
      console.log('Processing item:', item); // Log item being processed
      var title = truncate(item.title);
      //var file = DriveApp.getFileById(item.id); // This is where it might fail
      return Utilities.formatString(
        "%s",
        title
        //parentName
      );
    }).join('\n');

    var button = null;

    var itemIds = items.map(function (item) {
      return item.id;
    });
    var firstItemName = items[0].title.replace(/\.jpg$/i, '');
    var lastItemName = items[items.length - 1].title.replace(/\.jpg$/i, '');
    var textInput = CardService.newTextInput()
      .setFieldName("textInput")
      .setTitle("File name")
      .setHint("Edit file title")
    if (items.length > 1) {
      textInput.setValue(firstItemName + " - " + lastItemName);
    } else {
      textInput.setValue(firstItemName);
    }

    var namesList = getNameList();//.reverse();
    var defaultFolderName = getLastNameEntered(namesList);

    var suggestions = CardService.newSuggestions();
    for (var i = 0; i < namesList.length; i++) {
      suggestions.addSuggestion(namesList[i]);
    }

    var folderNameInput = CardService.newTextInput()
      .setFieldName("folderNameInput")
      .setTitle("Folder Name")
      .setHint("Set Folder Name")
      .setValue(defaultFolderName)
      .setSuggestions(suggestions);


    const colorDropdown = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.DROPDOWN)
      .setFieldName("colorDropdown")
      .setTitle("Select a color for the folder.");
    for (var colorName in colorPalette) {
      if (colorName != "Mouse (Default Gray)") {
        colorDropdown.addItem(colorName, colorName, false);
      } else {
        colorDropdown.addItem(colorName, colorName, true);
      }
    }


    // Create a button to start api call
    var action = CardService.newAction().setFunctionName('uploadFiles')
      .setParameters({
        'itemIds': itemIds.join(','),
        'textInputFieldName': 'textInput',
        //'colorDropdown': 'selectedColor', 
        'folderNameInputFieldName': 'folderNameInput'
      });
    if (items) {
      button = CardService.newTextButton()
        .setText('Process OCR')
        .setOnClickAction(action);
    } else {
      var button = null; // or simply don't pass it if items are null
    }

    // Return the card with or without the button
    return createFileCard(text, button, textInput, folderNameInput, colorDropdown, original_selection.length);
  } catch (error) {
    console.error('Error in onDriveItemsSelected:', error); // Log error details
    return createFileCard('An error occurred while processing the files: ' + error.message);
  }
}

function getNameList() {
  var scriptProperties = PropertiesService.getScriptProperties();
  folderNameList = scriptProperties.getProperties()["folderNameList"]
  folderNameList = folderNameList.split(",");
  return folderNameList;
}

function getLastNameEntered(nameList) {
  var lastElm = nameList[nameList.length - 1]
  return lastElm;
}

function addFolderName(new_name) {

  var scriptProperties = PropertiesService.getScriptProperties();
  folderNameList = scriptProperties.getProperties()["folderNameList"]
  folderNameList = folderNameList.split(",");

  //Logger.log(folderNameList, folderNameList.length);

  if (folderNameList.includes(new_name)) {
    let index = folderNameList.indexOf(new_name)
    if (index !== -1 && index !== folderNameList.length - 1) {
      folderNameList.splice(index, 1);
      folderNameList.push(new_name);
    }
  } else {
    if (folderNameList.length === 10) {
      folderNameList.shift();
    }
    folderNameList.push(new_name);
  }

  new_prop = folderNameList.join(",");

  scriptProperties.setProperties({ "folderNameList": new_prop })
  folderNameList = scriptProperties.getProperties()["folderNameList"].split(",")

  //return folderNameList;
}

