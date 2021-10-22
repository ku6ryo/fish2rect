export function malloc(len: i32): usize {
  return heap.alloc(len)
}

export function free(ptr: i32): void {
  heap.free(ptr)
}

/**
 * @param ptr Pointer to the source data.
 * @param sw Source image width
 * @param sh Source image height
 * @param captureAngle Catupure angle of image. Deppeds on camera spec. Usually it's 2 * pi.
 * @param rw Result image width
 * @param rh Result image height
 * @param resultAngle View 
 * @returns 
 */
export function convert(
  ptr: i32,
  sw: i32,
  sh: i32,
  captureAngle: f32,
  rw: i32,
  rh: i32,
  resultAngle: f32
): ArrayBuffer {
  const result = new Uint32Array(rw * rh)
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
      const si = ((sx * sw + sw) as i32) >> 1
      const sj = ((sy * sh + sh) as i32) >> 1

      let color = 0x000000FF
      if (si >= 0 && si < sw && sj >= 0 && sj < sh) {
        color = load<i32>(ptr + (si * sw + sj) * 4)
      }
      result[i * rw + j] = color
    }
  }
  return result.buffer
}