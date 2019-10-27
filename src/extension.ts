// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const cats = {
	'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
	'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif'
  };

// This is going to manage the Timer we've set
let fontSize = 32;
class CountdownTimer {
	intervalId: NodeJS.Timeout | undefined;
	running: boolean;
	secondsRemaining: number;
	onTimerTick: Function;
	onCountdownFinished: Function;
	constructor(onCountownFinished: Function = () => {}, onTimerTick: Function = () => {}){
		this.intervalId = undefined;
		this.secondsRemaining = 0;
		this.onCountdownFinished = onCountownFinished;
		this.onTimerTick = onTimerTick;
		this.running = false;
	}
	start(){
		if(this.secondsRemaining <= 0 || this.running){
			return this;
		}
		this.running = true;
		this.intervalId = setInterval(() => {
			// Simple timer, might run into issues but we'll use this for now
			this.secondsRemaining = this.secondsRemaining - 1;
			this.onTimerTick(this.secondsRemaining);

			if(this.secondsRemaining <= 0){
				this.running = false;
				clearInterval(this.intervalId as NodeJS.Timeout);
				this.onCountdownFinished();
			}
		}, 1000);
		return this;
	}
	add(seconds: number){
		this.secondsRemaining += seconds;
	}
	set(seconds: number){
		this.secondsRemaining = seconds;
	}
	pause(){
		this.running = false;
		clearInterval(this.intervalId as NodeJS.Timeout);
	}	
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let currentPanel: vscode.WebviewPanel | undefined = undefined;
	// bigTimer.start
	const timer = new CountdownTimer(() => { console.log("done"); }, (seconds: number) => {
		if(currentPanel){
			currentPanel.webview.html = getWebContentTime(seconds);
		}
	});
	context.subscriptions.push(
		vscode.commands.registerCommand('bigTimer.start', () => {
			const columnToShowIn = vscode.window.activeTextEditor 
				? vscode.window.activeTextEditor.viewColumn
				: undefined;
			timer.start();

			if(currentPanel){
				currentPanel.reveal(columnToShowIn);
			} else {
				currentPanel = vscode.window.createWebviewPanel(
					'timerView',
					'Big Timer',
					columnToShowIn || vscode.ViewColumn.One,
					{}
				);
				
				currentPanel.webview.html = getWebContentTime(timer.secondsRemaining); // because the typecheck is dumb :(

				currentPanel.onDidDispose(
					() => {
						currentPanel = undefined;
					},
					null,
					context.subscriptions
				);
			}

			
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('bigTimer.setTimer', () => {
			const quickPick = vscode.window.createInputBox();
			quickPick.prompt = "Set the timer in minutes";
			quickPick.onDidHide(() => {
				quickPick.dispose();
			});
			quickPick.onDidAccept(() => {
				var minutes = parseInt(quickPick.value);
				if(minutes){
					timer.set(minutes * 60);
				}
				quickPick.hide();
				quickPick.dispose();
			});
			// quickPick.onDidChangeValue(value => {
			// 	textValue = value;
			// });
			quickPick.show();
		})
	);
	
}

function getWebviewContent(cat: keyof typeof cats){
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Cat Coding</title>
</head>
<body>
	<img src="${cats[cat]}" width="300" />
</body>
</html>
`;
}


function getWebContentTime(seconds: number){
	console.log(seconds);
	const remainingMinutes = seconds/60 | 0;
	const remainingSeconds = seconds - remainingMinutes * 60;
	const min = remainingMinutes < 10 ? "0" + remainingMinutes : remainingMinutes.toString();
	const sec = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds.toString();
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Cat Coding</title>
</head>
<body>
	<div style="font-size:${fontSize}px;">${min}:${sec}</div>
</body>
</html>
`;
}

// this method is called when your extension is deactivated
export function deactivate() {}
