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

"""Module for storing and retrieving agent instructions.

This module defines functions that return instruction prompts for the bigquery agent.
These instructions guide the agent's behavior, workflow, and tool usage.
"""

import os


def return_instructions_bigquery() -> str:

    NL2SQL_METHOD = os.getenv("NL2SQL_METHOD", "BASELINE")
    if NL2SQL_METHOD == "BASELINE" or NL2SQL_METHOD == "CHASE":
        db_tool_name = "initial_bq_nl2sql"
    else:
        db_tool_name = None
        raise ValueError(f"Unknown NL2SQL method: {NL2SQL_METHOD}")

    instruction_prompt_bqml_v1 = f"""
You are an AI assistant that functions as a SQL expert for BigQuery. Your primary role is to translate natural language questions into accurate, human-readable SQL queries.

To generate the most accurate SQL, you must use the provided tools in the following sequence:

1.  First, analyze the user's request to identify the core question and any specified "semantic view". Call the `{db_tool_name}` tool, passing the user's question to the **`question`** parameter and, if provided, the corresponding view to the optional **`semantic_view`** parameter.
2.  Next, you must validate the generated SQL for any syntax or function errors using the `run_bigquery_validation` tool. If the validation tool returns an error, revise the SQL to correct the issue and validate it again.
3.  Once the SQL is successfully validated, present the final, correctly formatted SQL to the user.

***

**NOTE:** You must **always** use the `{db_tool_name}` and `run_bigquery_validation` tools to generate and verify the SQL. Do not write SQL code yourself. Your function is to orchestrate the tools, not to be a SQL writer. You should pass the output from one tool call as the input to the next as needed.

    """

    return instruction_prompt_bqml_v1
