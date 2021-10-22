/**
 * Fish eye image to rectangle. Implemented in ture TypeScript.
 */
export class Fish2Rect {
  convert(sourceArray: Uint32Array, sw: number, sh: number, captureAngle: number, rw: number, rh: number, resultAngle: number) {
    const resultArray = [] as number[]
    for (let i = 0; i < rw; i++) {
      for (let j = 0; j < rh; j++) {
        const maxR = Math.tan(resultAngle / 2)
        // Result position
        const x = ((i + 0.5) / rw * 2 - 1) * maxR
        const y = ((j + 0.5) / rh * 2 - 1) * maxR
        const r = Math.sqrt(x * x + y * y)
        // cos(theta)
        const ct = x / r
        // sin(theta)
        const st = y / r
        // Angle from vertical axis
        const phi = Math.atan(r)
        // Source position
        const sr = phi / (captureAngle / 2)
        const sx = sr * ct
        const sy = sr * st
        // Sorce image pixel index
        const si = (sx * sw + sw) >> 1
        const sj = (sy * sh + sh) >> 1

        let color = 0x000000FF
        if (si >= 0 && si < sw && sj >= 0 && sj < sh) {
          color = sourceArray[si * sw + sj]
        }
        resultArray.push(color)
      }
    }
    return resultArray
  }
}