// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {CommentInput} from './cinp';

// activation is done only once
export function activate(context: vscode.ExtensionContext) {

	console.log('Comment Input: Activated!');

	const cinp = new CommentInput();

	const update_trigger = vscode.commands.registerCommand('cinp.update', () => {
		cinp.update_configuration();
	});

	const run_cinp = vscode.commands.registerCommand('cinp.execute', () => {
		cinp.execute_code();
	});

	vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
		console.log("Comment Input: Detected Config Change.");
		if(e.affectsConfiguration("cinp.trigger") === true ||
			e.affectsConfiguration("cinp.language_extension_resources_folder") ||
			e.affectsConfiguration("cinp.input_delay")){
			cinp.update_configuration();
		}
	});

	context.subscriptions.push(run_cinp);
	context.subscriptions.push(update_trigger);
}

// this method is called when your extension is deactivated
export function deactivate() {}
