import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { IDataObject, INodeProperties } from 'n8n-workflow';

import { BrevoFullApi } from '../credentials/BrevoFullApi.credentials';
import { BrevoFull } from '../nodes/Brevo/BrevoFull.node.ts';
import { BrevoFullTrigger } from '../nodes/Brevo/BrevoFullTrigger.node.ts';
import { CUSTOM_RESOURCE } from '../nodes/Brevo/descriptions';
import { resolveUrl } from '../nodes/Brevo/GenericFunctions';
import { operations, resources } from '../nodes/Brevo/operations.generated';
import { createExecuteMock, sampleValue } from './helpers';

const node = new BrevoFull();
const props = node.description.properties;

function visibleFor(resource: string, operation: string): INodeProperties[] {
	return props.filter((p) => {
		const show = p.displayOptions?.show;
		if (!show) return p.name === 'options';
		const r = show.resource as string[] | undefined;
		const o = show.operation as string[] | undefined;
		return (!r || r.includes(resource)) && (!o || o.includes(operation)) && !show.customMethod;
	});
}

async function run(params: IDataObject, opts: Parameters<typeof createExecuteMock>[1] = {}) {
	const { ctx, requests } = createExecuteMock(params, opts);
	const out = await node.execute.call(ctx as never);
	return { out: out[0], requests };
}

describe('description', () => {
	it('exposes every generated operation', () => {
		assert.ok(operations.length >= 290, `only ${operations.length} operations`);
		for (const r of resources) {
			const opProp = props.find((p) => p.name === 'operation' && (p.displayOptions?.show?.resource as string[])[0] === r.value);
			assert.ok(opProp, `no operation selector for ${r.value}`);
			const values = (opProp!.options as Array<{ value: string }>).map((o) => o.value);
			for (const op of operations.filter((o) => o.resource === r.value)) assert.ok(values.includes(op.operation));
			assert.equal(new Set(values).size, values.length, `duplicate operations in ${r.value}`);
		}
	});

	it('uses safe parameter names and consistent types for shared names', () => {
		const types = new Map<string, Set<string>>();
		for (const p of props) {
			assert.match(p.name, /^[A-Za-z_][A-Za-z0-9_]*$/, `bad name ${p.name}`);
			if (p.type === 'collection' || p.type === 'notice' || p.name === 'operation') continue;
			const sig = `${p.type}|${JSON.stringify(p.options ?? [])}`;
			if (!types.has(p.name)) types.set(p.name, new Set());
			types.get(p.name)!.add(sig);
		}
		for (const [name, sigs] of types) assert.equal(sigs.size, 1, `${name} has conflicting definitions`);
	});
});

describe('every operation builds a valid request', () => {
	for (const op of operations) {
		it(`${op.resource}.${op.operation}`, async () => {
			const params: IDataObject = { resource: op.resource, operation: op.operation };
			for (const p of visibleFor(op.resource, op.operation)) {
				if (p.name === 'resource' || p.name === 'operation' || p.type === 'notice') continue;
				if (p.name === 'options' || p.name === 'returnAll') continue;
				if (p.type === 'collection') {
					const c: IDataObject = {};
					for (const o of p.options as INodeProperties[]) c[o.name] = sampleValue(o);
					params[p.name] = c;
				} else params[p.name] = sampleValue(p);
			}
			const binary = { data: { data: Buffer.from('hello').toString('base64'), fileName: 'a.csv', mimeType: 'text/csv' } };
			const { requests } = await run(params, { binary });
			assert.equal(requests.length, 1);
			const req = requests[0];
			assert.equal(req.method, op.method);
			assert.ok(!/[{}]/.test(req.url.split('?')[0]), `unfilled path ${req.url}`);
			assert.ok(req.url.startsWith('https://api.brevo.com/'), req.url);
			if (op.path.includes('{')) assert.ok(req.url.includes('val%2Fue') || req.url.includes('/7'), req.url);

			if (op.bodyMode === 'json') {
				const body = JSON.parse(req.body as string);
				for (const p of op.params.filter((x) => x.in === 'body')) assert.ok(p.wire in body, `missing body field ${p.wire}`);
				assert.equal(req.headers['Content-Type'], 'application/json');
			} else if (op.bodyMode === 'multipart') {
				const text = (req.body as Buffer).toString('utf8');
				assert.match(String(req.headers['Content-Type']), /^multipart\/form-data; boundary=/);
				for (const p of op.params) assert.ok(text.includes(`name="${p.wire}"`), `missing part ${p.wire}`);
				assert.ok(text.includes('hello'));
			} else if (op.bodyMode === 'none') {
				assert.equal(req.body, undefined);
			}
			for (const p of op.params.filter((x) => x.in === 'query')) {
				assert.ok(req.url.includes(`${encodeURIComponent(p.wire)}=`), `missing query ${p.wire} in ${req.url}`);
			}
		});
	}
});

describe('specific behaviours', () => {
	it('serialises array query params as repeated keys', async () => {
		const { requests } = await run({
			resource: 'contacts',
			operation: 'getContacts',
			queryParameters: { listIds: '1, 2', limit: 10 },
		});
		assert.equal(requests[0].url, 'https://api.brevo.com/v3/contacts?limit=10&listIds=1&listIds=2');
	});

	it('serialises comma-style query params', async () => {
		const { requests } = await run({
			resource: 'transactionalEmails',
			operation: 'getTransacBlockedContacts',
			queryParameters: { senders: 'a@x.com,b@x.com' },
		});
		assert.ok(requests[0].url.endsWith('senders=a%40x.com%2Cb%40x.com'), requests[0].url);
	});

	it('sends a transactional email with typed body', async () => {
		const { requests, out } = await run(
			{
				resource: 'transactionalEmails',
				operation: 'sendTransacEmail',
				bodyFields: {
					to: '[{"email":"a@b.com","name":"A"}]',
					templateId: 12,
					params: '{"name":"Mario"}',
					tags: 'x, y',
				},
				options: { extraBody: '{"headers":{"X-Test":"1"}}' },
			},
			{ responses: [{ statusCode: 201, body: { messageId: '<abc>' } }] },
		);
		assert.equal(requests[0].url, 'https://api.brevo.com/v3/smtp/email');
		assert.deepEqual(JSON.parse(requests[0].body as string), {
			to: [{ email: 'a@b.com', name: 'A' }],
			templateId: 12,
			params: { name: 'Mario' },
			tags: ['x', 'y'],
			headers: { 'X-Test': '1' },
		});
		assert.deepEqual(out[0].json, { messageId: '<abc>' });
	});

	it('sends a raw root body (add contacts to list)', async () => {
		const { requests } = await run({
			resource: 'contacts',
			operation: 'addContactToList',
			listId: 5,
			body: '{"emails":["a@b.com"]}',
		});
		assert.equal(requests[0].url, 'https://api.brevo.com/v3/contacts/lists/5/contacts/add');
		assert.deepEqual(JSON.parse(requests[0].body as string), { emails: ['a@b.com'] });
	});

	it('uses form encoding and the realm URL for the OAuth token endpoint', async () => {
		const op = operations.find((o) => o.resource === 'oAuth')!;
		const { requests } = await run({
			resource: 'oAuth',
			operation: op.operation,
			client_id: 'id',
			client_secret: 's&c',
		});
		assert.equal(requests[0].url, 'https://api.brevo.com/realms/partner/oauth/token');
		assert.equal(requests[0].headers['Content-Type'], 'application/x-www-form-urlencoded');
		assert.equal(requests[0].body, 'client_id=id&client_secret=s%26c&grant_type=client_credentials');
	});

	it('pages through results with Return All', async () => {
		const page = (n: number, start: number) => ({ contacts: Array.from({ length: n }, (_, k) => ({ id: start + k })), count: 5 });
		const { requests, out } = await run(
			{ resource: 'contacts', operation: 'getContacts', returnAll: true, queryParameters: { limit: 2 } },
			{ responses: [{ body: page(2, 0) }, { body: page(2, 2) }, { body: page(1, 4) }] },
		);
		assert.equal(requests.length, 3);
		assert.ok(requests[2].url.includes('offset=4'));
		assert.deepEqual(
			out.map((o) => o.json.id),
			[0, 1, 2, 3, 4],
		);
	});

	it('returns binary data for file downloads', async () => {
		const op = operations.find((o) => o.binaryResponse)!;
		const params: IDataObject = { resource: op.resource, operation: op.operation };
		for (const p of op.params) params[p.name] = 'x';
		const { out } = await run(params, {
			responses: [
				{
					body: Buffer.from('PDFDATA'),
					headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="doc.pdf"' },
				},
			],
		});
		assert.equal(out[0].binary!.data.fileName, 'doc.pdf');
		assert.equal(out[0].binary!.data.mimeType, 'application/pdf');
	});

	it('maps API errors to a NodeApiError with Brevo message', async () => {
		await assert.rejects(
			run(
				{ resource: 'account', operation: operations.find((o) => o.resource === 'account')!.operation },
				{ responses: [{ statusCode: 401, body: { code: 'unauthorized', message: 'Key not found' } }] },
			),
			(e: Error) => /Key not found/.test(e.message),
		);
	});

	it('supports custom API calls', async () => {
		const { requests } = await run({
			resource: CUSTOM_RESOURCE,
			customMethod: 'POST',
			customPath: '/contacts',
			customQuery: '{"foo":["a","b"]}',
			customBody: '{"email":"a@b.com"}',
		});
		assert.equal(requests[0].url, 'https://api.brevo.com/v3/contacts?foo=a&foo=b');
		assert.equal(requests[0].body, '{"email":"a@b.com"}');
	});

	it('resolves relative URLs', () => {
		assert.equal(resolveUrl('https://api.brevo.com/v3/', '/account'), 'https://api.brevo.com/v3/account');
		assert.equal(resolveUrl('https://api.brevo.com/v3', '/../realms/x'), 'https://api.brevo.com/realms/x');
	});
});

describe('credentials', () => {
	it('adds api-key or bearer header', async () => {
		const cred = new BrevoFullApi();
		const a = await cred.authenticate({ authType: 'apiKey', apiKey: 'k' }, { url: '/x', headers: {} });
		assert.equal(a.headers!['api-key'], 'k');
		const b = await cred.authenticate({ authType: 'bearer', accessToken: 't' }, { url: '/x' });
		assert.equal(b.headers!.Authorization, 'Bearer t');
	});
});

describe('trigger', () => {
	it('registers and deletes the webhook', async () => {
		const trigger = new BrevoFullTrigger();
		const staticData: IDataObject = {};
		const calls: IDataObject[] = [];
		const params: IDataObject = { type: 'transactional', events: ['delivered', 'opened'], options: { batched: true } };
		const ctx = {
			getWorkflowStaticData: () => staticData,
			getNodeWebhookUrl: () => 'https://n8n.example.com/webhook/abc',
			getNodeParameter: (n: string, fb?: unknown) => (n in params ? params[n] : fb),
			getNode: () => ({ name: 'T' }),
			getCredentials: async () => ({ apiKey: 'k' }),
			helpers: {
				httpRequestWithAuthentication: async (_c: string, o: IDataObject) => {
					calls.push(o);
					return { statusCode: 201, headers: { 'content-type': 'application/json' }, body: Buffer.from('{"id":42}') };
				},
			},
		};
		assert.equal(await trigger.webhookMethods.default.create.call(ctx as never), true);
		assert.equal(staticData.webhookId, 42);
		assert.deepEqual(JSON.parse(calls[0].body as string), {
			url: 'https://n8n.example.com/webhook/abc',
			type: 'transactional',
			events: ['delivered', 'opened'],
			batched: true,
			description: 'n8n workflow trigger',
		});
		assert.equal(await trigger.webhookMethods.default.delete.call(ctx as never), true);
		assert.equal(calls[1].method, 'DELETE');
		assert.equal(calls[1].url, 'https://api.brevo.com/v3/webhooks/42');
	});
});
