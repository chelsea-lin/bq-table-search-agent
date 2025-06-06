import {createSemanticSchema, SemanticSchema} from './semantic_schema';
import * as semanticSchemaJson from './semantic_schema.json';

export function provideSemanticSchema(): SemanticSchema {
  // The JSON data is imported directly. The 'default' property of the imported
  // object contains the JSON content.
  const schema = createSemanticSchema(JSON.stringify(semanticSchemaJson));
  return schema;
}