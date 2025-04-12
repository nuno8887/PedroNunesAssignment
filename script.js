const API_KEY = 'AIzaSyBUx6lV_0mcOw6HzbfR6HIYqRvdHH16TT0';

let currentVideoID = null;
let englishTranscript = "";

document.getElementById('searchVideos').addEventListener('click', function () {
  const query = document.getElementById('videoQuery').value.trim();
  if (!query) {
    alert("Please enter a video name.");
    return;
  }
  
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('transcript').innerText = "Subtitles will appear here...";
  englishTranscript = "";
  currentVideoID = null;
  
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodeURIComponent(query)}&key=${API_KEY}`;
  
  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      const resultsDiv = document.getElementById('searchResults');
      if (!data.items || data.items.length === 0) {
        resultsDiv.innerHTML = '<p>No videos found.</p>';
        return;
      }
      
      data.items.forEach(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const thumbnail = item.snippet.thumbnails.default.url;
        
        const videoDiv = document.createElement('div');
        videoDiv.innerHTML = `<img src="${thumbnail}" alt="Thumbnail"><strong>${title}</strong>`;
        
        videoDiv.addEventListener('click', function () {
          currentVideoID = videoId;
          loadTranscript(videoId, 'en');
        });
        
        resultsDiv.appendChild(videoDiv);
      });
    })
    .catch(error => {
      console.error('Error searching videos:', error);
      document.getElementById('searchResults').innerHTML = '<p>Error fetching search results.</p>';
    });
});

function loadTranscript(videoId, lang) {
  const transcriptDiv = document.getElementById('transcript');
  transcriptDiv.innerHTML = 'Loading transcript...';
  
  fetch(`/api/transcript?videoID=${encodeURIComponent(videoId)}&lang=${encodeURIComponent(lang)}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        transcriptDiv.innerHTML = "Error: " + data.error;
        return;
      }

      const transcript = data.captions.map(caption => caption.text).join("\n");
      transcriptDiv.innerHTML = transcript;

      if (lang === 'en') {
        englishTranscript = transcript;
      }
    })
    .catch(error => {
      transcriptDiv.innerHTML = "Error fetching transcript: " + error.message;
    });
}

document.getElementById('changeLangButton').addEventListener('click', function () {
  const selectedLang = document.getElementById('langSelect').value;
  
  if (!currentVideoID) {
    alert("Please select a video first.");
    return;
  }
  
  if (selectedLang === 'en') {
    document.getElementById('transcript').innerHTML = englishTranscript;
    return;
  }
  
  if (!englishTranscript) {
    alert("Please load a transcript first.");
    return;
  }
  
  let textToTranslate = englishTranscript;
  if (textToTranslate.length > 500) {
    textToTranslate = textToTranslate.substring(0, 500);
  }
  
  const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${selectedLang}`;
  
  document.getElementById('transcript').innerHTML = "Translating transcript...";
  
  fetch(translateUrl)
    .then(response => response.json())
    .then(data => {
      if (data && data.responseData && data.responseData.translatedText) {
        document.getElementById('transcript').innerHTML = data.responseData.translatedText;
      } else {
        document.getElementById('transcript').innerHTML = "Translation data not available.";
      }
    })
    .catch(error => {
      document.getElementById('transcript').innerHTML = "Error fetching translation: " + error.message;
    });
});
