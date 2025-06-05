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



def gen_prompt():
    prompt = """
You are an expert data architect and business analyst specializing in Google Cloud and BigQuery. Your primary goal is to translate a technical BigQuery schema into a conceptual semantic layer that is intuitive and meaningful for business users.

The input you will receive is a JSON object representing a BigQuery dataset schema. This JSON contains an array of objects, where each object defines a BigQuery table and includes:

* `project`: The Google Cloud project ID.
* `dataset_id`: The BigQuery dataset ID.
* `table_id`: The name of the table.
* `num_rows`: The total number of rows of the table.
* `description`: Optional table description.
* `schema`: An array of objects, where each object defines a column with its `name` and `type` (e.g., "INTEGER", "STRING").

**Your most important task is to carefully analyze the schema to understand its underlying business meaning.** Use the column names, table names, and optional `description` and `num_rows` fields as clues. For example, tables with a large number of rows and key columns referencing other tables are likely "fact" tables (containing events or transactions), while smaller tables are often "dimension" tables (containing descriptive attributes). Abstract away the raw schema into meaningful business concepts.

Based on your business-centric analysis, generate a single JSON object that represents the semantic layer. The JSON output should contain the following top-level keys:

* **`tables`**: An array of objects representing the tables, including their `name` and inferred `primary_key`.
* **`relationships`**: An array defining the logical joins between tables, with `from_table`, `from_column`, `to_table`, and `to_column` keys.
* **`dimensions`**: An array of business-friendly dimensions. The `name` for each dimension should be a clean, user-friendly business term (e.g., "Supplier Name" instead of `S_NAME`). Each object should contain a `name` and a fully qualified `column`.
* **`metrics`**: An array of key business metrics. The `name` should clearly state the business question the metric answers (e.g., "Total Account Balance"). The `sql` should represent a common and logical business calculation based on the column's meaning. Each object should have:
    * `name`: A user-friendly name for the metric.
    * `sql`: The complete SQL expression to calculate the metric (e.g., `SUM(table.column)`).

### Example of Expected JSON Output for a BigQuery Semantic Layer:

For a BigQuery schema containing `SUPPLIER`, `NATION`, and `REGION` tables, your generated JSON should reflect this business-friendly approach:

```json
{
  "tables": [
    {
      "name": "REGION",
      "primary_key": "R_REGIONKEY"
    },
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
    },
    {
      "from_table": "NATION",
      "from_column": "N_REGIONKEY",
      "to_table": "REGION",
      "to_column": "R_REGIONKEY"
    }
  ],
  "dimensions": [
    {
      "name": "Supplier Name",
      "column": "SUPPLIER.S_NAME"
    },
    {
      "name": "Supplier Address",
      "column": "SUPPLIER.S_ADDRESS"
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
      "name": "Total Account Balance",
      "sql": "SUM(SUPPLIER.S_ACCTBAL)"
    },
    {
      "name": "Balance With 5% Tax",
      "sql": "SUM(SUPPLIER.S_ACCTBAL * 1.05)"
    }
  ]
}
```
    """
    return prompt

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
    instruction = gen_prompt()
    table_info = gen_table_info()
    prompt = f"{instruction}\n\n--------- The BigQuery schemas of the available datasets and their tables. ---------\n{table_info}"

    print("Starting to call LLM...")
    response = model.generate_content(
        prompt,
        generation_config=GenerationConfig(
            temperature=0.01,
        ),
        safety_settings=SAFETY_FILTER_CONFIG,
    ).text
    print(response)


if __name__ == '__main__':
    gen_semantic_view()
