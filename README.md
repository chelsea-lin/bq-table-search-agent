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


## To use the web UI

1. **Install NPM and Angular CLI**
```bash
sudo apt install npm
npm install -g @angular/cli
```

If the installation is successful, you should be able to run this command
```
ng --version
```


2. **Start ADK API Server**
Under the root directory
```bash
adk api_server
```
More details at https://google.github.io/adk-docs/get-started/testing/


3. **Start Web Server**
Navigate to the `web` directory:
```bash
cd web
```

and run
```
ng serve
```

Then visit `localhost:4200` in your browser.
