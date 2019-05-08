// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import * as vscode from 'vscode';
import * as azdev from 'azure-devops-node-api';
import { getReport } from './build';
import { BuildTreeProvider } from './treeProvider';
import { Build } from 'azure-devops-node-api/interfaces/BuildInterfaces';

export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel | undefined;
	context.subscriptions.push(vscode.commands.registerCommand('extension.showBuildReport', async (build: Build) => {
		panel = panel || vscode.window.createWebviewPanel(
			'buildReport',
			'Build Report',
			vscode.ViewColumn.Beside,
			{}
		);
		panel.onDidDispose(() => {
			panel = undefined;
		});
		panel.webview.html = `<!DOCTYPE html>
	<html>
	<head>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
	.loader {
	  border: 16px solid #f3f3f3;
	  border-radius: 50%;
	  border-top: 16px solid #3498db;
	  width: 50px;
	  height: 50px;
	  -webkit-animation: spin 2s linear infinite; /* Safari */
	  animation: spin 2s linear infinite;
	}

	/* Safari */
	@-webkit-keyframes spin {
	  0% { -webkit-transform: rotate(0deg); }
	  100% { -webkit-transform: rotate(360deg); }
	}

	@keyframes spin {
	  0% { transform: rotate(0deg); }
	  100% { transform: rotate(360deg); }
	}
	</style>
	</head>
	<body>
	<div class="loader"></div>
	</body>
	</html>
	`;

		const html = await getReport(build);
		panel.webview.html = html;
	}));

	const treeDataProvider = new BuildTreeProvider();
	const treeView = vscode.window.createTreeView('buildExplorer', { treeDataProvider });
	context.subscriptions.push(treeView);
	context.subscriptions.push(vscode.commands.registerCommand('extension.refreshBuilds', treeDataProvider.refresh, treeDataProvider));
}

// this method is called when your extension is deactivated
export function deactivate() { }


