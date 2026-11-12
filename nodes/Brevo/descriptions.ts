import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import { operations, resources } from './operations.generated';
import type { BrevoOperation, BrevoParam } from './types';

export const CUSTOM_RESOURCE = '__custom';

const RESERVED = new Set([
	'resource',
	'operation',
	'options',
	'returnAll',
	'queryParameters',
	'bodyFields',
	'formFields',
	'binaryPropertyName',
	'customMethod',
	'customPath',
	'customQuery',
	'customBody',
]);

const ACRONYMS: Record<string, string> = {
	id: 'ID',
	ids: 'IDs',
	url: 'URL',
	sms: 'SMS',
	smtp: 'SMTP',
	crm: 'CRM',
	ip: 'IP',
	ips: 'IPs',
	html: 'HTML',
	utm: 'UTM',
	api: 'API',
	doi: 'DOI',
};

export function humanize(name: string): string {
	return name
		.replace(/\[\]$/, '')
		.replace(/\[([^\]]+)\]/g, ' $1')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
		.replace(/[_\-.]+/g, ' ')
		.split(/\s+/)
		.filter(Boolean)
		.map((w) => ACRONYMS[w.toLowerCase()] ?? w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

/** n8n parameter names are resolved as object paths, so keep them to [A-Za-z0-9_]. */
function sanitize(name: string): string {
	let n = name.replace(/\[\]$/, '').replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
	if (!n) n = 'param';
	if (/^[0-9]/.test(n)) n = `p_${n}`;
	if (RESERVED.has(n)) n = `${n}Param`;
	return n;
}

function signature(p: BrevoParam): string {
	return `${p.type}|${(p.options ?? []).join(',')}`;
}

// Top-level (individually displayed) params share a name across operations only when their type is identical.
const topLevelSignatures = new Map<string, Set<string>>();
function isTopLevel(p: BrevoParam): boolean {
	if (p.in === 'path' || p.in === 'bodyRoot') return true;
	if (p.type === 'file') return true;
	return p.required;
}
for (const op of operations) {
	for (const p of op.params) {
		if (!isTopLevel(p)) continue;
		const key = sanitize(p.name);
		if (!topLevelSignatures.has(key)) topLevelSignatures.set(key, new Set());
		topLevelSignatures.get(key)!.add(signature(p));
	}
}

/** Name of the n8n parameter that holds the value of an API param. */
export function uiName(_op: BrevoOperation, p: BrevoParam): string {
	if (p.type === 'file') return 'binaryPropertyName';
	const base = sanitize(p.name);
	if (!isTopLevel(p)) return base;
	const sigs = topLevelSignatures.get(base);
	if (sigs && sigs.size > 1) {
		const suffix = p.type === 'options' ? `options_${hash(signature(p))}` : p.type;
		return `${base}_${suffix}`;
	}
	return base;
}

/** Collection that holds an optional param (undefined for top-level params). */
export function collectionName(_op: BrevoOperation, p: BrevoParam): string | undefined {
	if (isTopLevel(p)) return undefined;
	if (p.in === 'query') return 'queryParameters';
	if (p.in === 'form') return 'formFields';
	return 'bodyFields';
}

function hash(s: string): string {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
	return (h >>> 0).toString(36).slice(0, 5);
}

function truncate(s: string, max: number): string {
	return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

function paramDescription(p: BrevoParam): string {
	let d = p.description || '';
	if (p.type === 'stringArray' || p.type === 'numberArray') {
		d += `${d ? ' ' : ''}Comma-separated list (or a JSON array / array expression).`;
	}
	if (p.type === 'json' && p.example !== undefined && p.example !== null) {
		d += `${d ? ' ' : ''}Example: ${truncate(JSON.stringify(p.example), 400)}`;
	}
	return truncate(d, 1200);
}

function toProperty(op: BrevoOperation, p: BrevoParam, forCollection: boolean): INodeProperties {
	const displayName = humanize(p.name);
	const description = paramDescription(p);
	const base = {
		displayName,
		name: uiName(op, p),
		description: description || undefined,
	};
	const required = !forCollection && p.required;
	switch (p.type) {
		case 'number':
			return { ...base, type: 'number', default: 0, required } as INodeProperties;
		case 'boolean':
			return { ...base, type: 'boolean', default: false } as INodeProperties;
		case 'options':
			return {
				...base,
				type: 'options',
				options: (p.options ?? []).map((o) => ({ name: o, value: o })),
				default: (p.options ?? [''])[0],
				required,
			} as INodeProperties;
		case 'multiOptions':
			return {
				...base,
				type: 'multiOptions',
				options: (p.options ?? []).map((o) => ({ name: o, value: o })),
				default: [],
				required,
			} as INodeProperties;
		case 'json': {
			const def = Array.isArray(p.example) ? '[]' : '{}';
			return { ...base, type: 'json', default: def, required } as INodeProperties;
		}
		case 'file':
			return {
				displayName: `Input Binary Field (${displayName})`,
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: `Name of the input binary field containing the file to upload as "${p.wire}". ${description}`.trim(),
			} as INodeProperties;
		default:
			return { ...base, type: 'string', default: '', required } as INodeProperties;
	}
}

function sortByName<T extends { displayName?: string; name: string }>(a: T, b: T): number {
	return (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name);
}

export function findOperation(resource: string, operation: string): BrevoOperation | undefined {
	return operationIndex.get(`${resource}:${operation}`);
}
const operationIndex = new Map(operations.map((o) => [`${o.resource}:${o.operation}`, o]));

export function buildProperties(): INodeProperties[] {
	const props: INodeProperties[] = [];

	const resourceOptions: INodePropertyOptions[] = resources
		.map((r) => ({ name: r.name, value: r.value }))
		.sort((a, b) => a.name.localeCompare(b.name));
	resourceOptions.push({
		name: 'Custom API Call',
		value: CUSTOM_RESOURCE,
		description: 'Call any Brevo endpoint by method and path',
	});

	props.push({
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: resourceOptions,
		default: 'contacts',
	});

	for (const r of resources) {
		const ops = operations.filter((o) => o.resource === r.value);
		const options = ops
			.map((o) => ({
				name: o.deprecated ? `${o.name} (Deprecated)` : o.name,
				value: o.operation,
				action: o.deprecated ? `${o.name} (deprecated)` : o.name,
				description: truncate(`${o.method} ${o.path.replace(/^\/\.\./, '')} — ${o.action}`, 300),
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
		props.push({
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: { show: { resource: [r.value] } },
			options,
			default: options[0].value,
		});
	}

	for (const op of operations) {
		const show = { show: { resource: [op.resource], operation: [op.operation] } };

		if (op.description && op.description !== op.action) {
			props.push({
				displayName: truncate(op.description, 1000),
				name: `notice_${sanitize(op.resource)}_${sanitize(op.operation)}`,
				type: 'notice',
				default: '',
				displayOptions: show,
			});
		}

		const top: INodeProperties[] = [];
		const query: INodeProperties[] = [];
		const body: INodeProperties[] = [];
		const form: INodeProperties[] = [];
		let hasFile = false;
		for (const p of op.params) {
			const coll = collectionName(op, p);
			if (!coll) {
				if (p.type === 'file') {
					if (hasFile) continue;
					hasFile = true;
				}
				top.push({ ...toProperty(op, p, false), displayOptions: show });
			} else if (coll === 'queryParameters') query.push(toProperty(op, p, true));
			else if (coll === 'formFields') form.push(toProperty(op, p, true));
			else body.push(toProperty(op, p, true));
		}
		// path params first, then other required params in declared order
		props.push(...top);

		if (op.paginated) {
			props.push({
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results by paging through the endpoint (uses the Limit query parameter as page size)',
				displayOptions: show,
			});
		}

		if (query.length) {
			props.push({
				displayName: 'Query Parameters',
				name: 'queryParameters',
				type: 'collection',
				placeholder: 'Add Query Parameter',
				default: {},
				displayOptions: show,
				options: query.sort(sortByName),
			});
		}
		if (body.length) {
			const anyRequired = op.params.some((p) => (p.in === 'body' || p.in === 'bodyRoot') && p.required);
			props.push({
				displayName: anyRequired ? 'Additional Body Fields' : 'Body Fields',
				name: 'bodyFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: show,
				options: body.sort(sortByName),
			});
		}
		if (form.length) {
			props.push({
				displayName: 'Additional Form Fields',
				name: 'formFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: show,
				options: form.sort(sortByName),
			});
		}
	}

	// ----------------------------------------------------------- custom API call
	const customShow = { show: { resource: [CUSTOM_RESOURCE] } };
	props.push(
		{
			displayName: 'Method',
			name: 'customMethod',
			type: 'options',
			options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({ name: m, value: m })),
			default: 'GET',
			displayOptions: customShow,
		},
		{
			displayName: 'Path',
			name: 'customPath',
			type: 'string',
			default: '/account',
			placeholder: '/contacts/{identifier}',
			required: true,
			description: 'Endpoint path relative to the base URL configured in the credentials (e.g. /contacts)',
			displayOptions: customShow,
		},
		{
			displayName: 'Query Parameters (JSON)',
			name: 'customQuery',
			type: 'json',
			default: '{}',
			displayOptions: customShow,
		},
		{
			displayName: 'Body (JSON)',
			name: 'customBody',
			type: 'json',
			default: '{}',
			displayOptions: { show: { resource: [CUSTOM_RESOURCE], customMethod: ['POST', 'PUT', 'PATCH', 'DELETE'] } },
		},
	);

	// ----------------------------------------------------------- generic options
	props.push({
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Extra Body (JSON)',
				name: 'extraBody',
				type: 'json',
				default: '{}',
				description:
					'JSON object deep-merged into the request body (JSON endpoints) or appended as fields (form/multipart endpoints). Useful for fields not exposed in the UI.',
			},
			{
				displayName: 'Extra Query Parameters (JSON)',
				name: 'extraQuery',
				type: 'json',
				default: '{}',
				description: 'JSON object of additional query string parameters',
			},
			{
				displayName: 'Output Binary Field',
				name: 'binaryPropertyOutput',
				type: 'string',
				default: 'data',
				description: 'Name of the binary field used when the endpoint returns a file',
			},
			{
				displayName: 'Return Full Response',
				name: 'fullResponse',
				type: 'boolean',
				default: false,
				description: 'Whether to return status code and headers in addition to the body',
			},
			{
				displayName: 'Split Arrays Into Items',
				name: 'splitArrays',
				type: 'boolean',
				default: true,
				description: 'Whether to output one item per element when the response body is a JSON array',
			},
			{
				displayName: 'Max Pages',
				name: 'maxPages',
				type: 'number',
				default: 1000,
				typeOptions: { minValue: 1 },
				description: 'Safety limit for the number of pages fetched when Return All is enabled',
			},
		],
	});

	return props;
}
