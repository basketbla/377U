
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
  blue: "#4275ff",
  random: "#233D4D"
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