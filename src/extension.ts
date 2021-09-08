import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    const getStringArray = function (text: string) {
        const str = [];
        let lastPos = 0,
            i;

        for (i = 0; i < text.length; i++) {
            if (/[\s\-:,_A-Z]/.test(text.charAt(i))) {
                const s = text.substring(lastPos, i).replace(/[\s\-:,_]/, "");
                if (s.length > 0) {
                    str.push(s.toLowerCase());
                }
                lastPos = i;
            }
        }

        if (lastPos < text.length) {
            const s = text.substring(lastPos, i).replace(/[\s\-:,_]/, "");
            if (s.length > 0) {
                str.push(s.toLowerCase());
            }
        }

        return str;
    };
    const constantInObject = vscode.commands.registerCommand("extension.constantInObject", function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            if (!editor.selections || editor.selections.length === 0) {
                vscode.window.showInformationMessage("There is no selected text!");
                return;
            }

            editor.edit(function (edit) {
                for (let i = 0; i < editor.selections.length; i++) {
                    const selection = editor.selections[i];

                    if (!selection.isEmpty) {
                        const range = new vscode.Range(selection.start, selection.end);
                        const defaultTexts = editor.document.getText(range);
                        let newText = "";
                        defaultTexts.split('\n').map(text => {
                            const oldText = text;
                            text = getStringArray(text).join('_');
                            text = text.toUpperCase() + ': "' + oldText + '",';
                            newText += (text + '\n');
                        });
                        vscode.window.showInformationMessage(newText);
                        edit.replace(range, newText);
                    }
                }
            });
        } else {
            vscode.window.showInformationMessage("There is no activeTextEditor!");
        }
    });
    context.subscriptions.push(constantInObject);
}

export function deactivate() {}