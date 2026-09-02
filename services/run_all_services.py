"""
PolarIs AI Microservices Orchestrator
Launches and monitors all polar microservices:
- Forecast Service (port 8001)
- Optimizer Service (port 8002)
- Telemetry Service (port 8003)
- Anomaly Service (port 8004)
"""
import sys
import os
import subprocess
import time
import signal

SERVICES = [
    {
        "name": "forecast-service",
        "cwd": os.path.join(os.path.dirname(__file__), "forecast-service"),
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--port", "8001", "--host", "0.0.0.0"],
        "port": 8001
    },
    {
        "name": "optimizer-service",
        "cwd": os.path.join(os.path.dirname(__file__), "optimizer-service"),
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--port", "8002", "--host", "0.0.0.0"],
        "port": 8002
    },
    {
        "name": "telemetry-service",
        "cwd": os.path.join(os.path.dirname(__file__), "telemetry-service"),
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--port", "8003", "--host", "0.0.0.0"],
        "port": 8003
    },
    {
        "name": "anomaly-service",
        "cwd": os.path.join(os.path.dirname(__file__), "anomaly-service"),
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--port", "8004", "--host", "0.0.0.0"],
        "port": 8004
    },
]

processes = []

def start_services():
    print("=" * 60)
    print("PolarIs AI Microservices Gateway Starting...")
    print("=" * 60)
    
    for svc in SERVICES:
        print(f"[*] Starting {svc['name']} on port {svc['port']}...")
        p = subprocess.Popen(
            svc["cmd"],
            cwd=svc["cwd"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        processes.append((svc["name"], p))
        time.sleep(0.5)
    
    print("\n[✓] All microservices launched.")
    print("Press Ctrl+C to stop all services.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down microservices...")
        for name, p in processes:
            print(f"Terminating {name}...")
            p.terminate()

if __name__ == "__main__":
    start_services()
