# Simple JavaScript Shell 🐚

A basic command-line shell implemented in Node.js, built as part of the Codecrafters Shell Challenge. It supports executing built-in commands as well as external programs via the system's `PATH`.

## Features

✅ Supports built-in commands:
- `echo` – prints messages
- `type` – checks if a command is built-in or external
- `exit` – exits the shell

✅ Executes external commands using `spawn()`

✅ Uses system `PATH` to locate executables

✅ Handles errors gracefully

## Example Usage

```bash
$ echo hello world
hello world

$ type echo
echo is a shell builtin

$ type ls
ls is /bin/ls

$ ls
<prints directory contents>

$ exit
