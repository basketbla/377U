const router = require('express').Router();

const { google } = require('googleapis')

const GOOGLE_CLIENT_ID = '454609421610-r3sa3imjglbsjnn8qorsjbbtpfcf0tpn.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = 'com.googleusercontent.apps.454609421610-r3sa3imjglbsjnn8qorsjbbtpfcf0tpn'

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'http://localhost:3000'
)

async function getRefreshToken(code) {
  const token = await oauth2Client.getToken(code);
  console.log(token);
}

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

router.post('/create-tokens', async (req,res,next) => {
  try {
    const {code} = req.body
    const response = await oauth2Client.getToken(code)
    res.send(response)
    res.send(code)
  } catch(error) {
    next(error);
  }
});

module.exports = router;
