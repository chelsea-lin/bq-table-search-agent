export interface TextResponse {
  text: string;
}

export interface Content {
  parts: TextResponse[];
}

export interface ResponseChunk {
  content?: Content;
}

export type AgentResponse = ResponseChunk[];