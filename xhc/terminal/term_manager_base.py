from __future__ import annotations 
import asyncio
import logging
import os
import select
import signal
from typing import Any, Dict
import warnings
from concurrent import futures
from tornado.ioloop import IOLoop



logging.basicConfig(level=logging.DEBUG)
from xhc.terminal.term import PtyTerminal

DEFAULT_TERM_TYPE = "xterm-256color"
ENV_PREFIX = "PYXTERM_"  # Environment variable prefix

def _poll(fd: int, timeout: float = 0.1) -> list[tuple[int, int]]:
    """Poll using poll() on posix systems and select() elsewhere (e.g., Windows)"""
    if os.name == "posix":
        poller = select.poll()
        poller.register(
            fd, select.POLLIN | select.POLLPRI | select.POLLHUP | select.POLLERR
        )  # read-only
        return poller.poll(timeout * 1000)  # milliseconds
    # poll() not supported on Windows
    r, _, _ = select.select([fd], [], [], timeout)
    return r

class TermManagerBase:
    def __init__(
        self,
        shell_command: str,
        term_settings: Any = None,
        extra_env: Any = None,
        ioloop: Any = None,
        blocking_io_executor: Any = None):
        """Initilize pty manager"""
        self.shell_command = shell_command
        self.term_settings = term_settings or {}
        self.extra_env = extra_env 
        self.log = logging.getLogger(__name__)
        
        # declare the list of ptys managed by this manager
        self.ptys_by_fd: Dict[int, PtyTerminal] = {}
        
        if blocking_io_executor is None:
            self._blocking_io_executor_is_external = False
            self.blocking_io_executor = futures.ThreadPoolExecutor(max_workers=1)
        else:
            self._blocking_io_executor_is_external = True
            self.blocking_io_executor = blocking_io_executor
            
        if ioloop is not None:
            warnings.warn(
                f"Setting {self.__class__.__name__}.ioloop is deprecated and ignored",
                DeprecationWarning,
                stacklevel=2,
            )
            
    def _update_removing(target: Any, changes: Any) -> None:
        """Like dict.update(), but remove keys where the value is None."""
        for k, v in changes.items():
            if v is None:
                target.pop(k, None)
            else:
                target[k] = v
                
    def make_term_envs(self, height: int = 25, width: int = 80, **kwargs):
        env = os.environ.copy()
        env["TERM"] = self.term_settings.get("type", DEFAULT_TERM_TYPE)
        dimensions = "%dx%d" % (width, height)
        env[ENV_PREFIX + "DIMENSIONS"] = dimensions
        env["COLUMNS"] = str(width)
        env["LINES"] = str(height)
        
        if self.extra_env:
            self._update_removing(env, self.extra_env)
        term_env = kwargs.get("extra_env",{})
        if term_env and isinstance(term_env, dict):
            self._update_removing(env, term_env)
            
        return env
    
    def new_terminal(self, **kwargs: Any) -> PtyTerminal:
        # get or create a new PtyTerminal
        options = self.term_settings.copy()
        options["shell_command"] = self.shell_command
        options.update(kwargs)
        argv = options["shell_command"]
        env = self.make_term_envs(**options)
        cwd = options.get("cwd", None)
        
        return PtyTerminal(argv, env, cwd)
    
    def on_eof(self, pty: PtyTerminal) -> None:
        """Called when the pty has closed."""
        # Stop trying to read from that terminal
        print("on_eof")
        fd = pty.ptyproc.fd
        self.log.info("EOF on FD %d; stopping reading", fd)
        del self.ptys_by_fd[fd]
        IOLoop.current().remove_handler(fd)

        # This closes the fd, and should result in the process being reaped.
        pty.ptyproc.close()
        
    def start_reading(self, pty: PtyTerminal) -> None:
        """Connect a terminal to the event loop to read data from it."""
        fd = pty.ptyproc.fd
        self.ptys_by_fd[fd] = pty
        print(f"created {fd}")
        # loop = asyncio.get_event_loop()
        # loop.add_reader(fd, lambda: self.pty_read(fd))
        loop = IOLoop.current()
        loop.add_handler(fd, self.pty_read, loop.READ)
        
    def pty_read(self, fd: int, events: Any) -> None:
        #pass
        try:
            """Called by the event loop when there is pty data ready to read."""
            self.log.debug(f"pty_read called with fd: {fd}")
            if not _poll(fd, timeout=0.1):  # 100ms
                self.log.debug("Spurious pty_read() on fd %s", fd)
                return
            pty = self.ptys_by_fd[fd]
            self.pre_pty_read_hook(pty)
            s = pty.ptyproc.read(65536)
            pty.read_buffer.append(s)
            for client_id, connection in pty.clients.items():
                print(f"send output to {client_id}")
                connection.on_pty_read(s)
        except EOFError:
            self.log.info(f"EOF on FD {fd}; stopping reading")
            self.on_eof(pty)
            # communicate that the pty has died
            for ws in pty.clients:
                ws.on_pty_died()
        except Exception as e:
            self.log.error(f"Exception in pty_read: {e}")



            
    def pre_pty_read_hook(self, pty: PtyTerminal) -> None:
        """Hook before pty read, subclass can patch something into ptyTerminal when pty_read"""

    def client_disconnected(self, ws: Any) -> None:
        """Send terminal SIGHUP when client disconnects."""
        self.log.info("Websocket closed, sending SIGHUP to terminal.")
        if ws.terminal:
            if os.name == "nt":
                ws.terminal.kill()
                # Immediately call the pty reader to process
                # the eof and free up space
                self.pty_read(ws.terminal.ptyproc.fd)
                return
            asyncio.create_task(ws.terminal.terminate(force=True))


