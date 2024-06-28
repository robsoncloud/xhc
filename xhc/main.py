import asyncio
import logging
from fastapi import FastAPI,WebSocket, WebSocketDisconnect
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import HTMLResponse

from xhc.terminal.term_manager import TermManager
from xhc.websocket.connection import ConnectionManager


html = """

<body>
  <h1>Welcome!</h1>
  <form action="" onsubmit="sendMessage(event)">
    <label for="input_server">Server:</label>
    <input type="text" id="input_server" oninput="updateValue(event)">
    
    
    
    
    <input type="submit" value="Connect">
  </form>
  
  <form action="" onsubmit="sendCommand(event)">
    <input type="text" id="cmd" />
  </form>
  
  <h3>
    <span id="server"></span>
  </h3>
  
  <script>
    
    var server = ""
    var ws = null
    
    function updateValue(event) {
        var input = document.getElementById("input_server")
        var server_span = document.getElementById("server")
        if(input.value) {
            server.textContent = input.value
            server = input.value
        } else {
             server_span.textContent = input.value 
        }
    }
    function sendCommand(event) {
        var cmd = document.getElementById("cmd")
        if(ws.readyState == 1){
            
            ws.send(JSON.stringify({"cmd": cmd.value}))
        }
        event.preventDefault()
    }
    function sendMessage(event) {
        if(server) {
            console.log(`connect to server ${server}`)
             ws = new WebSocket(`http://localhost:8000/ws/${server}`)
             
             ws.onopen = function(event) {
                console.log("connection completed")
                ws.send(JSON.stringify({"teste":"mnsg"}))
            }
            
            ws.onmessage = function(data) {
                console.log(data)
            }
        }
        
        event.preventDefault()
    }
    
  </script>
</body>
</html>


"""



app = FastAPI()

@app.get("/")
async def root():
    
    return HTMLResponse(html)



term_manager = TermManager(shell_command=["python"])


logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG

@app.websocket("/ws/{client_id}")
async def connect(client_id: str, websocket: WebSocket):
    manager = ConnectionManager(client_id, term_manager)
    await manager.connect(client_id, websocket)
    
    # try:
    #     while True:
    #         data = await websocket.receive_json()
    #         print(data)
    #         await websocket.send_json({"msg": f"client_id {client_id} connected"})
    # except WebSocketDisconnect as e:
    #     print(f"disconnected {e}")
    # except Exception as e:
    #     print(f"WEBSOCKET {e}")
        
    

