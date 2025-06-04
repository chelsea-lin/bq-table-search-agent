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

import os
from pathlib import Path
from dotenv import load_dotenv, set_key
import vertexai
from vertexai import rag
from google.cloud import bigquery


# Define the path to the .env file
env_file_path = Path(__file__).parent.parent.parent / ".env"
print(env_file_path)

# Load environment variables from the specified .env file
load_dotenv(dotenv_path=env_file_path, verbose=True, override=True)
BQ_PROJECT_ID = os.getenv("BQ_PROJECT_ID")
BQ_DATASET_IDS = os.getenv("BQ_DATASET_IDS")

# Init BQ client.
client = bigquery.Client(project=BQ_PROJECT_ID)

def gen_table_info():
    datasets = [item.strip() for item in BQ_DATASET_IDS.split(',')]
    if len(datasets) != 1:
        raise NotImplementedError("Only for one dataset.")
    
    tables = client.list_tables(datasets[0])
    for table_id in tables:
        table = client.get_table(table_id)
        print("{}.{}.{}".format(table.project, table.dataset_id, table.table_id))
        print(table.schema)
        print(table.description)
        print(table.num_rows)

if __name__ == "__main__":
    gen_table_info()
