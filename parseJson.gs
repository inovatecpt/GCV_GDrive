/**
 * Process Google Vision OCR response to generate flowing text with paragraph breaks.
 * 
 * @param {Object} jsonResponse - The JSON response from Google Cloud Vision API.
 * @returns {string} - The extracted text.
 */
function processOcrResponse(jsonResponse) {
  let fullText = "";

  // Check if the response contains fullTextAnnotation
  //const fullTextAnnotation = jsonResponse.fullTextAnnotation || {};
  const fullTextAnnotation = jsonResponse.responses[0].fullTextAnnotation;

  // Iterate through the pages
  (fullTextAnnotation.pages || []).forEach((page) => {
    (page.blocks || []).forEach((block) => {
      (block.paragraphs || []).forEach((paragraph) => {
        let paragraphText = ""; // Buffer to store paragraph text

        (paragraph.words || []).forEach((word) => {
          let wordText = ""; // Buffer for word text

          (word.symbols || []).forEach((symbol) => {

            // Handle detected breaks
            const detectedBreak = symbol.property?.detectedBreak || {};
            const breakType = detectedBreak.type;


            // Append the character to the word
            if (symbol.text == "-" && breakType == "EOL_SURE_SPACE") {
              wordText += "";

            } else {
              wordText += symbol.text;
            }


            // Handle detected breaks
            //const detectedBreak = symbol.property?.detectedBreak || {};
            //const breakType = detectedBreak.type;

            if (breakType === "SPACE") { // Space
              wordText += " ";
            } else if (breakType === "LINE_BREAK") { // Line break (EOL)
              wordText += "\n";
            } else if (breakType === "EOL_SURE_SPACE") {
              if (symbol.text !== "-") {
                wordText += " ";
              }

              // Keep the word as-is (e.g., no additional space or break).
            } else if (breakType === "HYPHEN") { // Paragraph break
              wordText += "u";
            }
          });

          // Append processed word to the paragraph
          paragraphText += wordText;
        });

        // Append the paragraph text to flowing text with a paragraph break
        fullText += paragraphText + "\n";
      });
    });
  });

  return fullText;
}




