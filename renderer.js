/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const loadBtn = document.getElementById('loadBtn');
const url = document.getElementById('khlink');
const statusText = document.getElementById('status');
const trackList = document.getElementById('trackList');
const folderSelectBtn = document.getElementById('folderSelectBtn');
const ddirInput = document.getElementById('downloadDir');
const downloadBtn = document.getElementById('downloadBtn');
let loadResult;

// for testing 
/*
let loadResult = {
    status: '4 links acquired. Select which tracks to download with checkboxes.',
    track_names: [
      'Snake Eater',
      "''METAL GEAR SOLID'' Main Theme (METAL GEAR SOLID 3 Version)",
      "Don't Be Afraid",
      'Snake Eater (Instrumental)'
    ],
    track_urls: [
      'https://downloads.khinsider.com/game-soundtracks/album/snake-eater-song-from-metal-gear-solid-3/01%2520Snake%2520Eater.mp3',
      'https://downloads.khinsider.com/game-soundtracks/album/snake-eater-song-from-metal-gear-solid-3/02%2520%2527%2527METAL%2520GEAR%2520SOLID%2527%2527%2520Main%2520Theme%2520%2528METAL%2520GEAR%2520SOLID%25203%2520Version%2529.mp3',
      'https://downloads.khinsider.com/game-soundtracks/album/snake-eater-song-from-metal-gear-solid-3/03%2520Don%2527t%2520Be%2520Afraid.mp3',
      'https://downloads.khinsider.com/game-soundtracks/album/snake-eater-song-from-metal-gear-solid-3/04%2520Snake%2520Eater%2520%2528Instrumental%2529.mp3'
    ]
};*/

loadBtn.addEventListener('click', (_event) => {
    _event.preventDefault();
    window.API.runIndexer(url.value);
})

folderSelectBtn.addEventListener('click', async (_event) => {
    _event.preventDefault();
    const filePath = await window.API.openFile();
    ddirInput.value = filePath;
    console.log(filePath);
})

downloadBtn.addEventListener('click', (_event) => {
    _event.preventDefault();
    downloadDir = ddirInput.value;
    if (downloadDir === ''){
        statusText.innerText = 'Status: [ERROR] Provide download path.';
        return;
    } else if (loadResult === undefined || loadResult.track_names === ''){
        statusText.innerHTML = 'Status: [ERROR] Load URL.';
        return;
    }
    
    loadBtn.disabled = true;
    downloadBtn.disabled = true;

    jsonOut = JSON.parse(JSON.stringify(loadResult));
    inputs = document.getElementsByClassName('check');
    for (i = loadResult.track_names.length-1; i >= 0; i--){
        console.log(inputs[i].checked)
        if (!inputs[i].checked){
            jsonOut.track_names[i] = '';
            jsonOut.track_urls[i] = '';
        }
    }

    jsonOut.download_directory = downloadDir;
    console.log(JSON.stringify(jsonOut));

    window.API.runDownloader(JSON.stringify(jsonOut));
})

window.API.receiveUpdate((jsonResponse) => {
    loadResult = JSON.parse(jsonResponse);
    statusText.innerText = 'Status: ' + loadResult.status;
    console.log('State: ' + loadResult.state);

    if (loadResult.state === 3){
        loadBtn.disabled = true;
    } else {
        loadBtn.disabled = false;
        downloadBtn.disabled = false;
        trackList.innerHTML = '';
    }

    if (loadResult.track_names != '' && loadResult.state != 3){
        for (let trackName of loadResult.track_names) {
            trackList.innerHTML +=
                `<div class="track">
                <p>${trackName}.mp3</p>
                <input type="checkbox" class="check" checked>
                </div>`;
        }
    }
})