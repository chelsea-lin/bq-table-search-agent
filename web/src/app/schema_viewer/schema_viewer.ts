import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SemanticSchema, Table, Relationship, Dimension, Metric, ExampleSql, createSemanticSchema } from '../data_models/semantic_schema';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-schema-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatListModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './schema_viewer.html',
  styleUrl: './schema_viewer.css'
})
export class SchemaViewer {
  @Input() schema: SemanticSchema | null = null;
  @Output() schemaChange = new EventEmitter<SemanticSchema>();
  
  // Column definitions for each table
  tableColumns: string[] = ['name', 'primary_key', 'actions'];
  relationshipColumns: string[] = ['from_table', 'from_column', 'to_table', 'to_column', 'actions'];
  dimensionColumns: string[] = ['name', 'column', 'actions'];
  metricColumns: string[] = ['name', 'sql', 'actions'];
  exampleSqlColumns: string[] = ['name', 'sql', 'actions'];

  // Track expansion state
  expandedPanels = new Set<string>(['tables']); // Default to having tables expanded

  onTableDataChange() {
    if (this.schema) {
      // Create a new schema object to ensure change detection
      this.schemaChange.emit({...this.schema});
    }
  }

  deleteRow(type: 'tables' | 'relationships' | 'dimensions' | 'metrics' | 'exampleSqls', index: number) {
    if (this.schema) {
      // Create a new array to ensure change detection
      const newArray = [...this.schema[type]];
      newArray.splice(index, 1);
      
      // Create a new schema object with the updated array
      this.schema = {
        ...this.schema,
        [type]: newArray
      };
      
      this.onTableDataChange();
    }
  }

  addRow(type: 'tables' | 'relationships' | 'dimensions' | 'metrics' | 'exampleSqls') {
    if (this.schema) {
      const newRow = this.createEmptyRow(type);
      // Create a new array to ensure change detection
      this.schema = {
        ...this.schema,
        [type]: [...this.schema[type], newRow]
      };
      this.onTableDataChange();
    }
  }

  private createEmptyRow(type: 'tables' | 'relationships' | 'dimensions' | 'metrics' | 'exampleSqls'): any {
    switch (type) {
      case 'tables':
        return { name: '', primary_key: '' };
      case 'relationships':
        return { from_table: '', from_column: '', to_table: '', to_column: '' };
      case 'dimensions':
        return { name: '', column: '' };
      case 'metrics':
        return { name: '', sql: '' };
      case 'exampleSqls':
        return { name: '', sql: '' };
    }
  }

  togglePanel(panel: string) {
    if (this.expandedPanels.has(panel)) {
      this.expandedPanels.delete(panel);
    } else {
      this.expandedPanels.add(panel);
    }
  }

  isPanelExpanded(panel: string): boolean {
    return this.expandedPanels.has(panel);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          if (jsonString) {
            const newSchema = createSemanticSchema(jsonString);
            this.schema = newSchema;
            this.schemaChange.emit(newSchema);
          }
        } catch (error) {
          console.error('Error parsing schema file:', error);
          // You might want to show an error message to the user here
        }
      };
      
      reader.readAsText(file);
    }
  }
} 