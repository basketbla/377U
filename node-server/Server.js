require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const port =  process.env.PORT || 3001;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(port, () =>
  console.log(`Express server is running on localhost:${port}`)
);

app.get('/', (req, res) => {
  res.send('hi, it really do be running')
})

app.post('/api/messages', async (req, res) => {
  for (let number of req.body.numbers) {
    await client.messages
      .create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: number,
        body: req.body.body,
      }).catch(err => {
        console.log(err);
        res.send(JSON.stringify({ success: false }));
      });
  }
  res.send(JSON.stringify({ success: true }))
});