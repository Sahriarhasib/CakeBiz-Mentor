
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-20">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
        <h2 class="text-2xl font-bold text-rose-600 mb-2">১ মাসের অ্যাকশন প্ল্যান</h2>
        <p class="text-slate-600">আপনার কেক বিজনেসের জন্য ধাপে ধাপে গাইডলাইন।</p>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
          <p class="text-rose-600 font-medium">প্ল্যান তৈরি হচ্ছে, একটু অপেক্ষা করুন...</p>
        </div>
      }

      @if (!loading() && plan().length === 0) {
        <div class="text-center py-12">
          <div class="mb-6 flex justify-center">
             <img src="https://picsum.photos/id/431/200/200" alt="Cake" class="rounded-full shadow-lg border-4 border-white w-32 h-32 object-cover">
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-4">আপনার কেক বিজনেস শুরু করতে প্রস্তুত?</h3>
          <button 
            (click)="onGenerate.emit()"
            class="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95">
            আমার প্ল্যান তৈরি করুন 🚀
          </button>
        </div>
      }

      @for (week of plan(); track $index) {
        <div class="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden hover:shadow-md transition-shadow">
          <div class="bg-gradient-to-r from-rose-50 to-white p-4 border-b border-rose-100 flex justify-between items-center">
            <h3 class="font-bold text-lg text-rose-800">{{ week.week }}: {{ week.focus }}</h3>
          </div>
          <div class="p-5">
            <ul class="space-y-4">
              @for (task of week.tasks; track $index) {
                <li class="flex items-start gap-3 group">
                  <div class="mt-1 min-w-[20px]">
                     <div class="w-5 h-5 rounded border-2 border-rose-300 group-hover:border-rose-500 flex items-center justify-center cursor-pointer transition-colors">
                        <div class="w-3 h-3 bg-rose-500 rounded-sm opacity-20 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                  </div>
                  <span class="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">{{ task }}</span>
                </li>
              }
            </ul>
          </div>
        </div>
      }
    </div>
  `
})
export class RoadmapComponent {
  plan = input.required<any[]>();
  loading = input.required<boolean>();
  onGenerate = output<void>();
}
