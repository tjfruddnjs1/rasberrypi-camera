const { RSA_X931_PADDING } = require('constants');
const express = require('express');
const fs = require('fs');
const { StreamCamera, Codec } = require('pi-camera-connect');
const exec = require('child_process');

const router = express.Router();

let streamCamera = null;

streamCamera = new StreamCamera({
    width: 1280,
    height: 720,
    fps: 10,
    codec: Codec.MJPEG
});

const recordingMinutes = 0.05; 

streamCamera.startCapture().then(() => {
    let videoStream = streamCamera.createStream();
    let date = new Date();
    console.log('capture start');

    setTimeout(() => {
        console.log('finish capture');
        streamCamera.stopCapture();

        let year = date.getFullYear().toString();
        let month = (date.getMonth()+1).toString();
        if(month.length == 1) month = '0'+ month;

        let day = date.getDate().toString();
        if(day.length == 1) day = '0'+ day;

        let writeStream = fs.createWriteStream( `./public/recordCCTV/${year+month+day}.mjpeg`,{flags:'w'});

        videoStream.pipe(writeStream);

        exec.exec('ffmpeg -i ./public/recordCCTV/20210602.mjpeg -pix_fmt yuv420p -b:v 4000k -c:v libx264 ./public/recordCCTV/20210602.mp4');

        console.log(year+month+day +'.mp4 파일이 생성되었습니다.');
    }, recordingMinutes * 60 * 1000);
});


router.get('/stream.jpeg', (req, res) => {
    console.log('get request occured');
    res.writeHead(200, {
        'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
        Pragma: 'no-cache',
        Connection: 'close',
        'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary'
    });

    // add frame data event listener

    let isReady = true;

    let frameHandler = (frameData) => {
        try {
            if (!isReady) {
                return;
            }
            isReady = false;
            res.write('--myboundary\nContent-Type: image/jpg\nContent-length: ${frameData.length}\n\n');
            res.write(frameData, function () {
                isReady = true;
            });
        }
        catch (ex) {
        }
    }
    setInterval(async () => {
        streamCamera.takeImage()
        .then(data => {
            let array = new Uint8Array(data)
            frameHandler(array)
        });
    }, 100);
});

module.exports = router;