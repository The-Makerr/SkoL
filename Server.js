const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();


app.use((err, req, res, next) => {
  if (err instanceof Error && err.status === 429) {
    // Render a custom page for 429 error (Too Many Requests)
    res.status(429).sendFile(path.join(__dirname, 'TooManyRequests.html'));
  } else {
    next(err);
  }
});

// DDoS detection middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1, // Maximum number of requests per windowMs
});

// Apply the DDoS detection middleware to all routes
app.use(limiter);


app.use((req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  try {
  console.log(`========= New Request from IP: ${ipAddress} =========`);
} catch (error) {
  console.error('Error retrieving IP information:', error);
}
  next();
});



// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle requests for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((req, res) => {
  res.status(429).sendFile(path.join(__dirname, 'TooManyRequests.html'));
});

// Function to send Discord webhook notification
async function sendDiscordNotification(message) {
  try {
    axios.post(webhookUrl, { content: message });
    console.log('Discord notification sent successfully.');
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}

// Start the server
app.listen(2302, () => {
  console.log('Server is running on port 2302');
});
