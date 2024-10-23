// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { searchCommentsInDirectory } = require('./commentFinder');

// TODO: TEST1
// FIXME: TEST2
// Check this out: TEST3


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
        console.log("WORKinitialized")
        if (api.repositories.length > 0) {
          api.repositories[0].onDidChangeRepository(() => {
            console.log("Repository changed");
          });
    
          api.repositories[0].onDidCommit(() => {
            console.log("committed");
          });
        } else {
          console.warn("No repositories available yet");
        }
      }
    })
    console.log("TEST", api);
    

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