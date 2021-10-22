import path from "path"
import { Fish2RectWasm } from "./Fish2RectWasm"
import Jimp from "jimp"

;(async () => {
  const startTime = new Date().getTime()
  const sourcePath = path.join(__dirname, "fish.png")
  const resultPath = path.join(__dirname, "../results", new Date().getTime() + "_wasm.png")
  const source = await Jimp.read(sourcePath)
  const sh = source.getHeight()
  const sw = source.getWidth()
  const sourceArray = new Uint32Array(sw * sh)
  for (let i = 0; i < sw; i++) {
    for (let j = 0; j < sh; j++) {
      sourceArray[i * sw + j] = source.getPixelColor(i, j)
    }
  }
  const captureAngle = Math.PI
  const rw = 512
  const rh = 512
  const resultAngle = Math.PI * 2 / 3
  const converter = new Fish2RectWasm()
  await converter.prepare()
  const resultArray = converter.convert(sourceArray, sw, sh, captureAngle, rw, rh, resultAngle)
  const result = new Jimp(rw, rh);
  for (let i = 0; i < rw; i++) {
    for (let j = 0; j < rh; j++) {
      result.setPixelColor(resultArray[i * rw + j], i, j)
    }
  }
  result.write(resultPath)
  console.log(`WASM: Finised in ${new Date().getTime() - startTime} ms`)
})()