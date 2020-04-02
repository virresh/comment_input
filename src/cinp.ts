"use strict";
import * as vscode from "vscode";
import * as fs from 'fs';
import { EOL } from 'os';

export class CommentInput {
    private _inputcregex: string = "input";

    constructor() {
        this.update_configuration();
    }

    public update_configuration() {
        let config = vscode.workspace.getConfiguration("cinp");
        this.set_input_regex(config.get("trigger"));
    }

    public async execute_code() {
        // for flushing any previous input
        let terms_orig = vscode.window.terminals;
        terms_orig.forEach(element => {
            if (element.name === "Code") {
                element.sendText(EOL, false);
            }
        });

        let success = await vscode.commands.executeCommand("code-runner.run");
        if (success !== undefined) {
            console.error(success);
        }

        // fetch language configuration
        let editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }

        // need a hack until 
        // https://github.com/microsoft/vscode/issues/2871
        // is solved
        let ext: string;
        let custominput: string = "";
        let trigger: string = this._inputcregex;
        if (fs.existsSync("/usr/share/code/resources/app/extensions")) {
            ext = fs.readFileSync("/usr/share/code/resources/app/extensions/" + editor.document.languageId + "/" + "language-configuration.json", "utf8");
        } else {
            ext = fs.readFileSync("C:///Program Files (x86)/Microsoft VS Code/resources/app/extensions" + editor.document.languageId + "/" + "language-configuration.json", "utf8");
        }

        try {
            let description = JSON.parse(ext);
            let multline = description['comments']['blockComment'];
            let regexstr = multline[0].replace('\*', '\\\*') + trigger + "\\s?([\\s\\S]*?\\s?)" + multline[1].replace('\*', '\\\*');
            let source_text = editor.document.getText();
            // console.log(regexstr);
            // console.log(source_text);
            let stdinstr = source_text.match(regexstr);
            if (stdinstr !== null) {
                custominput = stdinstr[stdinstr?.length - 1];
                // console.log(stdinstr[1]);
            }
        } catch (error) {
            console.error(error);
            return;
        }

        if (custominput.length === 0) {
            console.log("Comment Input: No input comment detected!");
            return;
        }

        // send input
        let terms = vscode.window.terminals;
        terms.forEach(element => {
            if (element.name === "Code") {
                element.sendText(custominput, true);
            }
        });
    };

    private set_input_regex(inputstr: string | undefined) {
        console.log("Comment Input: Updating trigger to " + inputstr);
        if(inputstr !== undefined){
            this._inputcregex = inputstr;
        }
    };
}