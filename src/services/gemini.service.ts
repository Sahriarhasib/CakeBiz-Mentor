
import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type, SchemaType } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly apiKey = process.env['API_KEY'] || '';
  private readonly client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async generateBusinessPlan(): Promise<any> {
    const prompt = `
      আমি কাল থেকে আগামী ১ মাসের মধ্যে একটি কেক বিজনেস দাঁড় করাতে চাই।
      Create a 4-week structured plan (Week 1 to Week 4).
      For each week, provide a focus title and a list of 3-5 specific actionable tasks.
      The tasks should cover: Recipes, Equipment buying, Branding/Packaging, Marketing, and Delivery setup.
      Output ONLY valid JSON.
      Language: Bengali.
    `;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.STRING, description: "Week number (e.g., সপ্তাহ ১)" },
                focus: { type: Type.STRING, description: "Main focus of the week" },
                tasks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING, description: "Actionable task" }
                }
              },
              required: ["week", "focus", "tasks"]
            }
          }
        }
      });
      
      const text = response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating plan:', error);
      throw error;
    }
  }

  async chatWithMentor(history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> {
    try {
      const chat = this.client.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
          systemInstruction: 'You are a world-class Cake Business Mentor speaking in Bengali. You are encouraging, practical, and expert in baking, marketing, and business strategy. Keep answers concise but helpful. Use formatting like bullet points where needed.'
        }
      });

      const result = await chat.sendMessage({ message });
      return result.text;
    } catch (error) {
      console.error('Chat error:', error);
      return 'দুঃখিত, বর্তমানে সংযোগে সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
    }
  }
}
