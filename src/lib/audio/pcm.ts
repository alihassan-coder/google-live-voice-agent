export function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToInt16(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer, 0, bytes.length >> 1);
}

type AudioCtxCtor = typeof AudioContext;
function audioContextCtor(): AudioCtxCtor {
  return window.AudioContext ?? (window as unknown as { webkitAudioContext: AudioCtxCtor }).webkitAudioContext;
}

/** Microphone → 16 kHz PCM16 chunks. */
export class MicCapture {
  private ctx?: AudioContext;
  private stream?: MediaStream;
  private node?: AudioWorkletNode;
  muted = false;

  async start(onChunk: (pcm: ArrayBuffer, level: number) => void) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    const Ctor = audioContextCtor();
    this.ctx = new Ctor();
    await this.ctx.audioWorklet.addModule("/worklets/mic-capture.js");
    const source = this.ctx.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.ctx, "mic-capture");
    this.node.port.onmessage = (e: MessageEvent<{ pcm: ArrayBuffer; level: number }>) => {
      if (this.muted) return onChunk(new Int16Array(e.data.pcm.byteLength / 2).buffer, 0);
      onChunk(e.data.pcm, e.data.level);
    };
    // Keep the graph pulled without making the mic audible.
    const sink = this.ctx.createGain();
    sink.gain.value = 0;
    source.connect(this.node).connect(sink).connect(this.ctx.destination);
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  stop() {
    this.node?.port.close();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close().catch(() => {});
    this.ctx = undefined;
    this.stream = undefined;
    this.node = undefined;
  }
}

/** Gapless playback of 24 kHz PCM16 chunks, with instant flush on barge-in. */
export class PcmPlayer {
  private ctx: AudioContext;
  private analyser: AnalyserNode;
  private nextTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private levelBuf: Float32Array<ArrayBuffer>;
  onIdle?: () => void;

  constructor() {
    const Ctor = audioContextCtor();
    this.ctx = new Ctor({ sampleRate: 24000 });
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.levelBuf = new Float32Array(this.analyser.fftSize);
    this.analyser.connect(this.ctx.destination);
  }

  async resume() {
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  get playing() {
    return this.sources.size > 0;
  }

  enqueue(b64: string) {
    const pcm = base64ToInt16(b64);
    if (!pcm.length) return;
    const buffer = this.ctx.createBuffer(1, pcm.length, 24000);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) data[i] = pcm[i] / 0x8000;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.analyser);
    const startAt = Math.max(this.nextTime, this.ctx.currentTime + 0.03);
    src.start(startAt);
    this.nextTime = startAt + buffer.duration;
    this.sources.add(src);
    src.onended = () => {
      this.sources.delete(src);
      if (this.sources.size === 0) this.onIdle?.();
    };
  }

  /** Caller started talking over the agent: drop everything queued. */
  flush() {
    for (const s of this.sources) {
      s.onended = null;
      try {
        s.stop();
      } catch {}
    }
    this.sources.clear();
    this.nextTime = 0;
    this.onIdle?.();
  }

  level() {
    this.analyser.getFloatTimeDomainData(this.levelBuf);
    let sum = 0;
    for (const v of this.levelBuf) sum += v * v;
    return Math.sqrt(sum / this.levelBuf.length);
  }

  close() {
    this.onIdle = undefined;
    this.flush();
    void this.ctx.close().catch(() => {});
  }
}
