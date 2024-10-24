// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const readline = require('readline'); // Required for reading files line by line

/**
 * Recursively search for comments in all files within a directory
 * @param {string} dirPath The directory to search in
 * @param {object} outputChannel The output channel to log comments
 */
function searchCommentsInDirectory(dirPath, outputChannel) {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            outputChannel.appendLine(`Error reading directory: ${dirPath}`);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(dirPath, file);

            // Check if the file or directory is in the excluded list
            if (isExcluded(file)) {
                outputChannel.appendLine(`Skipping excluded path: ${filePath}`);
                return;
            }

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    outputChannel.appendLine(`Error getting stats for file: ${filePath}`);
                    return;
                }

                // If it's a directory, recurse into it
                if (stats.isDirectory()) {
                    searchCommentsInDirectory(filePath, outputChannel);
                } else if (stats.isFile()) {
                    // Process the file to extract comments
                    extractCommentsFromFile(filePath, outputChannel); // Call the imported function
                }
            });
        });
    });
}

/**
 * Extract comments from a file and log them to the output channel if they match keywordChecks
 * @param {string} filePath The path of the file
 * @param {object} outputChannel The output channel to log comments
 */
function extractCommentsFromFile(filePath, outputChannel) {
    const readStream = fs.createReadStream(filePath, 'utf8');
    const lineReader = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity // Recognize all instances of CR LF as a single line break
    });

    let lineNumber = 0; // Initialize line number

    lineReader.on('line', (line) => {
        lineNumber++; // Increment line number

        // Regular expressions to match single-line (//) and multi-line (/* */) comments
        const singleLineCommentRegex = /\/\/(.*)/; // For single-line comments
        const multiLineCommentRegex = /\/\*[\s\S]*?\*\//g; // For multi-line comments

        // Check for single-line comments
        const singleLineMatch = line.match(singleLineCommentRegex);
        if (singleLineMatch) {
            const comment = singleLineMatch[1].trim(); // Get the comment text after "//"
            if (containsKeyword(comment)) {
                const link = `${filePath}:${lineNumber}`;
                outputChannel.appendLine(`${link} - ${comment} on line ${lineNumber}`);
            }
        }

        // Check for multi-line comments (can be at the start of the line)
        const multiLineMatches = line.match(multiLineCommentRegex);
        if (multiLineMatches) {
            multiLineMatches.forEach(comment => {
                const trimmedComment = comment.replace(/\/\*|\*\//g, '').trim(); // Remove /* and */ from the comment
                if (containsKeyword(trimmedComment)) {
                    const link = `${filePath}:${lineNumber}`;
                    outputChannel.appendLine(`${link} - ${trimmedComment} on line ${lineNumber}`);
                }
            });
        }
    });

    // lineReader.on('close', () => {
    //     // Finished processing the file
    //     outputChannel.appendLine(`Finished reading file: ${filePath}`);
    // });
}

// List of files and directories to exclude from searching
const excludedPaths = ['node_modules', '.gitignore', '.vscodeignore', '.git', '.vscode', 'build', '.json', '.md'];

// List of keywords/phrases to check in comments (You can add more)
const keywordChecks = ['TODO', 'Check this out', 'FIXME'];

/**
 * Check if a file or directory should be excluded from the search
 * @param {string} filePath The name of the file or directory
 * @returns {boolean} True if the file/directory is excluded, false otherwise
 */
function isExcluded(filePath) {
    const basePath = path.basename(filePath);
    return excludedPaths.some(excludedPath => basePath.includes(excludedPath));
    // return excludedPaths.includes(fileName);
}

/**
 * Check if a comment starts with any of the specified keywords
 * @param {string} comment The comment to check
 * @returns {boolean} True if the comment contains any keyword, false otherwise
 */
function containsKeyword(comment) {
    return keywordChecks.some(keyword => comment.includes(keyword));
}

// TODO: TEST1
// FIXME: TEST2
// Check this out: TEST3
// TEST: TEST4


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	  const outputChannel = vscode.window.createOutputChannel('Comments Finder Channel');
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    
    const api = gitExtension?.getAPI(1);
    api?.onDidChangeState((e) => {
      if (api.state == "initialized") {
        console.log("SUPERB", api.repositories[1]);
        console.log("HYPER", api.repositories);
        if (api.repositories.length > 0) {
          api.repositories[1].onDidChangeRepository(() => {
            console.log("Repository changed");
          });
    
          api.repositories[1].onDidCommit(() => {
            console.log("committed");
          });
        } else {
          console.warn("No repositories available yet");
        }
      }
    })    

    let disposable = vscode.commands.registerCommand('TODO.helloWorld', function () {
        // Show the output channel and append "Hello World" to it
		const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open.');
            return;
        }

		const rootPath = workspaceFolders[0].uri.fsPath;

		outputChannel.clear();
        outputChannel.show();
        outputChannel.appendLine('Searching for comments in project... ');

		searchCommentsInDirectory(rootPath, outputChannel);
    });

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}