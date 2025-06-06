# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import annotations


import os
import re
from pathlib import Path
from dotenv import load_dotenv, set_key
import vertexai
from vertexai import rag
from vertexai.generative_models import (GenerationConfig, HarmBlockThreshold,
                                        HarmCategory)
from vertexai.preview.generative_models import GenerativeModel
from google.cloud import bigquery
import json


# Define the path to the .env file
env_file_path = Path(__file__).parent.parent.parent / ".env"
print(env_file_path)

# Load environment variables from the specified .env file
load_dotenv(dotenv_path=env_file_path, verbose=True, override=True)
BQ_PROJECT_ID = os.getenv("BQ_PROJECT_ID")
BQ_DATASET_IDS = os.getenv("BQ_DATASET_IDS")

# Init BQ client.
client = bigquery.Client(project=BQ_PROJECT_ID)

# Init LLM model.
model_name = os.getenv("SEMANTIC_VIEW_MODEL")
model = GenerativeModel(model_name=model_name)

SAFETY_FILTER_CONFIG = {
    HarmCategory.HARM_CATEGORY_UNSPECIFIED: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
}



def semantic_gen_prompt(table_info):
    prompt = """
You are an expert data architect and business analyst specializing in Google Cloud and BigQuery. Your primary goal is to translate a technical BigQuery schema into a conceptual **semantic view**. This **semantic view** is a high-level abstraction designed to bridge the gap between raw database tables and final business analysis.

The input you will receive is a JSON object representing a BigQuery dataset schema. This JSON contains an array of objects, where each object defines a BigQuery table and includes:

* `project`: The Google Cloud project ID.
* `dataset_id`: The BigQuery dataset ID.
* `table_id`: The name of the table.
* `num_rows`: The total number of rows of the table.
* `description`: Optional table description.
* `schema`: An array of objects, where each object defines a column with its `name` and `type`.

**Your most important task is to carefully analyze the schema to understand its underlying business meaning.** Use the column names, table names, `num_rows` and optional `description` fields as clues to identify fact and dimension tables. The goal is to abstract the raw schema into meaningful business concepts that have a clear and direct mapping to SQL operations.

Based on your analysis, generate a single JSON object that represents the **semantic view**. The JSON output should contain the following top-level keys:

* **`tables`**: An array of objects representing the tables, including their `name` and inferred `primary_key`.
* **`relationships`**: An array defining the logical connections between tables. **This defines the default join paths between tables, specifying how they should be linked in a SQL `JOIN` clause.** Each object should contain `from_table`, `from_column`, `to_table`, and `to_column` keys.
* **`dimensions`**: An array of business-friendly attributes. **These represent the categorical data you would typically use in a SQL `GROUP BY` clause.** The `name` should be a clean, user-friendly alias for the grouping column. Each object should contain a `name` and a fully qualified `column`.
* **`metrics`**: An array of key business calculations. **These are the quantitative values, containing the SQL aggregation or scalar functions you would use in a `SELECT` statement.** Each object should have:
    * `name`: A user-friendly name for the metric.
    * `sql`: The complete SQL expression to calculate the metric (e.g., `SUM(table.column)`, `COUNT(DISTINCT table.column)`).

### Example of Expected JSON Output for a BigQuery Semantic View:

For a BigQuery schema containing `SUPPLIER` and `NATION` tables (and potentially `REGION`), your generated JSON should reflect this business-friendly, SQL-aligned approach:

```json
{
  "tables": [
    {
      "name": "NATION",
      "primary_key": "N_NATIONKEY"
    },
    {
      "name": "SUPPLIER",
      "primary_key": "S_SUPPKEY"
    }
  ],
  "relationships": [
    {
      "from_table": "SUPPLIER",
      "from_column": "S_NATIONKEY",
      "to_table": "NATION",
      "to_column": "N_NATIONKEY"
    }
  ],
  "dimensions": [
    {
      "name": "Supplier Name",
      "column": "SUPPLIER.S_NAME"
    },
    {
      "name": "Nation",
      "column": "NATION.N_NAME"
    },
    {
      "name": "Region",
      "column": "REGION.R_NAME"
    }
  ],
  "metrics": [
    {
      "name": "Total Suppliers",
      "sql": "COUNT(SUPPLIER.S_SUPPKEY)"
    },
    {
      "name": "Average Account Balance",
      "sql": "AVG(SUPPLIER.S_ACCTBAL)"
    },
    {
      "name": "Balance With 5% Tax",
      "sql": "SUM(SUPPLIER.S_ACCTBAL * 1.05)"
    }
  ]
}
```
    """

    return f"{prompt}\n\n--------- The BigQuery schemas of the available datasets and their tables. ---------\n{table_info}"

def sql_gen_prompt(struct, project, dataset):
    prompt = f"""
You are an expert data analyst who specializes in creating high-quality training data for SQL-generating AI models.

Your task is to generate 10 diverse pairs of natural language questions and their corresponding SQL queries based on the JSON struct provided below.

{struct}

**Instructions:**
1.  **Realistic Questions:** The questions must reflect realistic business inquiries that a user would ask.
2.  **Use Schema Context:** Leverage the `dimensions` for natural language phrasing in the questions and the `metrics` for complex calculations in the SQL.
3.  **Correct Joins:** The SQL queries must be valid and correctly join tables based on the `relationships` provided in the struct.
4.  **Variety:** Create a mix of queries, from simple lookups to complex aggregations involving multiple joins, filtering, and ordering.
5.  **Strict Output Format:** You MUST format your entire response as a single JSON array `[]`. Each element in the array must be a JSON object `{{}}` with exactly two keys: a `question` key and a `sql` key. Do not include any explanations or text outside of this JSON structure.
6.  The bigquery project is {project}, dataset is {dataset}
**Example of the required output format:**
```json
[
  {{
    "question": "An example question about data.",
    "sql": "SELECT column FROM table;"
  }}
]
"""
    return prompt

def clean_json_string(input_str: str) -> str:
    cleaned_str = input_str.strip()
    if cleaned_str.startswith("```json"):
        cleaned_str = cleaned_str[7:]
    elif cleaned_str.startswith("```"):
        cleaned_str = cleaned_str[3:]
    if cleaned_str.endswith("```"):
        cleaned_str = cleaned_str[:-3]
        
    return cleaned_str.strip()

def validate_and_inject_examples(llm_response_str: str, schema_json_str: str):
    schema_data = json.loads(clean_json_string(schema_json_str))
    qa_pairs = json.loads(clean_json_string(llm_response_str))

    valid_examples = []
    try:
        client = bigquery.Client()
        job_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
    except Exception as e:
        raise f'{{"error": "Could not initialize BigQuery client: {e}"}}'
    
    print("--- Starting SQL Validation ---")
    for i, pair in enumerate(qa_pairs, 1):
        question = pair.get("question", "N/A")
        sql = pair.get("sql", None)

        print(f"\n Validating Pair {i}: \"{question}\"")
        if not sql:
            print("Status: SKIPPED (No SQL provided)")
            continue

        try:
            client.query(sql, job_config=job_config)
            print("Status: VALID")
            valid_examples.append(pair)
        except:
            pass


    print(f"\n Validation complete. Injecting {len(valid_examples)} valid examples into the JSON.")
    schema_data["example_sqls"] = valid_examples

    return schema_data

    

def gen_table_info():
    datasets = [item.strip() for item in BQ_DATASET_IDS.split(',')]
    if len(datasets) != 1:
        raise NotImplementedError("Only for one dataset.")
    
    tables = client.list_tables(datasets[0])
    table_list = []
    for table_id in tables:
        table = client.get_table(table_id)
        # TODO: check if other table properties are useful.
        table_dict = {
            "project": table.project,
            "dataset_id": table.dataset_id,
            "table_id": table.table_id,
            "num_rows": table.num_rows,
            "description": table.description,
            "schema": [field.to_api_repr() for field in table.schema]
        }
        table_list.append(table_dict)
    return json.dumps(table_list, indent=2)


def gen_semantic_view():
    table_info = gen_table_info()
    print("Starting to call LLM...")
    response = model.generate_content(
        semantic_gen_prompt(table_info),
        generation_config=GenerationConfig(
            temperature=0.01,
        ),
        safety_settings=SAFETY_FILTER_CONFIG,
    ).text
    print(response)
    print("Starting to call LLM for SQL")
  
    sql_response = model.generate_content(
        sql_gen_prompt(response, project=BQ_PROJECT_ID, dataset=BQ_DATASET_IDS.split(",")[0]),
        generation_config=GenerationConfig(
            temperature=0.01,
        ),
        safety_settings=SAFETY_FILTER_CONFIG,
    ).text
    print(sql_response)

    print("Starting to verify SQL")
    final_view = validate_and_inject_examples(sql_response, response)
    output_filename = Path(__file__).parent / "output/v2_long_prompt_w_sql.json"
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(final_view, f, ensure_ascii=False, indent=2)

    


if __name__ == '__main__':
    gen_semantic_view()
