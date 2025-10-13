import os
import json
import requests
import time
import logging
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

# -------- Logging config -----------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Validate required environment variables on startup
required_env_vars = ["ANTHROPIC_API_KEY", "BRAVE_API_KEY"]
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
    logger.error(error_msg)
    raise RuntimeError(error_msg)

app = FastAPI()

allowed_origins = [
    "http://localhost:5173", # Dev frontend port
    "http://localhost:4173", # Prod frontend port
]

# Add production frontend URL if set
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)
    # Also allow without trailing slash
    if frontend_url.endswith("/"):
        allowed_origins.append(frontend_url.rstrip("/"))
    else:
        allowed_origins.append(frontend_url + "/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
    allow_credentials=False,
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff" # Prevents MIME-type sniffing
    response.headers["X-Frame-Options"] = "DENY" # Prevents clickjacking through iframes
    response.headers["X-XSS-Protection"] = "1; mode=block" # Prevents reflected XSS attacks
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains" # Prevents HTTP downgrade
    return response

# Request size limit middleware (10MB max)
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 10_485_760:  # 10MB
        return JSONResponse(
            status_code=413,
            content={"detail": "Request too large"}
        )
    return await call_next(request)

# Init anthropic client
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Simple rate limiting - track last request time per IP
last_request_time = {}
RATE_LIMIT_SECONDS = 1  # Minimum 1s between requests

# Query Model
class ResearchQuery(BaseModel):
    question: str
    
    @field_validator('question')
    @classmethod
    def validate_question(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Question cannot be empty')
        if len(v) > 1000:
            raise ValueError('Question must be less than 1000 characters')
        return v.strip()

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
    
    except requests.Timeout:
        logger.error("Brave Search API timeout")
        return []
    except requests.RequestException as e:
        logger.error(f"Brave Search API error: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected search error: {e}")
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
        logger.error(f"Claude API error: {e}")
        raise  # Re-raise to be handled by endpoint
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
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded. Please wait {RATE_LIMIT_SECONDS - time_since_last:.1f} seconds before making another request."
            )
    
    last_request_time[client_ip] = current_time
    
    logger.info(f"Research request from {client_ip}: {query.question[:50]}...")
    research_steps = []
    
    # Step 1: Search
    research_steps.append(f"Searching for: {query.question}")
    try:
        search_results = search_web(query.question)
        
        if not search_results:
            logger.warning("No search results found")
            raise HTTPException(status_code=503, detail="Search service returned no results. Please try again.")
        
        research_steps.append(f"Found {len(search_results)} relevant sources")
        logger.info(f"Found {len(search_results)} search results")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=503, detail="Search service temporarily unavailable")
    
    # Step 2: Analyze with Claude
    research_steps.append("Analyzing sources with AI...")
    try:
        answer = analyze_with_claude(query.question, search_results)
        research_steps.append("Analysis complete")
        logger.info("Analysis complete")
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=503, detail="AI analysis service temporarily unavailable")
    
    # Step 3: Return formatted response
    return ResearchResponse(
        answer=answer,
        sources=search_results,
        research_steps=research_steps
    )

# -------- Health Check --------
@app.get("/health")
async def health():
    """Health check endpoint that verifies API dependencies"""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "checks": {}
    }
    
    # Check if API keys are configured
    health_status["checks"]["anthropic_configured"] = bool(os.getenv("ANTHROPIC_API_KEY"))
    health_status["checks"]["brave_configured"] = bool(os.getenv("BRAVE_API_KEY"))
    
    # If any check fails, return unhealthy
    if not all(health_status["checks"].values()):
        health_status["status"] = "unhealthy"
        return JSONResponse(status_code=503, content=health_status)
    
    return health_status

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)