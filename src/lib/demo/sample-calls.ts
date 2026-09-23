import type { NicheId } from "./personas";

export type SampleEvent =
  | { at: number; type: "say"; role: "agent" | "caller"; text: string }
  | { at: number; type: "tool"; name: string; args: Record<string, unknown> };

/**
 * Scripted calls used when the live demo can't run (no mic, quota, network).
 * Tool names and args match src/lib/demo/tools.ts so the owner panel fills the same way.
 * `slot_id` is left unmatched on purpose: book_inspection falls back to the first open slot,
 * which is "Tomorrow at 8:00 AM" for roofing and "tonight" for a water emergency.
 */
export const sampleCalls: Record<NicheId, SampleEvent[]> = {
  roofing: [
    { at: 600, type: "say", role: "agent", text: "Bayshore Roofing, this is Maya — sounds like you might need a hand. What's going on?" },
    { at: 5200, type: "say", role: "caller", text: "Hi, yeah. That storm tonight — there's a brown stain on my living room ceiling and it's getting bigger." },
    { at: 10800, type: "tool", name: "update_caller", args: { issue: "Ceiling stain spreading after storm" } },
    { at: 11000, type: "say", role: "agent", text: "Oh no, I'm sorry. Is water actually dripping inside right now?" },
    { at: 14600, type: "say", role: "caller", text: "Not dripping yet. It's just wet and kind of sagging a little." },
    { at: 18600, type: "tool", name: "set_urgency", args: { level: "urgent", reason: "Wet, sagging ceiling after storm" } },
    { at: 18800, type: "say", role: "agent", text: "Okay. Put a towel or bucket under it just in case. Can I get your first name?" },
    { at: 23200, type: "say", role: "caller", text: "It's Dana." },
    { at: 24600, type: "tool", name: "update_caller", args: { name: "Dana" } },
    { at: 24800, type: "say", role: "agent", text: "Thanks, Dana. What's the address?" },
    { at: 27400, type: "say", role: "caller", text: "4512 West Bay Street, Tampa." },
    { at: 30200, type: "tool", name: "update_caller", args: { address: "4512 W Bay St, Tampa" } },
    { at: 30400, type: "say", role: "agent", text: "Got it. Roughly how old is the roof?" },
    { at: 33000, type: "say", role: "caller", text: "Uh, maybe fifteen years? We bought the house in 2014." },
    { at: 36800, type: "tool", name: "update_caller", args: { detail: "~15-year-old roof, no active drip" } },
    { at: 37000, type: "say", role: "agent", text: "And are you planning to go through insurance on this?" },
    { at: 40200, type: "say", role: "caller", text: "Yeah, probably. I'll call them tomorrow." },
    { at: 42800, type: "tool", name: "update_caller", args: { insurance: "yes" } },
    { at: 43000, type: "tool", name: "get_open_slots", args: {} },
    { at: 43400, type: "say", role: "agent", text: "Good. I can get Mike out tomorrow at 8 AM, or 1 PM. Which works?" },
    { at: 47600, type: "say", role: "caller", text: "Eight is great. The earlier the better." },
    { at: 50400, type: "tool", name: "book_inspection", args: { slot_id: "first" } },
    { at: 50800, type: "say", role: "agent", text: "You're booked for 8 tomorrow. Is this the best number to reach you?" },
    { at: 55000, type: "say", role: "caller", text: "Yes, this number." },
    { at: 56800, type: "tool", name: "update_caller", args: { callback: "this number" } },
    { at: 57000, type: "tool", name: "notify_owner", args: { summary: "Dana, 4512 W Bay St — storm ceiling stain, insurance, booked tomorrow 8 AM" } },
    { at: 57400, type: "say", role: "agent", text: "I've just texted Mike your details, he'll confirm first thing. Anything else tonight?" },
    { at: 62400, type: "say", role: "caller", text: "No, that's it. Thank you so much." },
    { at: 65200, type: "say", role: "agent", text: "You're welcome, Dana. Hang in there — we'll see you in the morning." },
    { at: 69600, type: "tool", name: "end_call", args: {} },
  ],
  water: [
    { at: 600, type: "say", role: "agent", text: "Gulf Coast Restoration, this is Nina. I'm here to help — what's happening at your place?" },
    { at: 5400, type: "say", role: "caller", text: "A pipe under my kitchen sink just burst. There's water all over the floor, it's still coming out!" },
    { at: 11200, type: "tool", name: "update_caller", args: { issue: "Burst pipe under kitchen sink", detail: "Kitchen sink supply line, still flowing" } },
    { at: 11400, type: "tool", name: "set_urgency", args: { level: "emergency", reason: "Water still flowing into living area" } },
    { at: 11600, type: "say", role: "agent", text: "Okay, let's stop the water first. Do you know where your main shut-off valve is?" },
    { at: 16400, type: "say", role: "caller", text: "I think it's in the garage? Hold on… okay, I turned it. It stopped." },
    { at: 21800, type: "say", role: "agent", text: "Perfect, that's the most important part. Stay away from any outlets near the water. What's your first name?" },
    { at: 27200, type: "say", role: "caller", text: "Marcus." },
    { at: 28400, type: "tool", name: "update_caller", args: { name: "Marcus", detail: "Kitchen sink supply line, shut off at main" } },
    { at: 28600, type: "say", role: "agent", text: "Thanks, Marcus. What's the address?" },
    { at: 31200, type: "say", role: "caller", text: "2208 North Rome Avenue, in Tampa." },
    { at: 34200, type: "tool", name: "update_caller", args: { address: "2208 N Rome Ave, Tampa" } },
    { at: 34400, type: "say", role: "agent", text: "Got it. Will you be going through your homeowner's insurance?" },
    { at: 38000, type: "say", role: "caller", text: "I… don't know yet. Honestly I haven't thought about it." },
    { at: 41600, type: "tool", name: "update_caller", args: { insurance: "unsure" } },
    { at: 41800, type: "tool", name: "get_open_slots", args: {} },
    { at: 42200, type: "say", role: "agent", text: "That's fine, Luis can walk you through it. Our on-call tech can be there within the hour to start drying. Want me to send him?" },
    { at: 49400, type: "say", role: "caller", text: "Yes, please. Tonight would be amazing." },
    { at: 52200, type: "tool", name: "book_inspection", args: { slot_id: "tonight" } },
    { at: 52600, type: "say", role: "agent", text: "Done. Is this the best number for the tech to call when he's on his way?" },
    { at: 56800, type: "say", role: "caller", text: "Yeah, this one." },
    { at: 58400, type: "tool", name: "update_caller", args: { callback: "this number" } },
    { at: 58600, type: "tool", name: "notify_owner", args: { summary: "EMERGENCY: Marcus, 2208 N Rome Ave — burst kitchen pipe, water off, tech dispatched tonight" } },
    { at: 59000, type: "say", role: "agent", text: "He's on his way, and I've texted Luis too. Keep the water off until the tech arrives." },
    { at: 64600, type: "say", role: "caller", text: "Okay. Thank you, really." },
    { at: 67000, type: "say", role: "agent", text: "Of course, Marcus. Help is on the way." },
    { at: 70200, type: "tool", name: "end_call", args: {} },
  ],
};
