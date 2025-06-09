import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SemanticSchema } from '../data_models/semantic_schema';

interface Point {
  x: number;
  y: number;
}

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Relationship {
  source: Node;
  target: Node;
  label: string;
}

@Component({
  selector: 'app-relationship-graph',
  standalone: true,
  imports: [CommonModule],
  template: '<svg #svg [attr.width]="width" [attr.height]="height"></svg>',
  styles: ['svg { width: 100%; height: 100%; }']
})
export class RelationshipGraph implements OnInit, OnChanges {
  @Input() schema: SemanticSchema | null = null;
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGElement>;

  width = 800;
  height = 600;
  nodes: Node[] = [];
  relationships: Relationship[] = [];
  private nodeRadius = 50;
  private nodeSpacing = 200;

  ngOnInit() {
    this.setupSvg();
    this.updateGraph();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Graph received schema change:', this.schema);
    if (changes['schema']) {
      this.updateGraph();
    }
  }

  private setupSvg() {
    const svg = this.svgRef.nativeElement;
    svg.setAttribute('width', this.width.toString());
    svg.setAttribute('height', this.height.toString());
    svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
  }

  private updateGraph() {
    console.log('Updating graph with schema:', this.schema);
    if (!this.schema) {
      // Clear the graph when schema is null
      this.nodes = [];
      this.relationships = [];
      const svg = this.svgRef.nativeElement;
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      return;
    }

    // Create nodes for each table
    this.nodes = this.schema.tables.map((table, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      return {
        id: table.name,
        x: (col + 1) * this.nodeSpacing,
        y: (row + 1) * this.nodeSpacing,
        label: table.name
      };
    });

    // Create relationships
    this.relationships = this.schema.relationships.map(rel => ({
      source: this.nodes.find(n => n.id === rel.from_table)!,
      target: this.nodes.find(n => n.id === rel.to_table)!,
      label: `${rel.from_column} → ${rel.to_column}`
    }));

    this.drawGraph();
  }

  private drawGraph() {
    const svg = this.svgRef.nativeElement;
    
    // Clear existing content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Draw relationships
    this.relationships.forEach(rel => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', rel.source.x.toString());
      line.setAttribute('y1', rel.source.y.toString());
      line.setAttribute('x2', rel.target.x.toString());
      line.setAttribute('y2', rel.target.y.toString());
      line.setAttribute('stroke', '#999');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);

      // Add relationship label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const midX = (rel.source.x + rel.target.x) / 2;
      const midY = (rel.source.y + rel.target.y) / 2;
      text.setAttribute('x', midX.toString());
      text.setAttribute('y', midY.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#666');
      text.textContent = rel.label;
      svg.appendChild(text);
    });

    // Draw nodes
    this.nodes.forEach(node => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x.toString());
      circle.setAttribute('cy', node.y.toString());
      circle.setAttribute('r', this.nodeRadius.toString());
      circle.setAttribute('fill', '#fff');
      circle.setAttribute('stroke', '#333');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x.toString());
      text.setAttribute('y', node.y.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = node.label;
      svg.appendChild(text);
    });
  }
} 