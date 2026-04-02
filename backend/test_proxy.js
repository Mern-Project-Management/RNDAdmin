const http = require('http');

const data = JSON.stringify({
  subtitle: "Culture",
  title: "Joy",
  description: "Test description through proxy",
  priority: 1,
  status: true
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/lifeAtRndCategory/add',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
