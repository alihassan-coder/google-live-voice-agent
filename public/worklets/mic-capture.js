// Runs on the audio thread. Converts the mic stream (usually 44.1/48 kHz float)
// into 16 kHz, 16-bit PCM frames of ~40 ms, which is what the Live API expects.
class MicCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.ratio = sampleRate / this.targetRate;
    this.frameSize = 640; // 40 ms at 16 kHz
    this.frame = new Int16Array(this.frameSize);
    this.frameIndex = 0;
    this.carry = 0; // fractional read position carried between render quanta
    this.sumSquares = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel) return true;

    // Box-filter downsample: average the source samples that fall into each output sample.
    let pos = this.carry;
    while (pos + this.ratio <= channel.length) {
      const start = Math.floor(pos);
      const end = Math.floor(pos + this.ratio);
      let sum = 0;
      for (let i = start; i < end; i++) sum += channel[i];
      const s = Math.max(-1, Math.min(1, sum / Math.max(1, end - start)));
      this.sumSquares += s * s;
      this.frame[this.frameIndex++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      pos += this.ratio;

      if (this.frameIndex === this.frameSize) {
        const level = Math.sqrt(this.sumSquares / this.frameSize);
        this.port.postMessage({ pcm: this.frame.buffer, level }, [this.frame.buffer]);
        this.frame = new Int16Array(this.frameSize);
        this.frameIndex = 0;
        this.sumSquares = 0;
      }
    }
    this.carry = pos - channel.length;
    return true;
  }
}

registerProcessor("mic-capture", MicCapture);
