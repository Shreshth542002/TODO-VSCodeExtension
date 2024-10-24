const fs = require('fs');
const path = require('path');
const { extractCommentsFromFile } = require('./commentExtractor'); // Import the new module
const { isExcluded } = require('./commentUtils');

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

module.exports = {
    searchCommentsInDirectory
};
