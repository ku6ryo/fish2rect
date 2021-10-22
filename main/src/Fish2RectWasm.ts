import path from "path"
import fs from "fs"

/**
 * Fish eye image to rectangle. WASM implementation.
 */
export class Fish2RectWasm {
  private instance: WebAssembly.Instance | null
  private memory: WebAssembly.Memory | null

  async prepare() {
    const pathToWasm = path.join(__dirname, "fish2rect.wasm")
    const file = fs.readFileSync(pathToWasm)
    const wasmInstanciatedSource = await WebAssembly.instantiate(file, {
      env: {
        abort: (mPtr: number, fPtr: number, line: number, column: number) => {
          const memory = this.getMemory()
          const mLen = new Uint32Array(memory.buffer)[(mPtr >> 2) - 1]
          const fLen = new Uint32Array(memory.buffer)[(fPtr >> 2) - 1]
          const decoder = new TextDecoder()
          const msg = decoder.decode((new Uint8Array(memory.buffer)).subarray(mPtr, mPtr + mLen))
          const file = decoder.decode((new Uint8Array(memory.buffer)).subarray(fPtr, fPtr + fLen))
          throw new Error(`${file} ${line}:${column} ${msg}`)
        },
      },
    })
    this.instance = wasmInstanciatedSource.instance
    this.memory = this.instance.exports.memory as WebAssembly.Memory
  }

  private getMemory() {
    if (!this.memory) throw new Error("no memory")
    return this.memory
  }

  private getInstance() {
    if (!this.instance) throw new Error("no instance")
    return this.instance
  }

  convert(sourceArray: Uint32Array, sw: number, sh: number, captureAngle: number, rw: number, rh: number, resultAngle: number) {
    const memory = this.getMemory()
    const instance = this.getInstance()
    const start = new Date().getTime()
    const sourcePtr = (instance.exports.malloc as (len: number) => number)(sw * sh * 4)
    ;(new Uint32Array(memory.buffer)).set(sourceArray, sourcePtr >> 2)
    const resultPtr = (instance.exports.convert as (
      ptr: number,
      sw: number,
      sh: number,
      captureAngle: number,
      rw: number,
      rh: number,
      resultAngle: number
    ) => number)(
      sourcePtr,
      sw,
      sh,
      captureAngle,
      rw,
      rh,
      resultAngle
    )
    return new Uint32Array(memory.buffer.slice(resultPtr, resultPtr + rw * rh * 4))
  }
}