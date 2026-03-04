
import { GoogleGenAI, Type } from "@google/genai";
import { LocationType, PointOfInterest, Quest, Scenario } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getTacticalAdvice(scenario: Scenario, findings: string[], userQuery?: string): Promise<string> {
  try {
    const contents = userQuery 
      ? `AGENT QUERY: "${userQuery}". CONTEXT: Investigation of "${scenario.title}". FIELD DATA: [${findings.join(", ")}]. Provide a condensed, brief tactical response (max 2 sentences) in the persona of a Bio-Economic Spy HQ. Deliver main points only.`
      : `FIELD DATA: [${findings.join(", ")}]. CONTEXT: "${scenario.title}". Provide a single brief sentence of tactical operative advice.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Tactical link weak. Proceed with intuition.";
  } catch (e) {
    return "Tactical link unstable. Rely on primary operative training.";
  }
}

export async function gradeMultipleFreeResponses(items: { question: string, answer: string }[]): Promise<{ score: number, feedback: string }[]> {
  if (items.length === 0) return [];
  try {
    const prompt = items.map((it, i) => `Q${i+1}: ${it.question}\nA${i+1}: ${it.answer}`).join("\n\n");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate these field reports. Be lenient and encouraging: if the answer shows a basic understanding of the concept, give a high score (0.8-1.0). Only penalize for completely incorrect or irrelevant info. Return JSON array of objects {score (0-1), feedback (max 10 words)}. Persona: Spy HQ.\n\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            },
            required: ["score", "feedback"]
          }
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    return items.map(() => ({ score: 0.5, feedback: "Neural link timeout." }));
  }
}

export async function gradeFreeResponse(question: string, answer: string): Promise<{ score: number, feedback: string, positives: string, negatives: string }> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate operative field report. Topic: "${question}". Report: "${answer}". Return JSON {score, feedback, positives, negatives}. Use Spy persona. Keep feedback brief and condensed.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            positives: { type: Type.STRING },
            negatives: { type: Type.STRING }
          },
          required: ["score", "feedback"]
        }
      }
    });
    const data = JSON.parse(response.text.trim());
    return {
      score: data.score ?? 0.5,
      feedback: data.feedback ?? "Analysis synchronized.",
      positives: data.positives ?? "Protocol followed.",
      negatives: data.negatives ?? "No breaches found."
    };
  } catch (e) {
    return { score: 0.5, feedback: "Neural link offline.", positives: "Data captured.", negatives: "Logic buffer error." };
  }
}

export async function generateQuest(location: LocationType, poi: PointOfInterest, day: number): Promise<Quest> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 3-stage Interactive Educational Bio-Economic Spy Quest for ${poi.name} in ${location}.
      
      MISSION PARAMETERS:
      - Codename: Use high-stakes espionage terminology (e.g., OPERATION NIGHTFALL, PROTOCOL VORTEX).
      - Narrative: The operative is infiltrating a healthcare grid to expose inefficiencies or bio-hazards.
      
      COMPLEXITY RULES:
      1. Every mission MUST have at least 3 distinct Scenarios (Phases).
      2. Every stage MUST have exactly 5 "Intel Drops" (Investigation Nodes).
      3. Use technical health acronyms for puzzle codes: BMI, WBC, ICU, ECG, MRI, OPD, ENT, CBC, BP, DNA.
      4. Decision dilemma: Trade-off between immediate health (High Cost) vs Long-term Buffer (Infrastructure/Generics).
      5. Ensure clues are moderately challenging. The "puzzleClue" should be a cryptic riddle or a technical definition that requires a bit of thought (e.g., "A measure of mass over height squared" for BMI).
      6. Reserve Costs for options MUST be in the range of 600 to 2500.
      7. OBSTACLES: Every stage MUST have 4-6 obstacles. 
         - Use visually friendly and inclusive obstacle names (e.g., "Inaccessible Ramp", "Crowded Waiting Area", "Narrow Corridor", "Slippery Sanitized Floor").
         - Obstacle Types: "block" (physical barrier), "hazard" (damaging zone), "slow" (movement penalty), or "multi" (both damaging and movement penalty).
      8. EXTENSIVE DECISION MAKING: Every scenario must force a choice with deep logical economic and health consequences. The "feedback" for each option should be a detailed 2-sentence tactical report explaining the outcome.
      9. ACCURATE METRICS: Ensure all costs, health effects, and resilience impacts are logically consistent with the narrative and the chosen protocol.
      10. HARD DECISIONS:
         - Protocol ALPHA (Stealth/Efficiency): Low Cost (600-800), Health Loss (-5% to -10%), High Resilience (+15), Stealth Gain (+10). Logic: Minimal resources used, but operative health is sacrificed for long-term system stability.
         - Protocol DELTA (Direct Action): Moderate Cost (1000-1500), Health Gain (+10%), Moderate Resilience (+5), Stealth Loss (-5). Logic: Balanced approach using standard medical supplies.
         - Protocol OMEGA (Emergency Override): High Cost (2000+), High Health Gain (+25%), Negative Resilience (-10), Stealth Loss (-20). Logic: Expensive emergency measures that stabilize the operative but drain the sector's long-term reserves and blow cover.
      
      JSON FORMAT:
      {
        "missionCodename": "string",
        "title": "string",
        "reflection": "string",
        "scenarios": [
          {
            "id": "string",
            "title": "Phase [Number]: [Title]",
            "description": "Spy-flavored narrative setting the dilemma",
            "missionRisk": "Low" | "Moderate" | "High" | "Critical",
            "healthFact": "Informative healthcare takeaway",
            "synthesisAnalysis": "Tactical breakdown of gathered intel",
            "investigationPoints": [
              {
                "id": "string",
                "subLocation": "Intel Drop Site",
                "description": "What is being audited",
                "clueResult": "The specific healthcare insight found",
                "requiredTool": "bio-scan" | "sig-int" | "hum-int",
                "puzzleCode": "3-char Acronym",
                "puzzleClue": "Very simple hint",
                "icon": "virus" | "water" | "doctor" | "trash" | "pills" | "microscope" | "heart" | "house" | "dna",
                "x": number,
                "y": number
              }
            ],
            "obstacles": [
              {
                "id": "string",
                "type": "block" | "hazard" | "slow",
                "name": "string",
                "icon": "string",
                "x": number,
                "y": number,
                "radius": number
              }
            ],
            "options": [
              { 
                "label": "Protocol ALPHA", 
                "cost": number, 
                "healthEffect": number, 
                "resilienceImpact": number,
                "stealthImpact": number,
                "timeCost": number, 
                "feedback": "Consequence of stealth approach" 
              },
              { "label": "Protocol DELTA", "cost": number, "healthEffect": number, "resilienceImpact": number, "stealthImpact": number, "timeCost": number, "feedback": "string" },
              { "label": "Protocol OMEGA", "cost": number, "healthEffect": number, "resilienceImpact": number, "stealthImpact": number, "timeCost": number, "feedback": "string" }
            ]
          }
        ]
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text);
    const scenarios: Scenario[] = (data.scenarios || []).map((s: any) => ({
      id: s.id || String(Math.random()),
      title: s.title || "Stage",
      description: s.description || "Mission setting...",
      missionRisk: s.missionRisk || "Moderate",
      healthFact: s.healthFact || "Stay healthy.",
      synthesisAnalysis: s.synthesisAnalysis || "",
      investigationPoints: (s.investigationPoints || []).slice(0, 5).map((p: any) => ({
        id: p.id || String(Math.random()),
        subLocation: p.subLocation || "Site",
        description: p.description || "Audit...",
        clueResult: p.clueResult || "Insight...",
        requiredTool: p.requiredTool || "bio-scan",
        puzzleCode: String(p.puzzleCode || "DNA").toUpperCase(),
        puzzleClue: p.puzzleClue || "Hint...",
        icon: p.icon || "pills",
        x: p.x || 50,
        y: p.y || 50
      })),
      obstacles: (s.obstacles || []).map((o: any) => ({
        id: o.id || String(Math.random()),
        type: o.type || "hazard",
        name: o.name || "Obstacle",
        icon: o.icon || "⚠️",
        x: o.x || 50,
        y: o.y || 50,
        radius: o.radius || 5
      })),
      options: (s.options || []).map((o: any) => ({
        label: o.label || "Option",
        cost: o.cost || 0,
        healthEffect: o.healthEffect || 0,
        resilienceImpact: o.resilienceImpact || 0,
        stealthImpact: o.stealthImpact || 0,
        timeCost: o.timeCost || 0,
        feedback: o.feedback || "Result..."
      }))
    })).slice(0, 3);

    return {
      poiId: poi.id,
      missionCodename: data.missionCodename || "OPERATION AYUSH",
      title: data.title || "Health Objective",
      scenarios: scenarios,
      reflection: data.reflection || "Sector synchronized.",
      currentStep: 0
    };
  } catch (e) {
    return {
      poiId: poi.id,
      missionCodename: "FALLBACK-OS",
      title: "Bio-Security Routine",
      reflection: "Standard field analysis protocol initiated.",
      currentStep: 0,
      scenarios: []
    };
  }
}
