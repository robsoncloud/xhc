import codecs
import logging
import os
from collections import deque
import signal
from typing import Any
from tornado.ioloop import IOLoop
from ptyprocess import PtyProcessUnicode  # type:ignore[import-untyped]
import asyncio
from typing import TYPE_CHECKING, Any, Coroutine
#from xhc.websocket.connection import ConnectionManager

logging.basicConfig(level=logging.DEBUG)

def preexec_fn() -> None:
    """A prexec function to set up a signal handler."""
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)

class PtyTerminal:
    term_name: str
    
    def __init__(self, argv: Any, env: dict[str, str] | None = None, cwd: str | None = None):
        """Initialize the pty."""
        print("Initialize the pty.")
        self._logger = logging.getLogger(__name__)
        self.clients: dict[str, Any] = {}
        # Use read_buffer to store historical messages for reconnection
        self.read_buffer: deque[str] = deque([], maxlen=1000)
        kwargs = {"argv": argv, "env": env or [], "cwd": cwd}
        if preexec_fn is not None:
            kwargs["preexec_fn"] = preexec_fn
        self.ptyproc = PtyProcessUnicode.spawn(**kwargs)
        
        # The output might not be strictly UTF-8 encoded, so
        # we replace the inner decoder of PtyProcessUnicode
        # to allow non-strict decode.
        self.ptyproc.decoder = codecs.getincrementaldecoder("utf-8")(errors="replace")

    def kill(self, sig: int = signal.SIGTERM) -> None:
        """Send a signal to the process in the pty"""
        self.ptyproc.kill(sig)

    def killpg(self, sig: int = signal.SIGTERM) -> Any:
        """Send a signal to the process group of the process in the pty"""
        if os.name == "nt":
            return self.ptyproc.kill(sig)
        pgid = os.getpgid(self.ptyproc.pid)
        os.killpg(pgid, sig)
        return None

    async def terminate(self, force: bool = False) -> bool:
        """This forces a child process to terminate. It starts nicely with
        SIGHUP and SIGINT. If "force" is True then moves onto SIGKILL. This
        returns True if the child was terminated. This returns False if the
        child could not be terminated."""
        if os.name == "nt":
            signals = [signal.SIGINT, signal.SIGTERM]
        else:
            signals = [signal.SIGHUP, signal.SIGCONT, signal.SIGINT, signal.SIGTERM]

        _ = IOLoop.current()

        def sleep() -> Coroutine[Any, Any, None]:
            """Sleep to allow the terminal to exit gracefully."""
            return asyncio.sleep(self.ptyproc.delayafterterminate)

        if not self.ptyproc.isalive():
            self._logger.info(f"Process has terminated at first attempt")
            return True
        try:
            for sig in signals:
                self.kill(sig)
                await sleep()
                if not self.ptyproc.isalive():
                    return True
            if force:
                self.kill(signal.SIGKILL)
                await sleep()
                return bool(not self.ptyproc.isalive())
            return False
        except OSError:
            # I think there are kernel timing issues that sometimes cause
            # this to happen. I think isalive() reports True, but the
            # process is dead to the kernel.
            # Make one last attempt to see if the kernel is up to date.
            await sleep()
            self._logger.info(f"Process has not terminated")
            return bool(not self.ptyproc.isalive())



