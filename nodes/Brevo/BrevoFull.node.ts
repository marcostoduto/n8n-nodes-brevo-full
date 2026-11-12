import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { buildProperties, collectionName, CUSTOM_RESOURCE, findOperation, uiName } from './descriptions';
import type { BrevoRequest, BrevoResponse, FilePart } from './GenericFunctions';
import {
	addQuery,
	brevoRequest,
	CREDENTIAL_NAME,
	convertValue,
	deepMerge,
	extractList,
	fillPath,
	isPlainObject,
	parseJsonValue,
	prepareBinary,
} from './GenericFunctions';
import type { BrevoOperation } from './types';

export class BrevoFull implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Brevo (Full API)',
		name: 'brevoFull',
		icon: 'file:brevo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] === "__custom" ? $parameter["customMethod"] + " " + $parameter["customPath"] : $parameter["operation"]}}',
		description: 'Use every endpoint of the Brevo (ex Sendinblue) API v3',
		defaults: {
			name: 'Brevo',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: CREDENTIAL_NAME,
				required: true,
			},
		],
		properties: buildProperties(),
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;

				let req: BrevoRequest;
				let op: BrevoOperation | undefined;
				if (resource === CUSTOM_RESOURCE) {
					req = buildCustomRequest(this, i);
				} else {
					const operation = this.getNodeParameter('operation', i) as string;
					op = findOperation(resource, operation);
					if (!op) {
						throw new NodeOperationError(this.getNode(), `Unknown operation "${operation}" for resource "${resource}"`, {
							itemIndex: i,
						});
					}
					req = await buildOperationRequest(this, op, i);
				}

				applyExtraOptions(this, req, options, i);

				const returnAll = op?.paginated ? (this.getNodeParameter('returnAll', i, false) as boolean) : false;
				if (returnAll && op) {
					const all = await fetchAll(this, req, options, i);
					for (const entry of all) returnData.push(toItem(entry, i));
					continue;
				}

				const response = await brevoRequest.call(this, req, i);
				returnData.push(...(await responseToItems(this, response, options, i, op)));
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// ---------------------------------------------------------------------- helpers

function toItem(value: unknown, itemIndex: number): INodeExecutionData {
	const json = isPlainObject(value) ? (value as IDataObject) : ({ value } as IDataObject);
	return { json, pairedItem: { item: itemIndex } };
}

function buildCustomRequest(ctx: IExecuteFunctions, i: number): BrevoRequest {
	const node = () => ctx.getNode();
	const method = ctx.getNodeParameter('customMethod', i) as IHttpRequestMethods;
	const path = ctx.getNodeParameter('customPath', i) as string;
	const queryObj = parseJsonValue(ctx.getNodeParameter('customQuery', i, '{}'), 'Query Parameters', { node });
	const query: Array<[string, string]> = [];
	if (isPlainObject(queryObj)) for (const [k, v] of Object.entries(queryObj)) addQuery(query, k, v);
	let body: unknown;
	if (method !== 'GET') {
		body = parseJsonValue(ctx.getNodeParameter('customBody', i, '{}'), 'Body', { node });
		if (isPlainObject(body) && Object.keys(body).length === 0 && method === 'DELETE') body = undefined;
	}
	return { method, path, query, bodyMode: body === undefined ? 'none' : 'json', body };
}

export async function buildOperationRequest(ctx: IExecuteFunctions, op: BrevoOperation, i: number): Promise<BrevoRequest> {
	const node = () => ctx.getNode();
	const collections: Record<string, IDataObject> = {};
	const getCollection = (name: string): IDataObject => {
		if (!collections[name]) collections[name] = (ctx.getNodeParameter(name, i, {}) as IDataObject) ?? {};
		return collections[name];
	};

	const pathValues: Record<string, unknown> = {};
	const query: Array<[string, string]> = [];
	let body: Record<string, unknown> = {};
	let rootBody: unknown;
	const files: FilePart[] = [];

	for (const p of op.params) {
		const coll = collectionName(op, p);
		const name = uiName(op, p);

		if (p.type === 'file') {
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i) as string;
			const binaryData = ctx.helpers.assertBinaryData(i, binaryPropertyName);
			const data = await ctx.helpers.getBinaryDataBuffer(i, binaryPropertyName);
			files.push({
				field: p.wire,
				data,
				fileName: binaryData.fileName ?? 'file',
				mimeType: binaryData.mimeType ?? 'application/octet-stream',
			});
			continue;
		}

		let raw: unknown;
		if (coll) {
			const c = getCollection(coll);
			if (!(name in c)) continue;
			raw = c[name];
		} else {
			raw = ctx.getNodeParameter(name, i, undefined);
		}
		const value = convertValue(p, raw, node);
		if (value === undefined) {
			if (p.required && p.in !== 'body') {
				throw new NodeOperationError(ctx.getNode(), `Parameter "${p.name}" is required`, { itemIndex: i });
			}
			continue;
		}

		switch (p.in) {
			case 'path':
				pathValues[p.wire] = value;
				break;
			case 'query':
				addQuery(query, p.wire, value, p.style);
				break;
			case 'bodyRoot':
				rootBody = value;
				break;
			case 'body':
			case 'form':
				body[p.wire] = value;
				break;
		}
	}

	if (op.constantBody) body = { ...body, ...op.constantBody };

	let path: string;
	try {
		path = fillPath(op.path, pathValues);
	} catch (e) {
		throw new NodeOperationError(ctx.getNode(), (e as Error).message, { itemIndex: i });
	}

	const req: BrevoRequest = { method: op.method, path, query, bodyMode: op.bodyMode };
	if (op.bodyMode === 'json') req.body = rootBody !== undefined ? rootBody : body;
	else if (op.bodyMode === 'form' || op.bodyMode === 'multipart') req.body = body;
	if (files.length) req.files = files;
	return req;
}

function applyExtraOptions(ctx: IExecuteFunctions, req: BrevoRequest, options: IDataObject, i: number): void {
	const node = () => ctx.getNode();
	if (options.extraQuery !== undefined) {
		const q = parseJsonValue(options.extraQuery, 'Extra Query Parameters', { node });
		if (isPlainObject(q)) {
			req.query = req.query ?? [];
			for (const [k, v] of Object.entries(q)) {
				req.query = req.query.filter(([key]) => key !== k);
				addQuery(req.query, k, v);
			}
		}
	}
	if (options.extraBody !== undefined) {
		const b = parseJsonValue(options.extraBody, 'Extra Body', { node });
		if (isPlainObject(b) && Object.keys(b).length) {
			if (req.bodyMode === 'none') req.bodyMode = 'json';
			if (req.body === undefined || isPlainObject(req.body)) {
				req.body = deepMerge((req.body as Record<string, unknown>) ?? {}, b);
			} else {
				throw new NodeOperationError(ctx.getNode(), 'Extra Body can only be merged into an object body', { itemIndex: i });
			}
		}
	}
}

async function fetchAll(ctx: IExecuteFunctions, req: BrevoRequest, options: IDataObject, i: number): Promise<unknown[]> {
	const query = [...(req.query ?? [])];
	const limitEntry = query.find(([k]) => k === 'limit');
	const pageSize = limitEntry ? Math.max(1, Number(limitEntry[1]) || 50) : 50;
	let offset = Number(query.find(([k]) => k === 'offset')?.[1] ?? 0) || 0;
	const maxPages = Number(options.maxPages ?? 1000) || 1000;
	const base = query.filter(([k]) => k !== 'limit' && k !== 'offset');
	const results: unknown[] = [];

	for (let page = 0; page < maxPages; page++) {
		const pageReq: BrevoRequest = {
			...req,
			query: [...base, ['limit', String(pageSize)], ['offset', String(offset)]],
		};
		const res = await brevoRequest.call(ctx, pageReq, i);
		const { items, total } = extractList(res.body);
		results.push(...items);
		offset += pageSize;
		if (items.length < pageSize) break;
		if (total !== undefined && results.length >= total) break;
	}
	return results;
}

async function responseToItems(
	ctx: IExecuteFunctions,
	res: BrevoResponse,
	options: IDataObject,
	i: number,
	op?: BrevoOperation,
): Promise<INodeExecutionData[]> {
	if (res.binary) {
		const prop = (options.binaryPropertyOutput as string) || 'data';
		const fallback = op ? `${op.operation}` : 'brevo-file';
		const binary = await prepareBinary.call(ctx, res.binary, res.headers, res.contentType, fallback);
		const json: IDataObject = options.fullResponse
			? { statusCode: res.statusCode, headers: res.headers }
			: { fileName: binary.fileName, mimeType: binary.mimeType };
		return [{ json, binary: { [prop]: binary }, pairedItem: { item: i } }];
	}

	if (options.fullResponse) {
		return [
			{
				json: { statusCode: res.statusCode, headers: res.headers, body: res.body as IDataObject },
				pairedItem: { item: i },
			},
		];
	}

	const body = res.body;
	if (body === undefined || body === '') return [{ json: { success: true, statusCode: res.statusCode }, pairedItem: { item: i } }];
	if (Array.isArray(body) && options.splitArrays !== false) return body.map((b) => toItem(b, i));
	if (Array.isArray(body)) return [{ json: { data: body } as IDataObject, pairedItem: { item: i } }];
	return [toItem(body, i)];
}
