
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