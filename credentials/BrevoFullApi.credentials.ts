import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class BrevoFullApi implements ICredentialType {
	name = 'brevoFullApi';

	displayName = 'Brevo (Full API) API';

	documentationUrl = 'https://developers.brevo.com/docs/getting-started';

	icon = 'file:brevo.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Authentication',
			name: 'authType',
			type: 'options',
			options: [
				{
					name: 'API Key',
					value: 'apiKey',
					description: 'Standard Brevo API key (sent in the api-key header)',
				},
				{
					name: 'OAuth Access Token',
					value: 'bearer',
					description: 'Access token obtained via the OAuth/partner flow (sent as Bearer token)',
				},
			],
			default: 'apiKey',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Create one in Brevo → Settings → SMTP & API → API Keys',
			displayOptions: { show: { authType: ['apiKey'] } },
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			displayOptions: { show: { authType: ['bearer'] } },
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.brevo.com/v3',
			description: 'Change only if you need to use a proxy or a different Brevo environment',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const headers = { ...(requestOptions.headers ?? {}) };
		if (credentials.authType === 'bearer') {
			headers.Authorization = `Bearer ${credentials.accessToken as string}`;
		} else {
			headers['api-key'] = credentials.apiKey as string;
		}
		return { ...requestOptions, headers };
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl || "https://api.brevo.com/v3"}}',
			url: '/account',
			method: 'GET',
		},
	};
}
