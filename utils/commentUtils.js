const path = require('path');

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

module.exports = {
    isExcluded,
    containsKeyword,
};
