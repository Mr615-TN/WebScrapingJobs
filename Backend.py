from fastapi import FastAPI, HTTPException
from bs4 import BeautifulSoup
import requests
import re
from typing import List, Optional
from pydantic import BaseModel
import asyncio
from datetime import datetime

app = FastAPI()

class JobListing(BaseModel):
    title: str
    company: str
    location: str
    description: str
    url: str
    date_posted: Optional[str]
    salary_range: Optional[str]
    experience_level: Optional[str]

async def scrape_indeed(search_term: str) -> List[JobListing]:
    jobs = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        url = f"https://www.indeed.com/jobs?q={search_term}+entry+level&l="
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        job_cards = soup.find_all('div', class_='job_seen_beacon')
        
        for card in job_cards[:10]:  # Limit to first 10 results for demo
            try:
                title = card.find('h2', class_='jobTitle').get_text(strip=True)
                company = card.find('span', class_='companyName').get_text(strip=True)
                location = card.find('div', class_='companyLocation').get_text(strip=True)
                description = card.find('div', class_='job-snippet').get_text(strip=True)
                url = 'https://www.indeed.com' + card.find('a')['href']
                
                # Extract salary if available
                salary_div = card.find('div', class_='salary-snippet')
                salary_range = salary_div.get_text(strip=True) if salary_div else None
                
                jobs.append(
                    JobListing(
                        title=title,
                        company=company,
                        location=location,
                        description=description,
                        url=url,
                        salary_range=salary_range,
                        experience_level="Entry Level",
                        date_posted=datetime.now().strftime("%Y-%m-%d")
                    )
                )
            except AttributeError:
                continue
                
    except Exception as e:
        print(f"Error scraping Indeed: {str(e)}")
    
    return jobs

@app.get("/api/jobs/{search_term}")
async def get_jobs(search_term: str):
    jobs = await scrape_indeed(search_term)
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found")
    return jobs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
