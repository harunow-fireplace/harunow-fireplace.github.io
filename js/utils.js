function getInitial(inputString) {
    // Check if the input is a non-empty string
    if (typeof inputString === 'string' && inputString.length > 0) {
        return inputString.charAt(0).toUpperCase();
    } else {
        return null; // or any default value you prefer for empty or non-string inputs
    }
}


function stringToColor(str) {
  // Simple string hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to a 6-digit hexadecimal color
  const color = "#" + ((hash & 0x00FFFFFF).toString(16)).toUpperCase().padStart(6, '0');

  return color;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }