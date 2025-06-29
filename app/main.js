const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * Resolves the full path to an executable by searching through directories listed in the PATH environment variable.
 * Returns the full path only if the file exists and is executable.
 *
 * @param {string} cmd - The command name (e.g., 'ls', 'git')
 * @returns {string|undefined} - The resolved full path to the executable, or undefined if not found.
 */
function getExecutableCommandPath(cmd) {
  const pathDirs = process.env.PATH?.split(":") ?? [];

  for (const dir of pathDirs) {
    const fullPath = path.join(dir, cmd);

    try {
      const stats = fs.statSync(fullPath);

      if (
        stats.isFile() &&
        fs.accessSync(fullPath, fs.constants.X_OK) === undefined
      ) {
        return fullPath;
      }
    } catch (err) {
      continue; // Skip invalid or inaccessible paths
    }
  }
  return undefined;
}

/**
 * Built-in shell commands and their handlers.
 * Each handler receives an array of arguments.
 */
const builtins = Object.freeze({
  echo: (args) => console.log(args.join(" ")),
  exit: () => {
    process.exit(0);
  },
  type: (args) => {
    const cmd = args?.[0];
    if (!cmd) return console.log("type: missing argument");

    // 1. Check if it's a shell builtin
    if (Object.keys(builtins).includes(cmd)) {
      console.log(`${cmd} is a shell builtin`);
      return;
    }

    // 2. Get path of non builtin
    const execCmdPath = getExecutableCommandPath(cmd);
    if (execCmdPath) {
      console.log(`${cmd} is ${execCmdPath}`);
    } else {
      console.log(`${cmd}: not found`);
    }
  },
});

/**
 * Parses a line entered by the user into a command and its arguments.
 *
 * @param {string} line - The raw input line from the shell prompt.
 * @returns {{ command: string, args: string[] }} - Parsed command and arguments.
 */
function parseCommand(line) {
  const trimmed = line.trim();
  const [command, ...args] = trimmed.split(/\s+/); //  split it by one or more whitespace characters
  return { command, args };
}

/**
 * Executes a built-in or external command.
 * External commands are executed using the OS's PATH resolution.
 *
 * @param {string} line - The full input line.
 * @param {readline.Interface} rl - The readline interface for prompting.
 */
function executeCommand(line, rl) {
  const { command, args } = parseCommand(line);

  if (!command) return;

  if (builtins[command]) {
    builtins[command](args);
    rl.prompt();
  } else {
    // Try to execute the command using the OS it will auto resolve via PATH
    const childProcess = spawn(command, args, {
      stdio: "inherit",
    });

    childProcess.on("error", (err) => {
      console.log(`${command}: command not found`);
      rl.prompt(); // if there is error still we prompt after it for next input
    });

    childProcess.on("exit", () => {
      rl.prompt(); // prompt only after command ends
    });
  }
}

/**
 * Initializes the shell:
 * - Sets up readline interface
 * - Starts the REPL loop
 * - Delegates command handling to executeCommand()
 */
function startShell() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "$ ",
  });

  rl.prompt();

  rl.on("line", (line) => {
    try {
      executeCommand(line, rl);
    } catch (err) {
      console.error("Error:", err.message);
      rl.prompt();
    }
  });
}

startShell();
