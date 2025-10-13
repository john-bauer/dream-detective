import os
import json
import requests
import time
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"], #  Dev & prod frontend ports
    allow_methods=["*"],
    allow_headers=["*"],
)

# Init anthropic client
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Simple rate limiting - track last request time per IP
last_request_time = {}
RATE_LIMIT_SECONDS = 1  # Minimum 2s between requests

# Query Model
class ResearchQuery(BaseModel):
    question: str

# ------- Response Model -------
class ResearchResponse(BaseModel):
    answer: str
    sources: List[Dict[str, str]]
    research_steps: List[str]

# ------- Preferred Sources -------
PREFERRED_SOURCES = [
    "site:dreammoods.com",
    "site:dreambible.com",
    "site:dreamdictionary.org"
]

# ----------- Brave Search API Helper -----------
def search_web(query: str) -> List[Dict[str, Any]]:
    """Search using Brave Search API"""

    enhanced_query = f"{query} ({' OR '.join(PREFERRED_SOURCES[:3])})"
    
    brave_api_key = os.getenv("BRAVE_API_KEY")
    
    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": brave_api_key
    }
    params = {
        "q": enhanced_query,
        "count": 5  # Get top 5 results
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data.get("web", {}).get("results", []):
            results.append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "description": item.get("description", "")
            })
        
        return results
    
    except Exception as e:
        print(f"Search error: {e}")
        return []

def analyze_with_claude(dream_description: str, search_results: List[Dict[str, Any]]) -> str:
    """Use Claude to analyze search results and answer the question"""
    
    # Format search results for Claude
    sources_text = "\n\n".join([
        f"Source {i+1}:\nTitle: {r['title']}\nURL: {r['url']}\nDescription: {r['description']}"
        for i, r in enumerate(search_results)
    ])
    
    # ---------- System Prompt ----------
    prompt = f"""You are a dream interpretation assistant that synthesizes multiple symbolic meanings into coherent analysis.

"{dream_description}"

I've searched for relevant information and found these sources:

{sources_text}

Your task:
1. Identify the key symbols, emotions, and narrative elements in the dream
2. Provide interpretations from multiple perspectives (psychological, cultural, personal growth)
3. Acknowledge that dream interpretation is subjective
4. Offer questions for self-reflection rather than definitive answers
5. Be thoughtful and empathetic. Dreams often reflect real anxieties/desires
6. Use appropriate formatting, such as bulleted lists and/or paragraphs as necessary. 
7. When making lists, be sure to give each item its own line.
8. When referring to the sources, refer to them as your sources, not something that was provided to you by someone else.

Format your response using markdown. Be thorough but clear - aim for roughly 1-3 short paragraphs."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            timeout=30,  # 30 second timeout for Claude
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        return message.content[0].text
    
    except Exception as e:
        print(f"Claude error: {e}")
        return f"Error analyzing results: {str(e)}"
# -------- Research Endpoint --------
@app.post("/research", response_model=ResearchResponse)
async def research(query: ResearchQuery, request: Request):
    """Main research endpoint"""
    
    # Simple rate limiting
    client_ip = request.client.host
    current_time = time.time()
    
    if client_ip in last_request_time:
        time_since_last = current_time - last_request_time[client_ip]
        if time_since_last < RATE_LIMIT_SECONDS:
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded. Please wait {RATE_LIMIT_SECONDS - time_since_last:.1f} seconds before making another request."
            )
    
    last_request_time[client_ip] = current_time
    
    research_steps = []
    
    # Step 1: Search
    research_steps.append(f"Searching for: {query.question}")
    try:
        search_results = search_web(query.question)
        
        if not search_results:
            raise HTTPException(status_code=500, detail="No search results found")
        
        research_steps.append(f"Found {len(search_results)} relevant sources")
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search service temporarily unavailable")
    
    # Step 2: Analyze with Claude
    research_steps.append("Analyzing sources with AI...")
    try:
        answer = analyze_with_claude(query.question, search_results)
        research_steps.append("Analysis complete")
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail="AI analysis service temporarily unavailable")
    
    # Step 3: Return formatted response
    return ResearchResponse(
        answer=answer,
        sources=search_results,
        research_steps=research_steps
    )

# -------- Health Check --------
@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)