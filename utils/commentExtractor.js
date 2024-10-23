const fs = require('fs');
const readline = require('readline'); // Required for reading files line by line
const { containsKeyword } = require('./commentUtils');

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

module.exports = {
    extractCommentsFromFile
};
