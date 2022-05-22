
// Actual server
export const NODE_URL = 'https://michael-the-app-server.herokuapp.com';

// For local testing
// export const NODE_URL = 'http://localhost:3001';


export const cleanNumber = (phoneNumber) => {
  // Clean it up
  phoneNumber.replace(' ', '');
  phoneNumber.replace('(', '');
  phoneNumber.replace(')', '');
  phoneNumber.replace('-', '');
  if (!phoneNumber.includes('+')) {
    phoneNumber = '+1' + phoneNumber;
  }
  return phoneNumber;
}

export const COLORS = {
  grey: "#808080",
  //blue: "#4275ff",
  blue: "#FDC93A",
  random: "#233D4D",
  darkGrey: "#8F8D8F",
  //darkGrey: "#5e5e5e",
  medGrey: "#e8e8e8",
  lightGrey: "#efeff0",
  iosBlue: "#007AFF",
  yellow: "#FDC93A"
}

export const PROFILE_COLORS = [
  "#233D4D",
  "#FE7F2D",
  "#A1C181",
  "#619B8A",
  "#AED9E0",
  "#8B687F",
  "#9B2915",
  "#8A817C",
  "#A5C882",
  "#F7DD72",
  "#4E6766"
]

// Default profile image, can change the size if needed with =s100 (100 is the size)
export const DEFUALT_PROFILE_PIC = 'https://lh3.googleusercontent.com/a/default-user';

export const hash = (inputstr) => {
  var hash = 0;
  for (var i = 0; i < inputstr.length; i++) {
      var code = inputstr.charCodeAt(i);
      hash = ((hash<<5)-hash)+code;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export const NOTIFICATION_TYPES = {
  newFriendRequest: 'newFriendRequest',
  message: 'message'
}