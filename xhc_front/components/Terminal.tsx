"use client"
import dynamic from 'next/dynamic';
import { useSocketSubscribe } from "@/app/admin/_common/useSocketSubscribe";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";

import { Terminal } from "@xterm/xterm"
import "xterm/css/xterm.css";

function redXtermText(text: string): string {
    return "\x1b[1;31m" + text + "\x1b[0m";
}

const XTerminal = ({ id }: { id: string }) => {
    const termRef = useRef(null);
    const term = useRef<Terminal | null>(null); // useRef para o terminal

    const handleMessage = useCallback((message: string) => {
        const data = JSON.parse(message);

        if (!term.current) return;
        switch (data.type) {
            case "connecting":
                term.current.writeln(data.payload);
                term.current.clear();
                break;
            case "connected":
                term.current.writeln(`Connection established with ${id} 🔒.`);
                term.current.writeln("");
                break;
            case "stdout":
                term.current.write(data.payload);
                break;
            case "disconnected":
                term.current.writeln(redXtermText("Terminal session has ended"));
                term.current.writeln("");
                break;
            case "error":
                term.current.writeln(redXtermText(data.payload));
                break;
            default:
                break;
        }
    }, [id]);

    const sendMessage = useSocketSubscribe(id, handleMessage);

    useEffect(() => {
        if (!term.current) {
            term.current = new Terminal({
                rows: 25,
                cols: 80,
                fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                fontSize: 14,
                theme: {
                    background: "#262626",
                },
                cursorBlink: true
            });

            if (termRef.current) {
                term.current.open(termRef.current);
                term.current.focus();
            }
        }

        return () => {
            if (term.current) {
                term.current.dispose();
            }
        };
    }, []);

    useEffect(() => {
        if (!term.current) return;

        let cursor = 0;
        let commandBuffer = "";

        term.current.onKey(({ key, domEvent }) => {
            const code = key.charCodeAt(0);

            if (code === 27) {
                switch (key.substring(1)) {
                    case '[C':
                        if (cursor < commandBuffer.length) {
                            cursor += 1;
                            term.current.write(key);
                        }
                        break;
                    case '[D':
                        if (cursor > 0 && commandBuffer.length > 0) {
                            cursor -= 1;
                            term.current.write(key);
                        }
                        break;
                }
            } else if (domEvent.key === 'Enter') {
                
                    if (commandBuffer === 'clear') {
                        commandBuffer = '';
                        term.current.clear();
                    } else {

                        const data = {
                            type: "stdin",
                            payload: commandBuffer
                        };

                        sendMessage(JSON.stringify(data));

                    }

                    term.current.write('\r\n');
                    
                    commandBuffer = '';
                    cursor = 0;
                
            } else if (domEvent.key === 'Backspace') {
                if (cursor > 0 && commandBuffer.length > 0) {
                    commandBuffer = commandBuffer.slice(0, -1);
                    term.current.write('\b \b');
                    cursor -= 1;
                }
            } else {
                commandBuffer = commandBuffer.substring(0, cursor) + key + commandBuffer.substring(cursor);
                cursor += 1;
                term.current.write(key);
            }
        });

        term.current.attachCustomKeyEventHandler((arg) => {
            if (arg.ctrlKey && arg.code == "KeyV" && arg.type === "keydown") {
                navigator.clipboard.readText().then((text) => {
                    if (term.current != null) {
                        term.current.write(text);
                        commandBuffer += text;
                    }
                });
            }

            if (arg.ctrlKey && arg.code == "KeyC" && arg.type === "keydown") {
                const selection = term.current.getSelection();
                if (selection) {
                    const clipboardItem = new ClipboardItem({
                        "text/plain": new Blob([selection], { type: "text/plain" })
                    });

                    navigator.clipboard.write([clipboardItem]);
                }
            }

            return true;
        });

    }, [sendMessage]);

    return (
        <div ref={termRef} style={{ height: '100%', width: '100%' }}></div>
    );
}

export default XTerminal;
