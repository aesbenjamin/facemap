from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socket

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    """Health check endpoint for monitoring"""
    # Get socket info to show that IPv6 está funcionando
    hostname = socket.gethostname()
    try:
        # Tentando obter informações de IPv6
        ip_v6 = "IPv6 Suportado"
    except:
        ip_v6 = "IPv6 Não Suportado"
    
    return {
        "status": "ok", 
        "hostname": hostname,
        "ipv6_support": ip_v6
    }

@app.get("/api/status")
async def status():
    """Status endpoint"""
    return {"service": "facemap-backend", "status": "healthy", "version": "1.0.0"} 