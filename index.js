const express = require('express')
const app = express()
const port = 3000

app.get('/files', (req, res) => {

  const testFolder = './img/';
  const fs = require('fs');

  let files = [];

  fs.readdirSync(testFolder).forEach(file => {
    files.push(file);
  });

  res.send(files);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})