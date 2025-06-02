# BigQuery Table Search Agent

## Overview

This project addresses a critical challenge in data analytics: finding the right data. The BQ Table Search Agent automatically enriches BigQuery tables with a rich semantic layer, describing not just the schema but the business meaning of the data. This automated metadata generation unlocks two powerful capabilities: an intuitive, concept-based search for tables and a significant boost in the accuracy of NL2SQL tools, enabling analysts to get to deeper insights, faster.

## Setup and Installation

1. **Install Dependencies**

```bash
python -m venv venv
source venv/bin/activate
pip install -e .[all]
```
2. **Configurate the .env file**

```bash
cp .env-example .env
```


Run agent with ADK Web UI:

```bash
adk web
```

3. **Run Agents**

Run agent in CLI:

```bash
adk run table_search
```

Run agent with ADK Web UI:

```bash
adk web
```
