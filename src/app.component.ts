
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoadmapComponent } from './components/roadmap.component';
import { ChatComponent } from './components/chat.component';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RoadmapComponent, ChatComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  activeTab = signal<'roadmap' | 'chat'>('roadmap');
  
  // Roadmap State
  roadmapData = signal<any[]>([]);
  isRoadmapLoading = signal(false);
  
  private geminiService = inject(GeminiService);

  setTab(tab: 'roadmap' | 'chat') {
    this.activeTab.set(tab);
  }

  async generatePlan() {
    if (this.roadmapData().length > 0) return; // Don't regenerate if exists

    this.isRoadmapLoading.set(true);
    try {
      const plan = await this.geminiService.generateBusinessPlan();
      this.roadmapData.set(plan);
    } catch (err) {
      console.error('Plan gen failed', err);
      // Fallback dummy data if API fails to avoid empty screen in demo
      this.roadmapData.set([
         { week: 'সপ্তাহ ১', focus: 'পরিকল্পনা ও প্রস্তুতি', tasks: ['মার্কেট রিসার্চ করুন', 'ব্র্যান্ড নাম ঠিক করুন', 'বাজেট তৈরি করুন'] },
         { week: 'সপ্তাহ ২', focus: 'সরঞ্জাম ও উপকরণ', tasks: ['ওভেন ও মিক্সার কিনুন', 'প্যাকেজিং ডিজাইন', 'টেস্টিং বেকিং'] }
      ]);
    } finally {
      this.isRoadmapLoading.set(false);
    }
  }
}
