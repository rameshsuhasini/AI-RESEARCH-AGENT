import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AgentStep {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'done';
  content?: string;
  toolName?: string;
  input?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class ResearchAgentService {
  private apiUrl = 'http://localhost:3000/api/research';

  research(topic: string): Observable<AgentStep> {
    return new Observable(observer => {
      const eventSource = new EventSource(
        `${this.apiUrl}?topic=${encodeURIComponent(topic)}`
      );

      eventSource.onmessage = (event) => {
        const step: AgentStep = JSON.parse(event.data);
        observer.next(step);

        if (step.type === 'done') {
          eventSource.close();
          observer.complete();
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        observer.error('Connection failed');
      };

      // Cleanup when unsubscribed
      return () => eventSource.close();
    });
  }
}