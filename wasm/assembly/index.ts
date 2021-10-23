export function malloc(len: i32): usize {
  return heap.alloc(len)
}

export function free(ptr: usize): void {
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
): StaticArray<u32> {
  const result = new StaticArray<u32>(rw * rh)
  const maxR = Mathf.tan(resultAngle / 2)
  const halfInvCaptureAngle: f32 = 1.0 / (captureAngle / 2)
  const ihwR: f32 = 0.5 * maxR / <f32>rw
  const ihhR: f32 = 0.5 * maxR / <f32>rh
  const swf: f32 = <f32>sw
  const shf: f32 = <f32>sh

  for (let i = 0; i < rw; i++) {
    for (let j = 0; j < rh; j++) {
      // Result position
      const x = (<f32>i + 0.5) * ihwR - maxR
      const y = (<f32>j + 0.5) * ihhR - maxR
      const r = Mathf.sqrt(x * x + y * y)
      const invR: f32 = 1.0 / r
      // Angle from vertical axis
      const phi = Mathf.atan(r)
      // Source position
      const sr = phi * halfInvCaptureAngle
      const sx = (sr * invR) * x
      const sy = (sr * invR) * y
      // Sorce image pixel index
      const si = ((sx * swf + swf) as i32) >> 1
      const sj = ((sy * shf + shf) as i32) >> 1

      let color = 0x000000FF
      if (<u32>si < <u32>sw && <u32>sj < <u32>sh) {
        color = load<i32>(ptr + (si * sw + sj) * 4)
      }
      unchecked(result[i * rw + j] = color)
    }
  }
  return result
}
