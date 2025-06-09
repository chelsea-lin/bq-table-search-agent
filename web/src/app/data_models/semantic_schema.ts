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

export interface ExampleSql {
  question: string;
  sql: string;
}

export interface SemanticSchema {
  tables: Table[];
  relationships: Relationship[];
  exampleSqls?: ExampleSql[];
}

export function createSemanticSchema(jsonString: string): SemanticSchema {
  const data = JSON.parse(jsonString);

  if (!data || !Array.isArray(data.tables) || !Array.isArray(data.relationships)) {
    throw new Error('Invalid SemanticSchema JSON string: must contain tables and relationships arrays');
  }

  let schema: SemanticSchema = {
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
  };

  if (Array.isArray(data.example_sqls)) {
    schema.exampleSqls = data.example_sqls.map((e: any) => ({
      question: e.question,
      sql: e.sql
    }));
  }

  return schema;
}

