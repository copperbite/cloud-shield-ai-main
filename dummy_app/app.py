from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import requests
import time
import random

app = FastAPI(title="Dummy Checkout App")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    """Serves the main interactive control screen for generating checkout logs"""
    return templates.TemplateResponse(request=request, name="index.html")

@app.post("/api/trigger")
def trigger_action(action: dict):
    """Triggers specific types of payment logs and posts them to backend server"""
    action_type = action.get("type")
    ip = action.get("ip", "192.168.1.100")
    timestamp = time.strftime("%d/%b/%Y:%H:%M:%S")
    
    amount = random.randint(100, 5000)
    log_lines = []
    
    if action_type == "normal":
        gateways = ["Razorpay_Core", "Bank_HDFC", "Bank_SBI"]
        gw = random.choices(gateways, weights=[50, 30, 20])[0]
        latency = random.randint(50, 200)
        log_lines.append(f'{ip} - - [{timestamp}] "POST /checkout" 200 {amount} {gw} {latency}')
        
    elif action_type == "hdfc_downtime":
        gw = "Bank_HDFC"
        latency = random.randint(1500, 5000)
        status = random.choice([500, 503, 504])
        log_lines.append(f'{ip} - - [{timestamp}] "POST /checkout" {status} {amount} {gw} {latency}')
        
    elif action_type == "sbi_latency":
        gw = "Bank_SBI"
        latency = random.randint(800, 2500)
        log_lines.append(f'{ip} - - [{timestamp}] "POST /checkout" 200 {amount} {gw} {latency}')
        
    elif action_type == "fraud_spike":
        gw = "Razorpay_Core"
        latency = random.randint(50, 100)
        log_lines.append(f'{ip} - - [{timestamp}] "POST /checkout" 200 {amount} {gw} {latency}')
        
    else:
        return {"error": f"Unknown action type: {action_type}"}
        
    results = []
    for line in log_lines:
        try:
            res = requests.post("http://127.0.0.1:8000/api/log", json={"log_line": line, "ip": ip})
            results.append(res.json())
        except Exception as e:
            results.append({"status": "error", "message": f"Could not sync log to backend API: {str(e)}"})
            
    return {"status": "success", "results": results}

@app.api_route("/api/reset", methods=["GET", "POST"])
def reset_action():
    try:
        res = requests.get("http://127.0.0.1:8000/api/reset")
        return res.json()
    except Exception as e:
        return {"status": "error", "message": f"Could not reset backend: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)
