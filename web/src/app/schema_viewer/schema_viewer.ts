import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SemanticSchema, Table, Relationship, Dimension, Metric } from '../data_models/semantic_schema';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './schema_viewer.html',
  styleUrl: './schema_viewer.css'
})
export class SchemaViewer {
  @Input() schema!: SemanticSchema;
  @Output() schemaChange = new EventEmitter<SemanticSchema>();
  
  // Column definitions for each table
  tableColumns: string[] = ['name', 'primary_key', 'actions'];
  relationshipColumns: string[] = ['from_table', 'from_column', 'to_table', 'to_column', 'actions'];
  dimensionColumns: string[] = ['name', 'column', 'actions'];
  metricColumns: string[] = ['name', 'sql', 'actions'];

  onTableDataChange() {
    // Emit the updated schema
    this.schemaChange.emit({ ...this.schema });
  }

  deleteRow(type: 'tables' | 'relationships' | 'dimensions' | 'metrics', index: number) {
    this.schema[type].splice(index, 1);
    this.onTableDataChange();
  }

  addRow(type: 'tables' | 'relationships' | 'dimensions' | 'metrics') {
    const newRow = this.createEmptyRow(type);
    this.schema[type].push(newRow);
    this.onTableDataChange();
  }

  private createEmptyRow(type: 'tables' | 'relationships' | 'dimensions' | 'metrics'): any {
    switch (type) {
      case 'tables':
        return { name: '', primary_key: '' };
      case 'relationships':
        return { from_table: '', from_column: '', to_table: '', to_column: '' };
      case 'dimensions':
        return { name: '', column: '' };
      case 'metrics':
        return { name: '', sql: '' };
    }
  }
} 