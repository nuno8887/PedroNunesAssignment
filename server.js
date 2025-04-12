// server.js

const express = require('express');
const path = require('path');
const { getSubtitles } = require('youtube-captions-scraper');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/api/transcript', async (req, res) => {
  const videoID = req.query.videoID;
  const lang = req.query.lang;
  
  if (!videoID || !lang) {
    return res.status(400).json({ error: 'Both "videoID" and "lang" query parameters are required.' });
  }
  
  try {
    const captions = await getSubtitles({
      videoID: videoID,
      lang: lang
    });
    
    res.json({ videoID, captions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
