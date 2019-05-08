// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import * as vm from "azure-devops-node-api";

export async function getWebApi(serverUrl: string = 'https://vssps.dev.azure.com/ms'): Promise<vm.WebApi> {
	serverUrl = process.env.API_URL || serverUrl;
	return await getApi(serverUrl);
}

export async function getApi(serverUrl: string): Promise<vm.WebApi> {
	// Get a token - https://docs.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/pats?view=azure-devops
	const token = process.env.AZURE_API_TOKEN!;
	const authHandler = vm.getPersonalAccessTokenHandler(token);

	const vsts: vm.WebApi = new vm.WebApi(serverUrl, authHandler);
	await vsts.connect();
	return vsts;
}

export function getProject(): string {
	return 'vscode-python';
}
