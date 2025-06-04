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

"""Top level agent for data agent multi-agents.

-- it get data from database (e.g., BQ) using NL2SQL
-- then, it use NL2Py to do further data analysis as needed
"""
import os
from datetime import date

from google.genai import types

from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.tools import load_artifacts

from .sub_agents.bigquery.tools import get_project_settings
from .prompts import return_instructions_root
from .tools import call_db_agent, call_ds_agent

date_today = date.today()


def setup_before_agent_call(callback_context: CallbackContext):
    """Setup the agent."""
    # setting up schema in instruction
    project_settings = get_project_settings()
    callback_context.state["project_settings"] = project_settings
    
    dataset_settings = project_settings.get("dataset_settings", {})

    schema_prompt_parts = []

    schema_prompt_parts.append("\n--------- The BigQuery schemas of the available datasets and their tables. ---------")

    for dataset_id, schema_content in dataset_settings.items():
        schema_prompt_parts.append(f"\n--- Schema for Dataset: `{dataset_id}` ---\n")
        schema_prompt_parts.append(schema_content)
    
    full_schema_string = "\n".join(schema_prompt_parts)

    callback_context._invocation_context.agent.instruction = f"{return_instructions_root()}\n{full_schema_string}"

    print(f"DEBUG: {callback_context._invocation_context.agent.instruction}")


root_agent = Agent(
    model=os.getenv("ROOT_AGENT_MODEL"),
    name="table_search_multiagent",
    instruction=return_instructions_root(),
    global_instruction=(
        f"""
        You are a BigQuery AI expert, acting as an intelligent bridge to a complex database.
        Your mission is to understand a user's natural language request and help them discover the exact data they need.
        Your capabilities include: finding relevant datasets, identifying specific tables, and clarifying schema information.
        Today's date is {date_today}.
        """
    ),
    tools=[
        call_db_agent,
        # call_ds_agent,
        # load_artifacts,
    ],
    before_agent_callback=setup_before_agent_call,
    generate_content_config=types.GenerateContentConfig(temperature=0.01),
)
