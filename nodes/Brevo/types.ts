export type BrevoParamLocation = 'path' | 'query' | 'body' | 'bodyRoot' | 'form';

export type BrevoParamType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'options'
	| 'multiOptions'
	| 'stringArray'
	| 'numberArray'
	| 'json'
	| 'file';

export interface BrevoParam {
	/** Property name in the SDK request object */
	name: string;
	/** Name sent on the wire (query key, body key, form field). Placeholder name for path params. */
	wire: string;
	in: BrevoParamLocation;
	type: BrevoParamType;
	required: boolean;
	description: string;
	options?: string[];
	example?: unknown;
	/** Query array serialisation: repeat (default) or comma */
	style?: 'comma';
}

export interface BrevoOperation {
	resource: string;
	operation: string;
	name: string;
	action: string;
	description: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	path: string;
	bodyMode: 'none' | 'json' | 'form' | 'multipart';
	params: BrevoParam[];
	constantBody?: Record<string, unknown>;
	binaryResponse?: boolean;
	deprecated?: boolean;
	paginated?: boolean;
}

export interface BrevoResource {
	value: string;
	name: string;
}
