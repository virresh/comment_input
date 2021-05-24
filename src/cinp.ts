"use strict";
import * as vscode from "vscode";
import * as fs from 'fs';
import { EOL } from 'os';

export class CommentInput {
    private DEFAULT_TRIGGER: string = "input";
    private DEFAULT_DELAY: number = 500; // in milliseconds
    private DEFAULT_LANG_CONFIG_PATH = undefined;

    private _inputcregex: string = "input";
    private _inputdelay: number = 500;
    private _language_configuration_path: string | undefined = undefined;

    constructor() {
        this.update_configuration();
    }

    public update_configuration() {
        let config = vscode.workspace.getConfiguration("cinp");
        this.set_input_regex(config.get("trigger"));
        this.set_language_configuration_path(config.get("language_extension_resources_folder"));
        this.set_input_delay(config.get("input_delay"));
    }

    public async execute_code() {
        // for flushing any previous input
        let terms_orig = vscode.window.terminals;
        terms_orig.forEach(element => {
            if (element.name === "Code") {
                element.sendText(EOL, false);
            }
        });

        let success = vscode.commands.executeCommand("code-runner.run");
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
        let ext: string = "";
        let custominput: string = "";
        let trigger: string = this._inputcregex;
        if (this._language_configuration_path) {
            if (fs.existsSync(this._language_configuration_path)) {
                var config_folder_prefix = this._language_configuration_path;
                if(!config_folder_prefix.endsWith("/")) {
                    config_folder_prefix = config_folder_prefix + '/';
                }
                ext = fs.readFileSync(config_folder_prefix + editor.document.languageId + "/" + "language-configuration.json", "utf-8");
            }
            else {
                vscode.window.showErrorMessage("Language config folder provided doesn't exist. Cannot determine comment format, not sending anything.");
                return;
            }
        }
        else if (fs.existsSync("/usr/share/code/resources/app/extensions")) {
            ext = fs.readFileSync("/usr/share/code/resources/app/extensions/" + editor.document.languageId + "/" + "language-configuration.json", "utf8");
        } else if (fs.existsSync("C:///Program Files (x86)/Microsoft VS Code/resources/app/extensions")) {
            ext = fs.readFileSync("C:///Program Files (x86)/Microsoft VS Code/resources/app/extensions/" + editor.document.languageId + "/" + "language-configuration.json", "utf8");
        } else {
            ext = fs.readFileSync("C:///Program Files/Microsoft VS Code/resources/app/extensions/" + editor.document.languageId + "/" + "language-configuration.json", "utf8");
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
                setTimeout(() => {
                    if (element.exitStatus === undefined) {
                        // check if exitStatus is set or not
                        // if it's set, then no use of sending input. The compilation must've failed
                        element.sendText(custominput, true);
                    }
                }, this._inputdelay);
            }
        });
    };

    private set_input_regex(inputstr: string | undefined) {
        console.log("Comment Input: Updating trigger to " + inputstr);
        if(inputstr !== undefined){
            this._inputcregex = inputstr;
        } else {
            this._inputcregex = this.DEFAULT_TRIGGER;
        }
    };

    private set_language_configuration_path(configpath: string | undefined) {
        console.log("Comment Input: Updating language config path to " + configpath);
        if(configpath !== undefined){
            this._language_configuration_path = configpath;
        } else {
            this._language_configuration_path = this.DEFAULT_LANG_CONFIG_PATH;
        }
    };

    private set_input_delay(input_delay: number | undefined) {
        console.log("Comment Input: Updating delay to " + input_delay);
        if(input_delay !== undefined){
            this._inputdelay = input_delay;
        } else {
            this._inputdelay = this.DEFAULT_DELAY;
        }
    };

}