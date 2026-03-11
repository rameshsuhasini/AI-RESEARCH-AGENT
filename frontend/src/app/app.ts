import { Component, ChangeDetectorRef } from '@angular/core';
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
export class AppComponent {
  topic = '';
  steps: AgentStep[] = [];
  isRunning = false;
  isDone = false;

  constructor(
    private agentService: ResearchAgentService,
    private cdr: ChangeDetectorRef
  ) {}

  startResearch() {
    this.steps = [];
    this.isDone = false;
    this.isRunning = true;

    this.agentService.research(this.topic).subscribe({
      next: (step) => {
        this.steps = [...this.steps, step];
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