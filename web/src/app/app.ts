import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentResponse } from './data_models/agent_response';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';

import { Agent } from './agent'
import { SemanticSchema } from './data_models/semantic_schema';
import { SchemaViewer } from './schema_viewer/schema_viewer';
import { RelationshipGraph } from './relationship_graph/relationship_graph';
import { provideSemanticSchema } from './data_models/dummy_data';

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
    MatToolbarModule,
    MatTabsModule,
    SchemaViewer,
    RelationshipGraph,
  ],
  styleUrl: './app.css'
})
export class App {
  protected title = 'web';

  private agent = inject(Agent);

  userPrompt: string = ""
  response: string = "";
  loading: boolean = false;

  private _semanticSchema: SemanticSchema | null = null;
  
  get semanticSchema(): SemanticSchema | null {
    return this._semanticSchema;
  }

  set semanticSchema(value: SemanticSchema) {
    this._semanticSchema = value;
  }

  ngOnInit() {
    this.agent.startSession();
  }

  sendPrompt() {
    this.loading = true;
    this.response = '';
    console.log('Fetching response for:', this.userPrompt);

    const prompt = `
    Answer the user's question based on the semantic schema. 
    User instruction: ${this.userPrompt}. 
    Semantic schema: ${JSON.stringify(this.semanticSchema)}
    `

    this.agent.query(prompt).subscribe({
      next: resp => this.handleResponse(resp),
      error: error => this.handleError(error),
    });
  }

  private handleResponse(response: AgentResponse) {
    console.log("Get response", response);
    const textResponse = this.getTextResponse(response);
    this.response = textResponse;
    this.loading = false;
  }

  private handleError(error: any) {
    console.error("Error", error);
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
