import { Component, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResearchAgentService, AgentStep } from './services/research-agent';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements AfterViewChecked {
  topic = '';
  steps: AgentStep[] = [];
  isRunning = false;
  isDone = false;
  private shouldScroll = false;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(
    private agentService: ResearchAgentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom() {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  setTopic(t: string) {
    this.topic = t;
  }

  reset() {
    this.steps = [];
    this.isDone = false;
    this.topic = '';
  }

  formatContent(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c0c0e0">$1</strong>')
    // Headers
    .replace(/###\s*(.*?)(\n|$)/g, 
      '<div style="color:#7c6af7;font-weight:700;font-size:12px;margin:8px 0 4px">$1</div>')
    // Numbered lists  
    .replace(/^\d+\.\s/gm, 
      '<br><span style="color:#4facfe;font-weight:600">→ </span>')
    // Bullet points
    .replace(/^[-–]\s/gm, 
      '<br><span style="color:#4facfe">• </span>')
    // Line breaks
    .replace(/\n/g, '<br>');
}

  startResearch() {
    if (!this.topic || this.isRunning) return;
    this.steps = [];
    this.isDone = false;
    this.isRunning = true;

    this.agentService.research(this.topic).subscribe({
      next: (step) => {
        this.steps = [...this.steps, step];
        this.shouldScroll = true;
        if (step.type === 'done') {
          this.isDone = true;
          this.isRunning = false;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isRunning = false;
        this.cdr.detectChanges();
      }
    });
  }
}