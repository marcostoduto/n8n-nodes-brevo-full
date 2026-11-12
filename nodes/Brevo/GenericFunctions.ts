import type {
	IBinaryData,
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import type { BrevoParam, BrevoParamType } from './types';

export const CREDENTIAL_NAME = 'brevoFullApi';
export const DEFAULT_BASE_URL = 'https://api.brevo.com/v3';

type Ctx = IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions;

export interface FilePart {
	field: string;
	data: Buffer;
	fileName: string;
	mimeType: string;
}

export interface BrevoRequest {
	method: IHttpRequestMethods;
	path: string;
	query?: Array<[string, string]>;
	bodyMode?: 'none' | 'json' | 'form' | 'multipart';
	body?: unknown;
	files?: FilePart[];
}

export interface BrevoResponse {
	statusCode: number;
	headers: IDataObject;
	body: unknown;
	/** Raw bytes when the response is not JSON/text */
	binary?: Buffer;
	contentType: string;
}

// ------------------------------------------------------------------ value conversion

export function parseJsonValue(value: unknown, label: string, ctx?: { node: () => any }): unknown {
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	if (trimmed === '') return undefined;
	try {
		return JSON.parse(trimmed);
	} catch {
		const msg = `"${label}" must be valid JSON`;
		if (ctx) throw new NodeOperationError(ctx.node(), msg);
		throw new Error(msg);
	}
}

function toArray(value: unknown): unknown[] {
	if (value === undefined || value === null || value === '') return [];
	if (Array.isArray(value)) return value;
	if (typeof value === 'string') {
		const t = value.trim();
		if (t.startsWith('[')) {
			try {
				const parsed = JSON.parse(t);
				if (Array.isArray(parsed)) return parsed;
			} catch {
				// fall through to comma split
			}
		}
		return t
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s !== '');
	}
	return [value];
}

/** Convert a value coming from an n8n parameter into the value expected by the API. Returns undefined to skip. */
export function convertValue(param: Pick<BrevoParam, 'type' | 'name' | 'required'>, value: unknown, node?: () => any): unknown {
	const type: BrevoParamType = param.type;
	if (value === undefined || value === null) return undefined;
	switch (type) {
		case 'number': {
			if (value === '') return undefined;
			const n = typeof value === 'number' ? value : Number(value);
			return Number.isNaN(n) ? value : n;
		}
		case 'boolean':
			if (typeof value === 'string') return value === 'true';
			return Boolean(value);
		case 'stringArray':
			return toArray(value).map((v) => (typeof v === 'string' ? v : String(v)));
		case 'numberArray':
			return toArray(value).map((v) => {
				const n = Number(v);
				return Number.isNaN(n) ? v : n;
			});
		case 'multiOptions':
			return toArray(value);
		case 'json': {
			const parsed = parseJsonValue(value, param.name, node ? { node } : undefined);
			return parsed;
		}
		case 'string':
		case 'options':
		default:
			if (value === '' && !param.required) return undefined;
			return typeof value === 'object' ? JSON.stringify(value) : value;
	}
}

// ------------------------------------------------------------------ url helpers

export function resolveUrl(baseUrl: string, path: string): string {
	const base = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
	if (/^https?:\/\//i.test(path)) return path;
	let p = path.startsWith('/') ? path : `/${path}`;
	let b = base;
	// Endpoints outside /v3 (e.g. OAuth token endpoint) are expressed as "/../realms/..."
	while (p.startsWith('/../')) {
		b = b.replace(/\/[^/]+$/, '');
		p = p.slice(3);
	}
	return `${b}${p}`;
}

export function fillPath(path: string, values: Record<string, unknown>): string {
	return path.replace(/\{([^}]+)\}/g, (_m, key: string) => {
		const v = values[key];
		if (v === undefined || v === null || v === '') {
			throw new Error(`Missing value for path parameter "${key}"`);
		}
		return encodeURIComponent(String(v));
	});
}

export function addQuery(
	query: Array<[string, string]>,
	key: string,
	value: unknown,
	style?: 'comma',
): void {
	if (value === undefined || value === null) return;
	if (Array.isArray(value)) {
		if (value.length === 0) return;
		if (style === 'comma') query.push([key, value.map(String).join(',')]);
		else for (const v of value) query.push([key, typeof v === 'object' ? JSON.stringify(v) : String(v)]);
		return;
	}
	if (typeof value === 'object') {
		query.push([key, JSON.stringify(value)]);
		return;
	}
	query.push([key, String(value)]);
}

export function buildQueryString(query: Array<[string, string]>): string {
	if (!query.length) return '';
	return '?' + query.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

// ------------------------------------------------------------------ body helpers

export function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = { ...target };
	for (const [k, v] of Object.entries(source)) {
		if (isPlainObject(v) && isPlainObject(out[k])) out[k] = deepMerge(out[k] as Record<string, unknown>, v);
		else out[k] = v;
	}
	return out;
}

export function buildMultipart(fields: Record<string, unknown>, files: FilePart[]): { body: Buffer; contentType: string } {
	const boundary = `----n8nBrevoBoundary${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
	const chunks: Buffer[] = [];
	const crlf = '\r\n';
	for (const [name, value] of Object.entries(fields)) {
		if (value === undefined || value === null) continue;
		const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
		chunks.push(
			Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="${name}"${crlf}${crlf}${str}${crlf}`, 'utf8'),
		);
	}
	for (const f of files) {
		const safeName = f.fileName.replace(/"/g, '');
		chunks.push(
			Buffer.from(
				`--${boundary}${crlf}Content-Disposition: form-data; name="${f.field}"; filename="${safeName}"${crlf}Content-Type: ${f.mimeType}${crlf}${crlf}`,
				'utf8',
			),
		);
		chunks.push(f.data);
		chunks.push(Buffer.from(crlf, 'utf8'));
	}
	chunks.push(Buffer.from(`--${boundary}--${crlf}`, 'utf8'));
	return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` };
}

export function formUrlEncode(fields: Record<string, unknown>): string {
	return Object.entries(fields)
		.filter(([, v]) => v !== undefined && v !== null)
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : String(v))}`)
		.join('&');
}

// ------------------------------------------------------------------ http

function headerValue(headers: IDataObject, name: string): string {
	const key = Object.keys(headers ?? {}).find((k) => k.toLowerCase() === name);
	const v = key ? headers[key] : undefined;
	return Array.isArray(v) ? String(v[0]) : v === undefined ? '' : String(v);
}

export async function brevoRequest(this: Ctx, req: BrevoRequest, itemIndex = 0): Promise<BrevoResponse> {
	const credentials = await this.getCredentials(CREDENTIAL_NAME);
	const baseUrl = (credentials.baseUrl as string) || DEFAULT_BASE_URL;
	const url = resolveUrl(baseUrl, req.path) + buildQueryString(req.query ?? []);

	const options: IHttpRequestOptions = {
		method: req.method,
		url,
		headers: { Accept: 'application/json' },
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
		encoding: 'arraybuffer',
		json: false,
	};

	const mode = req.bodyMode ?? 'none';
	if (mode === 'json' && req.body !== undefined) {
		options.body = JSON.stringify(req.body);
		options.headers!['Content-Type'] = 'application/json';
	} else if (mode === 'form') {
		options.body = formUrlEncode((req.body as Record<string, unknown>) ?? {});
		options.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
	} else if (mode === 'multipart') {
		const { body, contentType } = buildMultipart((req.body as Record<string, unknown>) ?? {}, req.files ?? []);
		options.body = body;
		options.headers!['Content-Type'] = contentType;
	}

	let raw: { statusCode: number; headers: IDataObject; body: unknown };
	try {
		raw = (await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL_NAME, options)) as typeof raw;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
	}

	const headers = (raw.headers ?? {}) as IDataObject;
	const contentType = headerValue(headers, 'content-type');
	const buf = Buffer.isBuffer(raw.body)
		? raw.body
		: raw.body instanceof ArrayBuffer
			? Buffer.from(raw.body)
			: typeof raw.body === 'string'
				? Buffer.from(raw.body, 'utf8')
				: raw.body === undefined || raw.body === null
					? Buffer.alloc(0)
					: Buffer.from(JSON.stringify(raw.body), 'utf8');

	let body: unknown;
	let binary: Buffer | undefined;
	const isJson = /json/i.test(contentType);
	const isText = /^text\//i.test(contentType) || /xml|csv|javascript/i.test(contentType);
	if (buf.length === 0) body = undefined;
	else if (isJson || (!contentType && /^[\s]*[{[]/.test(buf.subarray(0, 64).toString('utf8')))) {
		const text = buf.toString('utf8');
		try {
			body = JSON.parse(text);
		} catch {
			body = text;
		}
	} else if (isText) body = buf.toString('utf8');
	else binary = buf;

	const statusCode = Number(raw.statusCode ?? 200);
	if (statusCode >= 400) {
		const errBody = isPlainObject(body) ? (body as JsonObject) : { message: typeof body === 'string' ? body : `HTTP ${statusCode}` };
		const message = (isPlainObject(body) && (body.message as string)) || `Brevo API request failed with status ${statusCode}`;
		const code = isPlainObject(body) ? (body.code as string | undefined) : undefined;
		throw new NodeApiError(this.getNode(), { ...errBody, httpCode: String(statusCode) } as JsonObject, {
			httpCode: String(statusCode),
			message: code ? `${message} (${code})` : message,
			description: `${req.method} ${req.path}`,
			itemIndex,
		});
	}

	return { statusCode, headers, body, binary, contentType };
}

/** Extract the list of records from a paginated Brevo response. */
export function extractList(body: unknown): { items: unknown[]; key?: string; total?: number } {
	if (Array.isArray(body)) return { items: body };
	if (!isPlainObject(body)) return { items: [] };
	let total: number | undefined;
	for (const k of ['count', 'total', 'totalCount', 'total_count']) {
		if (typeof body[k] === 'number') {
			total = body[k] as number;
			break;
		}
	}
	const arrays = Object.entries(body).filter(([, v]) => Array.isArray(v));
	if (arrays.length === 0) {
		// nested e.g. { data: { items: [] } }
		for (const v of Object.values(body)) {
			if (isPlainObject(v)) {
				const inner = extractList(v);
				if (inner.items.length || inner.key) return { ...inner, total: inner.total ?? total };
			}
		}
		return { items: [], total };
	}
	const preferred = arrays.find(([k]) => !/^(meta|links|errors?)$/i.test(k)) ?? arrays[0];
	return { items: preferred[1] as unknown[], key: preferred[0], total };
}

export async function prepareBinary(
	this: IExecuteFunctions,
	data: Buffer,
	headers: IDataObject,
	contentType: string,
	fallbackName: string,
): Promise<IBinaryData> {
	const disposition = headerValue(headers, 'content-disposition');
	const m = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
	const fileName = m ? decodeURIComponent(m[1]) : fallbackName;
	return this.helpers.prepareBinaryData(data, fileName, contentType || 'application/octet-stream');
}
