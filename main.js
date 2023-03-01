const { app, BrowserWindow } = require('electron')
const mm = require('music-metadata')
const url = require('url')
const path = require('path')
const fs = require('fs')
const os = require('os')

const isMusicFile = (filepath) => {
    const types = ['.mp3', '.wav']
    const ext = path.extname(filepath)

    if (types.includes(ext)) {
        return true
    }
    else return false
}

async function asyncGetMusicMetadata(file) {
    try {
        const fileMetadata = await mm.parseFile(file);
        return fileMetadata
    } catch (error) {
        return console.error('An error was encountered==' + error.message)
    }
}

const loadTracks = (musicFolder) => {
    let tracks = []

    fs.readdir(musicFolder, function (err, files) {
        if (err) {
            console.log('Error encountered: ' + err)
        }
       
        if (files) {
            files.forEach(function (file) {
                const musicFilePath = musicFolder + "\\" + file
                if (isMusicFile(musicFilePath)) {
                    tracks.push({
                        path: musicFilePath,
                        title: '',
                        album: '',
                        artist: '',
                        duration: '',
                        picture: '',
                        pictureFormat: '',
                        fileURL: ''
                    })
                }
            })
        }

        tracks.forEach(function (track) {
            asyncGetMusicMetadata(track.path).then(

                function (value) {
                    const metadata = value

                    if (value) {
                        const picture = mm.selectCover(metadata.common.picture)

                        track.title = metadata.common.title
                        track.album = metadata.common.album
                        track.artist = metadata.common.artist
                        track.duration = Math.round(metadata.format.duration)
                        track.picture = picture ? picture.data.toString('base64') : "./res/img/album-cover.jpg"
                        track.pictureFormat = picture ? picture.format : ""
                        track.fileURL = url.pathToFileURL(track.path).href
                    }
                },
                function (error) {
                    console.log(error)
                }
            )
        })
    })

    return tracks
}

const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 750,
        minWidth: 800,
        minHeight: 750,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    window.loadFile('index.html')

    return window
}

app.whenReady().then(() => {
    const mainWindow = createWindow()
    const user = os.userInfo().username

    const folderPath = 'C:\\Users\\' + user + '\\Music';
    const musicFiles = loadTracks(folderPath)

    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.send('send-metadata', musicFiles)
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit()
})