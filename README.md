## Run

Connect to Bela via the USB-C port
If you want to run on laptop: http://localhost:3000 = laptop's npm start (sends OSC over USB to 192.168.7.2:9000)

If you want to run on bela: http://192.168.7.2:3001 = the Bela's systemd service (sends OSC to 127.0.0.1:9000)

- This code is stored locally on the Bela, and should run anytime the bela is powered.
- To play songs, enter the name of the folder name that was uploaded to the imu-audioplayer project and press "play".


## Change
If you want to make changes to this code, upload them to bela with:
```sh
npm run deploy
```
OR ssh into the Bela with 
```sh
ssh root@192.168.7.2
```

If you ever change package.json (new dependency, version bump, etc.), use 
```sh
npm run deploy:full
```
