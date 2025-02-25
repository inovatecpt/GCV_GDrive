var colorPalette = {
  "Chocolate ice cream":"#ac725e",
  "Old brick red":"#d06b64",
  "Cardinal":"#f83a22",
  "Wild straberries":"#fa573c",
  "Mars orange":"#ff7537",
  "Yellow cab":"#ffad46",
  "Spearmint":"#42d692",
  "Vern fern":"#16a765",
  "Asparagus":"#7bd148",
  "Slime green":"#b3dc6c",
  "Desert sand":"#fbe983",
  "Macaroni":"#fad165",
  "Sea foam":"#92e1c0",
  "Pool":"#9fe1e7",
  "Denim":"#9fc6e7",
  "Rainy sky":"#4986e7",
  "Blue velvet":"#9a9cff",
  "Purple dino":"#b99aff",
  "Mouse (Default Gray)":"#8f8f8f",
  "Mountain grey":"#cabdbf",
  "Earthworm":"#cca6ac",
  "Bubble gum":"#f691b2",
  "Purple rain":"#cd74e6",
  "Toy eggplant":"#a47ae2"
 };

 function getHexFromColor(colorName) {
  // Retrieve the hex value using the color name as the key
  var hexValue = colorPalette[colorName]; 

  // If the color name is not found, handle the error (e.g., return a default value or show a message)
  if (hexValue === undefined) {  
    return "Color not found"; // Or a default color like "#000000"
  }

  return hexValue;
}
