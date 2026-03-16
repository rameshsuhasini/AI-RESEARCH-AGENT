import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResearchAgentService, AgentStep } from './services/research-agent';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent implements AfterViewChecked {
  topic = '';
  steps: AgentStep[] = [];
  report: AgentStep['report'] | null = null;
  isRunning = false;
  isDone = false;
  private shouldScroll = false;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(
    private agentService: ResearchAgentService,
    private cdr: ChangeDetectorRef,
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
    this.report = null;
    this.isDone = false;
    this.topic = '';
  }

  // Only keep activity steps — filter out report and done
  get activitySteps(): AgentStep[] {
    return this.steps.filter((s) => s.type !== 'report' && s.type !== 'done');
  }

  startResearch() {
    if (!this.topic || this.isRunning) return;
    this.steps = [];
    this.report = null;
    this.isDone = false;
    this.isRunning = true;

    this.agentService.research(this.topic).subscribe({
      next: (step) => {
        this.steps = [...this.steps, step];
        this.shouldScroll = true;

        // Extract report when it arrives
        if (step.type === 'report' && step.report) {
          this.report = { ...step.report };
          console.log('Report received:', this.report);
        }

        if (step.type === 'done') {
          this.isDone = true;
          this.isRunning = false;
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isRunning = false;
        this.cdr.detectChanges();
      },
    });
  }
}
