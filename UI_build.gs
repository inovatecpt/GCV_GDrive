/**
 * The maximum number of characters that can fit in the file name display.
 */
var MAX_MESSAGE_LENGTH = 40;

/**
 * Creates a card with the names of the selected files.
 * Optionally includes a button (e.g., to open the folder).
 * @param {String} text The text to display on the card.
 * @param {Object} [button] Optional button widget to add to the card.
 * @return {CardService.Card} The assembled card.
 */
function createFileCard(text, button, textInput, folderNameInput, colorDropdown, itemsLenght) {


  // Create a card section with the file names as text.
  var textParagraph = CardService.newTextParagraph().setText(text);



  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
  var section2 = CardService.newCardSection();
  var section4 = CardService.newCardSection();
  var card = CardService.newCardBuilder()
  /*
  if (fileSelectionMode) {
    section2.addWidget(fileSelectionMode);
    //card.addSection(section2);
  }
  */
  //section.addWidget(fileSelectionMode);
  section.addWidget(textParagraph);

  if (textInput) {
    if (itemsLenght > 30) {
      section.setHeader("You exceeded the allowed number of selected files.\nOnly the first 30 files will be converted.");
    } else {
      section.setHeader("Selected Files [" + itemsLenght + "]:");
      
    }
    section2.addWidget(textInput);
    //card.addSection(section2);
  }

  card.addSection(section);

  if (folderNameInput) {
    section2.addWidget(folderNameInput);
    //card.addSection(section2);
  }

  if (colorDropdown) {
    section2.addWidget(colorDropdown);
  }


  // Add the button if provided
  if (button) {
    section2.addWidget(button);
    card.addSection(section2);
  }
var copyrightParagraph = CardService.newTextParagraph().setText('<a href="https://www.inovatec.pt/">By Inovatec (Portugal), NID');
section4.addWidget(copyrightParagraph);
card.addSection(section4);

  return card.build();
}

/**
 * Callback for rendering the homepage card.
 * @return {CardService.Card} The card to show to the user.
 */
function onHomepage(e) {
  return createFileCard('No files selected.');
}

/**
 * Truncate a message to fit the allowed length.
 * @param {string} message The message to truncate.
 * @return {string} The truncated message.
 */
function truncate(message) {
  if (message.length > MAX_MESSAGE_LENGTH) {
    message = message.slice(0, MAX_MESSAGE_LENGTH);
    message = message.slice(0, message.lastIndexOf(' ')) + '...';
  }
  return message;
}
