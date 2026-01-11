
import { Component, signal, inject, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../services/gemini.service';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
      <!-- Header -->
      <div class="bg-rose-50 p-4 border-b border-rose-100 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-600 font-bold">
          AI
        </div>
        <div>
          <h3 class="font-bold text-slate-800">CakeBiz মেন্টর</h3>
          <p class="text-xs text-slate-500">যেকোনো প্রশ্ন করুন (রেসিপি, মার্কেটিং, প্যাকেজিং)</p>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" #scrollContainer>
        @if (messages().length === 0) {
           <div class="text-center text-slate-400 mt-10">
              <p>আপনার মেন্টর তৈরি। হাই বলুন!</p>
              <div class="mt-4 grid grid-cols-1 gap-2 max-w-xs mx-auto">
                <button (click)="sendMessage('ভ্যানিলা কেকের পারফেক্ট রেসিপি দাও')" class="text-sm bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-600 py-2 px-3 rounded-lg transition-colors">🍰 ভ্যানিলা কেকের রেসিপি</button>
                <button (click)="sendMessage('কেকের বিজনেস শুরু করতে কি কি লাগবে?')" class="text-sm bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-600 py-2 px-3 rounded-lg transition-colors">📦 কি কি সরঞ্জাম লাগবে?</button>
                <button (click)="sendMessage('ফেসবুকে কিভাবে মার্কেটিং করব?')" class="text-sm bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-600 py-2 px-3 rounded-lg transition-colors">📣 মার্কেটিং টিপস</button>
              </div>
           </div>
        }

        @for (msg of messages(); track $index) {
          <div class="flex" [class.justify-end]="msg.role === 'user'">
            <div 
              class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap"
              [class.bg-rose-500]="msg.role === 'user'"
              [class.text-white]="msg.role === 'user'"
              [class.bg-slate-100]="msg.role === 'model'"
              [class.text-slate-800]="msg.role === 'model'"
              [class.rounded-br-none]="msg.role === 'user'"
              [class.rounded-bl-none]="msg.role === 'model'"
            >
              {{ msg.text }}
            </div>
          </div>
        }

        @if (isLoading()) {
          <div class="flex justify-start">
            <div class="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-rose-100">
        <div class="flex gap-2">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keyup.enter)="onSend()"
            placeholder="আপনার প্রশ্ন লিখুন..."
            class="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-full px-4 py-3 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            [disabled]="isLoading()"
          >
          <button 
            (click)="onSend()"
            [disabled]="!userInput() || isLoading()"
            class="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent {
  private geminiService = inject(GeminiService);
  
  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isLoading = signal(false);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    effect(() => {
      // Auto-scroll when messages change
      const msgs = this.messages(); // Dependency
      setTimeout(() => {
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      }, 50);
    });
  }

  async onSend() {
    const text = this.userInput().trim();
    if (!text || this.isLoading()) return;

    this.sendMessage(text);
  }

  async sendMessage(text: string) {
    this.userInput.set('');
    this.messages.update(msgs => [...msgs, { role: 'user', text }]);
    this.isLoading.set(true);

    try {
      // Prepare history for API
      const history = this.messages()
        .filter(m => m.role !== 'model' || m.text !== '...') // simplistic filter
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      // Call API
      const response = await this.geminiService.chatWithMentor(history, text);
      
      this.messages.update(msgs => [...msgs, { role: 'model', text: response }]);
    } catch (err) {
      this.messages.update(msgs => [...msgs, { role: 'model', text: 'দুঃখিত, একটি ত্রুটি হয়েছে।' }]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
