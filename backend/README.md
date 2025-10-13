# Dream Detective (Backend)

## About

This project uses the following to create a dream analyst AI agent.

## Getting Started

To run this side of the project, you'll need [Python 3](https://www.python.org/downloads/), as well as an API key for [Claude](https://claude.ai/) and an API key for [Brave Search API](https://brave.com/search/api/) (the "AI" version).

Once you have those, create a .env file with the following variables:

```
ANTHROPIC_API_KEY=Your Claude Key
BRAVE_API_KEY=Your Brave Search Key
```

Once your `.env` file is set up, run the following commands:

```bash
# Create a virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python agent.py
```
The API will now be running at `http://localhost:8000`.

## Technologies Used

- [Python](https://www.python.org/): 3.13
- [FastAPI](https://fastapi.tiangolo.com/): Our API framework
- [Brave Search API](https://brave.com/search/api/): A web search API that the agent uses to find quality information (API Key Provided).
- [Uvicorn](https://uvicorn.dev/): [ASGI](https://uvicorn.dev/concepts/asgi/) server for running FastAPI