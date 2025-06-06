# Empowering Data Analytics Agents with BigQuery Semantic Views

## Overview

This project will develop and showcase a framework for empowering autonomous data analytics agents with Google BigQuery semantic views. This initiative will demonstrate how the combination of a well-defined semantic layer with intelligent agents can revolutionize data analysis by making it more accessible, efficient, and reliable for business users.

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

3. **Generate semantic view**

```bash
python table_search/utils/semantic_view.py
```

4. **Run Agents**

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

2. **Install NPM dependencies**

```
npm install @swimlane/ngx-graph --save
```


3. **Start ADK API Server**

Under the root directory
```bash
adk api_server
```
More details at https://google.github.io/adk-docs/get-started/testing/


4. **Start Web Server**

Navigate to the `web` directory:
```bash
cd web
```

and run
```
ng serve
```

Then visit `localhost:4200` in your browser.
