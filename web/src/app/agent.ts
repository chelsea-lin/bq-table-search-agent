import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgentResponse } from './data_models/agent_response';


const AGENT_NAME = "nl2sql"
const SESSION_ID = "my_session"
const USER_ID = "u_123"
const HTTP_OPTIONS = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

@Injectable({
  providedIn: 'root'
})
export class Agent {

  private httpClient = inject(HttpClient)

  private sessionStarted = false

  startSession(): void {
    if (this.sessionStarted) {
      console.log("Session already started.")
      return;
    }
    const url = `/api/apps/${AGENT_NAME}/users/${USER_ID}/sessions/${SESSION_ID}`

    const body = {"state": {"key1": "value1", "key2": 42}}
    
    this.httpClient.post(url, body, HTTP_OPTIONS).subscribe({
      next: value => { this.sessionStarted = true; },
      error: error => {console.error("Error", error); }
    });
  }

  query(prompt: string): Observable<AgentResponse> {
    const url = "/api/run"

    const body = {
      "appName": AGENT_NAME,
      "userId": USER_ID,
      "sessionId": SESSION_ID,
      "newMessage": {
        "role": "user",
        "parts": [{
          "text": prompt
        }]
      }
    }

    return this.httpClient.post<AgentResponse>(url, body, HTTP_OPTIONS)
  }
}
