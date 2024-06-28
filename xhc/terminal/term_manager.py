




from xhc.terminal.term import PtyTerminal
from xhc.terminal.term_manager_base import TermManagerBase


class TermManager(TermManagerBase):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.terminals: dict[str, PtyTerminal] = {}

    async def get_terminal(self, term_name: str) -> PtyTerminal:
        """Get or create a new terminal by name."""
        assert term_name is not None

        # verify if term alredy exists
        if term_name in self.terminals:
            return self.terminals[term_name]

        # create a new term with the specified name
        self.log.info("New terminal with specified name: %s", term_name)
        term =  self.new_terminal()
        self.terminals[term_name] = term
        term.term_name = term_name
        self.start_reading(term)
        return term
    
    def on_eof(self, pyt: PtyTerminal) -> None:
        """Handle end of file for a pty with clients."""
        super().on_eof(pyt)
        name = pyt.term_name
        self.log.info("Terminal %s closed", name)
        assert name is not None
        self.terminals.pop(name, None)       
        