import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SemanticSchema, Table, Relationship, Dimension, Metric } from '../data_models/semantic_schema';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-schema-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatListModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './schema_viewer.html',
  styleUrl: './schema_viewer.css'
})
export class SchemaViewer {
  @Input() schema!: SemanticSchema;
  @Output() schemaChange = new EventEmitter<SemanticSchema>();
  
  // Column definitions for each table
  tableColumns: string[] = ['name', 'primary_key'];
  relationshipColumns: string[] = ['from_table', 'from_column', 'to_table', 'to_column'];
  dimensionColumns: string[] = ['name', 'column'];
  metricColumns: string[] = ['name', 'sql'];

  onTableDataChange() {
    // Emit the updated schema
    this.schemaChange.emit({ ...this.schema });
  }
} 