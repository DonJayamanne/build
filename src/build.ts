// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { getProject, getWebApi } from './common';
import * as vm from 'azure-devops-node-api';
import * as ba from 'azure-devops-node-api/BuildApi';
import * as bi from 'azure-devops-node-api/interfaces/BuildInterfaces';

export async function getBuildDefinitions(): Promise<bi.DefinitionReference[]> {
	const vsts: vm.WebApi = await getWebApi();
	const vstsBuild: ba.IBuildApi = await vsts.getBuildApi();
	const project = getProject();

	return vstsBuild.getDefinitions(project);
}
export async function getReport(build: bi.Build): Promise<string> {
	const vsts: vm.WebApi = await getWebApi();
	const vstsBuild: ba.IBuildApi = await vsts.getBuildApi();
	const project = getProject();
	const report = await vstsBuild.getBuildReportHtmlContent(project, build.id!);
	return new Promise((resolve, reject) => {
		try {
			let data = '';
			report.setEncoding('utf8');
			report.on('data', chunk => {
				data += `${chunk}`;
			}); report.on('end', () => {
				resolve(data);
			});
			report.resume();
		} catch (ex) {
			reject(ex);
		}
	});
}
export async function getBuildChange(build: bi.Build): Promise<bi.Change | undefined> {
	const vsts: vm.WebApi = await getWebApi();
	const vstsBuild: ba.IBuildApi = await vsts.getBuildApi();
	const project = getProject();
	const changes = await vstsBuild.getBuildChanges(project, build.id!, undefined, 1);
	return changes.length === 0 ? undefined : changes[0];
}
export async function getBuilds(definition: bi.DefinitionReference, maxBuildsPerDefinition = 10) {
	const vsts: vm.WebApi = await getWebApi();
	const vstsBuild: ba.IBuildApi = await vsts.getBuildApi();

	const project = getProject();

	return vstsBuild.getBuilds(
		project,
		[definition.id!],           // definitions: number[]
		undefined,                  // queues: number[]
		undefined,                  // buildNumber
		undefined,                     //new Date(2016, 1, 1),       // minFinishTime
		undefined,                  // maxFinishTime
		undefined,                  // requestedFor: string
		bi.BuildReason.All,         // reason
		bi.BuildStatus.All,
		undefined,
		undefined,                  // tagFilters: string[]
		undefined,                  // properties: string[]
		maxBuildsPerDefinition      // top: number
	);
}


