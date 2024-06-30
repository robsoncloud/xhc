import asyncio
from concurrent.futures import ThreadPoolExecutor
import json
import logging
import time
from fastapi import WebSocket, WebSocketDisconnect, WebSocketException, websockets

from xhc.terminal.term import PtyTerminal
from xhc.terminal.term_manager import TermManager


class ConnectionManager:

    def __init__(self, client_id: str, term_manager: TermManager):
        self._active_connections: dict[str, WebSocket] = {}
        self.term_manager = term_manager
        self.ws: WebSocket or None = None
        self.ws_queue: asyncio.Queue = asyncio.Queue()
        self._logger = logging.getLogger(__name__)
        self.terminal: PtyTerminal or None = None
        self.client_id: str = client_id

    # async def task_send_ws_queue_to_server(self):
    #     """Waits for new pty output (nonblocking), then immediately sends to server"""
    #     while True:
    #         data = await self.ws_queue.get()
    #         await self.ws.send(data)

    async def task_receive_websocket_messages(self):
        """receives events+payloads from browser websocket connection"""
        try:
            while True:
                data = await self.ws.receive_json()
                # data = await  self._active_connections[client_id].receive_json()

                msg_type = data["type"]
                payload = data["payload"]

                match msg_type:
                    case "stdin":
                        print(f"sending command {payload} to python")
                        self.stdin_to_ptyproc(payload+"\n")
                    case _:
                        print("received command from python")

                #print(f"print('test from client - {self.client_id}')\n")
                # self.stdin_to_ptyproc(client_id,f"print('test from client - {client_id}')\n")
        except WebSocketDisconnect as disconnect_error:
            print(f"client_id: {self.client_id} has disconnected")
            self.on_close()
        except WebSocketException as e:
            print(e)
            return

    async def connect(self, server: str, ws: WebSocket):
        try:
            await ws.accept()
            self._active_connections[server] = ws
            self.ws = ws
            self.client_id = server

            pty_terminal = await self.term_manager.get_terminal(server)
            pty_terminal.clients[server] = self
            self.terminal = pty_terminal

            tasks = [
                # asyncio.ensure_future(self.task_send_ws_queue_to_server()),
                asyncio.ensure_future(self.task_receive_websocket_messages()),
            ]

            done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)


        except WebSocketException as e:
            print("errrrr")
        except WebSocketDisconnect as d:
            print("errrr")
        except Exception as e:
            print(e)

    async def send_message(self, data):
        await self.ws.send_json(data)

    def on_pty_read(self, data):
        # print(f"on_pty_read from {self.client_id}")
        asyncio.create_task(self.send_message({"type": "stdout", "payload": data}))

    def stdin_to_ptyproc(self, text: str) -> None:
        """Handles stdin messages sent on the websocket.

        This is a blocking call that should NOT be performed inside the
        server primary event loop thread. Messages must be handled
        asynchronously to prevent blocking on the PTY buffer.
        """
        if self.terminal is not None:
            self.terminal.ptyproc.write(text)
            # self.terminal.ptyproc.write_to_stdout(text)
        # print(f'sendjing to cmd {client_id}')
        # if client_id in self.term_manager.terminals:
        #     self.term_manager.terminals[client_id].ptyproc.write(text)

    def on_pty_died(self) -> None:
        """Terminal closed: tell the frontend, and close the socket."""
        if self.ws:
            asyncio.create_task(self.send_message(["disconnect", 1]))
        self._logger.info("Terminal died")
        self.terminal = None

    def on_close(self) -> None:
        """Handle websocket closing.

        Disconnect from our terminal, and tell the terminal manager we're
        disconnecting.
        """
        self._logger.info("Websocket closed")
        if self.terminal:
            self.terminal.clients.pop(self.client_id)
            # self.terminal.resize_to_smallest()
        self.term_manager.client_disconnected(self)
        self.term_manager.terminals.pop(self.client_id)
