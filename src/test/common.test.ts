import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vm from "azure-devops-node-api";
import { getApi } from '../common';

suite("Common", function () {
	let stubs: sinon.SinonStub<any>[] = [];
	teardown(() => {
		sinon.restore();
		stubs.forEach(stub => stub.restore());
		stubs = [];
	});
	test("getApi should return an instance of the API interface", async () => {
		const patStub = sinon.stub(vm, 'getPersonalAccessTokenHandler');
		patStub.returns({} as any);
		stubs.push(patStub);

		const connectStub = sinon.stub(vm.WebApi.prototype, 'connect');
		connectStub.returns(Promise.resolve({}));
		stubs.push(connectStub);

		const api = await getApi('');

		assert.equal(true, api instanceof vm.WebApi);
		connectStub.calledAfter(patStub);
		assert.equal(true, patStub.calledOnce);
		assert.equal(true, connectStub.calledOnce);
	});
});

