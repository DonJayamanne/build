// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DefinitionReference, BuildReference, BuildResult, BuildStatus, Build } from 'azure-devops-node-api/interfaces/BuildInterfaces';
import { getBuildDefinitions, getBuilds, getBuildChange } from './build';
import { ExtensionDir } from './constants';

type DataType = DefinitionReference | Build;
const resultIconMapping: Map<BuildResult, string> = new Map<BuildResult, string>([
	[BuildResult.None, 'unknown.svg'],
	[BuildResult.Succeeded, 'passed.svg'],
	[BuildResult.Failed, 'error.svg'],
	[BuildResult.PartiallySucceeded, 'passed.svg'],
	[BuildResult.Canceled, 'stop.svg']
]);
abstract class BaseNode<T extends DataType> extends vscode.TreeItem {
	constructor(
		label: string,
		public readonly data: T,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}
}

export class BuildDefinitionNode extends BaseNode<DefinitionReference> {
	constructor(
		definition: DefinitionReference
	) {
		super(definition.name!, definition, vscode.TreeItemCollapsibleState.Collapsed);
	}


	iconPath = {
		light: path.join(ExtensionDir, 'assets', 'light', 'definition.svg'),
		dark: path.join(ExtensionDir, 'assets', 'dark', 'definition.svg')
	};

	tooltip = `${this.label}
${this.data.url!}`;
	description = '';
	contextValue = 'definition';
}

export class BuildNode extends BaseNode<BuildReference> {
	constructor(
		label: string,
		description: string,
		build: BuildReference
	) {
		super(label, build, vscode.TreeItemCollapsibleState.None,
			{ command: 'extension.showBuildReport', arguments: [build], title: 'View Build Report' });
		this.description = description;
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	public get iconPath() {
		let iconName = 'unknown.svg';
		if (this.data.result) {
			iconName = resultIconMapping.get(this.data.result)!;
		} else if (this.data.status === BuildStatus.InProgress) {
			iconName = 'busy.svg';
		}

		return {
			light: path.join(ExtensionDir, 'assets', 'light', iconName),
			dark: path.join(ExtensionDir, 'assets', 'dark', iconName)
		};
	}

	contextValue = 'build';

}

export async function getBuildNodeTreeItem(build: Build): Promise<BuildNode> {
	if (build.triggerInfo && build.triggerInfo['pr.title']) {
		const pr = build.triggerInfo['pr.title'];
		return new BuildNode(pr, build.triggerInfo['pr.number'], build);
	}
	const change = await getBuildChange(build);
	if (change) {
		return new BuildNode(change.message!, '', build);
	}
	return new BuildNode(build.buildNumber ? build.buildNumber.toString() : build.buildNumber!.toString(), '', build);
}
export class BuildTreeProvider implements vscode.TreeDataProvider<DataType> {
	private _onDidChangeTreeData = new vscode.EventEmitter<DataType | undefined>();
	public readonly onDidChangeTreeData: vscode.Event<DataType | undefined>;
	constructor() {
		this.onDidChangeTreeData = this._onDidChangeTreeData.event;
	}
	public refresh() {
		this._onDidChangeTreeData.fire();
	}
	public async getChildren(element?: DataType): Promise<DataType[]> {
		if (!element) {
			return getBuildDefinitions();
		}
		return getBuilds((element as BuildReference));
	}
	public async getTreeItem(element: DataType): Promise<vscode.TreeItem> {
		const build = (element as BuildReference);
		if (build.buildNumber) {
			return getBuildNodeTreeItem(build);
		} else {
			return new BuildDefinitionNode(element);
		}
	}
}


