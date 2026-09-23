import { Type, type FunctionDeclaration } from "@google/genai";

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "update_caller",
    description:
      "Save any caller details learned so far. Call it every time you learn something new. Only include fields you actually know.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Caller's first name" },
        address: { type: Type.STRING, description: "Street and city" },
        issue: { type: Type.STRING, description: "Short description of the problem, max 12 words" },
        detail: {
          type: Type.STRING,
          description: "Trade detail: roof age / active leak for roofing, water source / still flowing for water damage",
        },
        insurance: {
          type: Type.STRING,
          enum: ["yes", "no", "unsure"],
          description: "Whether they plan to use insurance",
        },
        callback: { type: Type.STRING, description: "Callback number, or 'this number'" },
      },
    },
  },
  {
    name: "set_urgency",
    description: "Classify how urgent the job is.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING, enum: ["emergency", "urgent", "routine"] },
        reason: { type: Type.STRING, description: "Why, in under 10 words" },
      },
      required: ["level", "reason"],
    },
  },
  {
    name: "get_open_slots",
    description: "Get the next open inspection slots from the company calendar.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "book_inspection",
    description: "Book one of the slots returned by get_open_slots.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        slot_id: { type: Type.STRING, description: "The id of the chosen slot" },
      },
      required: ["slot_id"],
    },
  },
  {
    name: "notify_owner",
    description: "Text the owner a one-line summary of the new job.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "One line, under 20 words" },
      },
      required: ["summary"],
    },
  },
  {
    name: "end_call",
    description: "End the call after saying goodbye.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
];
