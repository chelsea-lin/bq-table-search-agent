export interface Table {
  name: string;
  primary_key: string;
}

export interface Relationship {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
}

export interface Dimension {
  name: string;
  column: string;
}

export interface Metric {
  name: string;
  sql: string;
}

export interface ExampleSql {
  question: string;
  sql: string;
}

export interface SemanticSchema {
  tables: Table[];
  relationships: Relationship[];
  dimensions: Dimension[];
  metrics: Metric[];
  exampleSqls: ExampleSql[];
}

export function createSemanticSchema(jsonString: string): SemanticSchema {
  const data = JSON.parse(jsonString);

  if (
    !data ||
    !Array.isArray(data.tables) ||
    !Array.isArray(data.relationships) ||
    !Array.isArray(data.dimensions) ||
    !Array.isArray(data.metrics)
  ) {
    throw new Error('Invalid SemanticSchema JSON string');
  }

  return {
    tables: data.tables.map((t: any) => ({
      name: t.name,
      primary_key: t.primary_key,
    })),
    relationships: data.relationships.map((r: any) => ({
      from_table: r.from_table,
      from_column: r.from_column,
      to_table: r.to_table,
      to_column: r.to_column,
    })),
    dimensions: data.dimensions.map((d: any) => ({
      name: d.name,
      column: d.column,
    })),
    metrics: data.metrics.map((m: any) => ({name: m.name, sql: m.sql})),
    exampleSqls: data.example_sqls.map((e: any) => ({question: e.question, sql: e.sql})),
  };
}

