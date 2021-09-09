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
    const isChinese = function (temp:string) {
        const re = new RegExp("[\\u4E00-\\u9FFF]+","g");
        if (re.test(temp)) {
            return true;
        };
        return false;
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
                            let oldText = text;
                            const spaceList = oldText.match(/(^\s+)|([^\s].+)/g);
                            let spaceText = '';
                            if (spaceList && spaceList.length > 1) {
                                spaceText = spaceList[0];
                                oldText = spaceList[1];
                            }
                            let annotate = "";
                            const textList = oldText.split(' ');
                            if (textList.length > 1 && isChinese(textList[0])) {
                                annotate += (" // " + textList[0]);
                                textList.shift();
                                oldText = textList.join('');
                            }
                            text = getStringArray(oldText).join('_');
                            text = spaceText + text.toUpperCase() + ': "' + oldText + '",' + annotate;
                            newText += (text + '\n');
                        });
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