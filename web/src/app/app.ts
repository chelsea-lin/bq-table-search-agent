import { Component, inject } from '@angular/core';
import { Agent } from './agent'
import { CommonModule } from '@angular/common';
import { AgentResponse } from './agent_response.model';
import { FormsModule } from '@angular/forms';

// Import all the required Angular Material modules
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
  ],
  styleUrl: './app.css'
})
export class App {
  protected title = 'web';

  private agent = inject(Agent);

  userPrompt: string = ""
  response: string = "";
  loading: boolean = false;

  ngOnInit() {
    this.agent.startSession();
  }

  onClick() {
    this.loading = true;
    this.response = '';
    console.log('Fetching response for:', this.userPrompt);

    this.agent.query(this.userPrompt).subscribe({
      next: resp => this.handleResponse(resp)
    });
  }

  private handleResponse(response: AgentResponse) {
    console.log("Get response", response);
    const textResponse = this.getTextResponse(response);
    this.response = textResponse;
    this.loading = false;
  }

  private getTextResponse(response: AgentResponse): string {
    for (let chunk of response) {
      if (chunk.content) {
        return chunk.content.parts[0].text;
      }
    } 
    return "";
  }
}
