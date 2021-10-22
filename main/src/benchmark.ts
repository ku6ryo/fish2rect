import path from "path"
import Jimp from "jimp"
import { Fish2Rect } from "./Fish2Rect"
import { Fish2RectWasm } from "./Fish2RectWasm"

/**
 * Measures total execution time. 
 */
function benchmark(tag: string, times: number, process: () => void) {
  const startTime = new Date().getTime()
  for (let i = 0; i < times; i++) {
    process()
  }
  console.log(`${tag}: Finised in ${new Date().getTime() - startTime} ms`)
}

;(async () => {
  const sourcePath = path.join(__dirname, "fish.png")
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

  const times = 100
  const ts = new Fish2Rect()
  const wasm = new Fish2RectWasm()
  await wasm.prepare()
  benchmark("TypeScript", times, () => {
    ts.convert(sourceArray, sw, sh, captureAngle, rw, rh, resultAngle)
  })
  benchmark("WASM", times, () => {
    wasm.convert(sourceArray, sw, sh, captureAngle, rw, rh, resultAngle)
  })
})()