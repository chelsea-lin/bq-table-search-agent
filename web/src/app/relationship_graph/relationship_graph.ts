import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SemanticSchema } from '../data_models/semantic_schema';

interface Point {
  x: number;
  y: number;
}

interface Node extends Point {
  name: string;
}

interface Relationship {
  from: Point;
  to: Point;
  fromTable: string;
  toTable: string;
  fromColumn: string;
  toColumn: string;
}

@Component({
  selector: 'app-relationship-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relationship_graph.html',
  styleUrls: ['./relationship_graph.css'],
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
    if (changes['schema']) {
      this.updateGraph();
    }
  }

  private setupSvg() {
    const svg = this.svgRef.nativeElement;
    const container = svg.parentElement!;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect) {
          this.width = entry.contentRect.width;
          this.height = entry.contentRect.height;
          this.updateGraph();
        }
      }
    });
    resizeObserver.observe(container);

    // Initial size
    const rect = container.getBoundingClientRect();
    this.width = rect.width || this.width;
    this.height = rect.height || this.height;
  }

  private updateGraph() {
    if (!this.schema) return;

    const tables = this.schema.tables;
    const radius = Math.min(this.width, this.height) * 0.4; // Increase to 40% of the smaller dimension

    // Update nodes
    this.nodes = tables.map((table, index) => {
      const angle = (index * 2 * Math.PI) / tables.length;
      return {
        name: table.name,
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };
    });

    // Update relationships
    this.relationships = this.schema.relationships
      .map(rel => {
        const fromNode = this.nodes.find(n => n.name === rel.from_table);
        const toNode = this.nodes.find(n => n.name === rel.to_table);

        if (fromNode && toNode) {
          return {
            from: { x: fromNode.x, y: fromNode.y },
            to: { x: toNode.x, y: toNode.y },
            fromTable: rel.from_table,
            toTable: rel.to_table,
            fromColumn: rel.from_column,
            toColumn: rel.to_column
          };
        }
        return null;
      })
      .filter((rel): rel is Relationship => rel !== null);
  }
} 