let previousSongElement

const currentSongTitle = document.getElementById('current-song-title')
const currentSongCover = document.getElementById('current-song-album-cover')
const audio = document.getElementById('audio')
const audioSource = document.getElementById('source')
const tableBody = document.getElementById('table-body')

let currentSongID = 1
let previousSongID = 1

window.electronAPI.onSendMetadata((_event, metadata) => {
    if (metadata.length != 0) {
        let i = 1;
        metadata.forEach((song) => {
            let row = document.createElement("tr")
            row.id = i
            let cell1 = document.createElement("td")
            cell1.innerHTML = row.id
            let cell2 = document.createElement("td")
            cell2.innerHTML = song.title + " "
            let cell3 = document.createElement("td")
            cell3.innerHTML = song.artist + ' - ' + song.album
            let cell4 = document.createElement("td")
            let seconds
            if (song.duration % 60 < 10) seconds = '0' + song.duration % 60
            else seconds = song.duration % 60
            cell4.innerHTML = Math.floor(song.duration / 60) + ':' + seconds
            let cellImage = document.createElement("img")
            cellImage.classList.add("cell-image")
            cellImage.src = song.picture
            cell3.appendChild(cellImage)
            row.appendChild(cell1)
            row.appendChild(cell2)
            row.appendChild(cell3)
            row.appendChild(cell4)
            row.addEventListener('click', (event) => {
                currentSongID = event.target.parentElement.getElementsByTagName('td')[0].innerHTML
                changeCurrentSong(event.target.parentElement, metadata[event.target.parentElement.getElementsByTagName('td')[0].innerHTML - 1])
            })
            tableBody.appendChild(row)
            i++
        })
        audio.addEventListener('ended', () => {
            if (currentSongID == metadata.length) {
                changeCurrentSong(document.getElementById('1'), metadata[0])
                currentSongID = 1
            }
            else {
                currentSongID++
                changeCurrentSong(document.getElementById(currentSongID) || document.getElementById('current-song'), metadata[currentSongID])
            }
        })
        changeCurrentSong(document.getElementById('1'), metadata[0])
    }
})

function changeCurrentSong(songElement, song) {
    console.log(songElement)
    console.log(currentSongID)
    if (!previousSongElement) previousSongElement = songElement
    else {
        previousSongElement.id = previousSongID
        previousSongID = currentSongID
        previousSongElement = songElement
    }
    currentSongID = songElement.id
    currentSongTitle.innerHTML = song.title + ' - ' + song.artist
    currentSongCover.src = song.picture
    audioSource.src = song.fileURL
    audio.load()
    audio.play()
    songElement.id = 'current-song'
}