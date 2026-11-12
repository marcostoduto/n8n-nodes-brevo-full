import type { IDataObject, INodeProperties } from 'n8n-workflow';

export interface CapturedRequest {
	method: string;
	url: string;
	headers: IDataObject;
	body?: unknown;
}

export interface MockResponse {
	statusCode?: number;
	headers?: IDataObject;
	body?: unknown;
}

/** Minimal IExecuteFunctions mock: enough for the Brevo node. */
export function createExecuteMock(params: IDataObject, opts: { responses?: MockResponse[]; binary?: IDataObject } = {}) {
	const requests: CapturedRequest[] = [];
	const responses = [...(opts.responses ?? [])];
	const node = { name: 'Brevo', type: 'n8n-nodes-brevo-full.brevoFull', typeVersion: 1, parameters: params };
	const ctx = {
		getInputData: () => [{ json: {}, binary: opts.binary }],
		getNodeParameter: (name: string, _i: number, fallback?: unknown) => (name in params ? params[name] : fallback),
		getNode: () => node,
		continueOnFail: () => false,
		getCredentials: async () => ({ authType: 'apiKey', apiKey: 'test-key', baseUrl: 'https://api.brevo.com/v3' }),
		helpers: {
			httpRequestWithAuthentication: async (_cred: string, options: IDataObject) => {
				requests.push({
					method: options.method as string,
					url: options.url as string,
					headers: options.headers as IDataObject,
					body: options.body,
				});
				const r = responses.shift() ?? { body: { ok: true } };
				const body = r.body === undefined ? Buffer.alloc(0) : Buffer.isBuffer(r.body) ? r.body : Buffer.from(JSON.stringify(r.body));
				return {
					statusCode: r.statusCode ?? 200,
					headers: r.headers ?? { 'content-type': 'application/json; charset=utf-8' },
					body,
				};
			},
			assertBinaryData: (_i: number, prop: string) => {
				const b = opts.binary?.[prop] as IDataObject | undefined;
				if (!b) throw new Error(`No binary property ${prop}`);
				return b;
			},
			getBinaryDataBuffer: async (_i: number, prop: string) =>
				Buffer.from(((opts.binary?.[prop] as IDataObject).data as string) ?? '', 'base64'),
			prepareBinaryData: async (data: Buffer, fileName: string, mimeType: string) => ({
				data: data.toString('base64'),
				fileName,
				mimeType,
			}),
		},
	};
	return { ctx, requests };
}

export function sampleValue(p: INodeProperties): unknown {
	switch (p.type) {
		case 'number':
			return 7;
		case 'boolean':
			return true;
		case 'options':
			return (p.options as Array<{ value: string }>)[0].value;
		case 'multiOptions':
			return [(p.options as Array<{ value: string }>)[0].value];
		case 'json':
			return p.default === '[]' ? '[{"a":1}]' : '{"a":1}';
		case 'collection':
			return {};
		default:
			return p.name === 'binaryPropertyName' ? 'data' : 'val/ue';
	}
}
