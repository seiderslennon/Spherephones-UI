# spherephones-ui

A tiny local web UI that sends OSC `/xyz` messages to a Bela board.

Each of four object panels has azimuth, elevation, and radius sliders. The
browser converts spherical to cartesian and POSTs `{i, x, y, z}` to a local
Node bridge, which forwards the values as an OSC message:

```
/xyz  <object_index:float>  <x:float>  <y:float>  <z:float>
```

## Run

```sh
npm install
npm start
```

Then open <http://localhost:3000> in a browser. Moving any slider sends the
updated cartesian coordinates for that object over OSC to the Bela.

## Configuration

- **Bela IP / port** and the local HTTP port live at the top of
  [server.js](server.js):

  ```js
  const BELA_HOST = "192.168.7.2";
  const BELA_PORT = 9000;
  const HTTP_PORT = 3000;
  ```

- **Spherical-to-cartesian convention** lives in `sphericalToCartesian` near
  the top of the `<script>` block in [public/index.html](public/index.html).
  The default is the math-textbook convention:
  - azimuth `0` = `+x` axis, increases counter-clockwise toward `+y`
  - elevation `0` = horizontal plane, `+90` = `+z` (up)

  If your Bela code expects a different axis layout (e.g. `+y` forward, `+z`
  up), flip the relevant signs / swap the `x`/`y`/`z` assignments in that
  one function.

- Slider ranges (`-180..180`, `-90..90`, `0..2`) live in the `PARAMS` array
  just below the conversion function.

## Notes

- Browsers can't speak UDP, hence the small Node bridge. The page POSTs
  per-object updates, throttled to one request per object per animation
  frame so dragging doesn't flood the network.
- No build step, no framework. The whole UI is one HTML file.
# Spherephones-UI
