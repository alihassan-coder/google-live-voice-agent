import "server-only";
import { Modality, type LiveConnectConfig } from "@google/genai";
import { personas, type NicheId } from "@/lib/demo/personas";
import { toolDeclarations } from "@/lib/demo/tools";
import { localTimeString } from "@/lib/demo/lead";

export const LIVE_MODEL = process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live";
export const LIVE_API_VERSION = "v1alpha";
/** Hard cap on one demo call. The token itself expires a minute after this. */
export const MAX_CALL_SECONDS = 240;

export function buildLiveConfig(niche: NicheId, now = new Date()): LiveConnectConfig {
  const persona = personas[niche];
  return {
    responseModalities: [Modality.AUDIO],
    systemInstruction: {
      parts: [
        {
          text: `${persona.prompt}\n\nRight now it is ${localTimeString(now)} in Tampa. The office opens again at 8:00 AM.`,
        },
      ],
    },
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voice } },
    },
    tools: [{ functionDeclarations: toolDeclarations }],
    inputAudioTranscription: {},
    outputAudioTranscription: {},
  };
}
