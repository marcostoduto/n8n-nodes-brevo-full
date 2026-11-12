import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

import { brevoRequest, CREDENTIAL_NAME, isPlainObject } from './GenericFunctions';

const TRANSACTIONAL_EVENTS = [
	['Blocked', 'blocked'],
	['Click', 'click'],
	['Deferred', 'deferred'],
	['Delivered', 'delivered'],
	['Hard Bounce', 'hardBounce'],
	['Invalid', 'invalid'],
	['Opened', 'opened'],
	['Reply', 'reply'],
	['Request (Sent)', 'request'],
	['Sent', 'sent'],
	['Soft Bounce', 'softBounce'],
	['Spam', 'spam'],
	['Unique Opened', 'uniqueOpened'],
	['Unsubscribed', 'unsubscribed'],
];

const MARKETING_EVENTS = [
	['Click', 'click'],
	['Contact Deleted', 'contactDeleted'],
	['Contact Updated', 'contactUpdated'],
	['Delivered', 'delivered'],
	['Hard Bounce', 'hardBounce'],
	['List Addition', 'listAddition'],
	['Opened', 'opened'],
	['Soft Bounce', 'softBounce'],
	['Spam', 'spam'],
	['Unsubscribed', 'unsubscribed'],
];

const toOptions = (list: string[][]) => list.map(([name, value]) => ({ name, value }));

export class BrevoFullTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Brevo (Full API) Trigger',
		name: 'brevoFullTrigger',
		icon: 'file:brevo.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["type"]}}',
		description: 'Starts the workflow when Brevo webhook events occur (webhook is registered automatically)',
		defaults: { name: 'Brevo Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: CREDENTIAL_NAME, required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Webhook Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Inbound', value: 'inbound' },
					{ name: 'Marketing', value: 'marketing' },
					{ name: 'Transactional', value: 'transactional' },
				],
				default: 'transactional',
				required: true,
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: toOptions(TRANSACTIONAL_EVENTS),
				default: [],
				required: true,
				description: 'Note: "Sent" and "Request" cannot be selected together',
				displayOptions: { show: { type: ['transactional'] } },
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: toOptions(MARKETING_EVENTS),
				default: [],
				required: true,
				displayOptions: { show: { type: ['marketing'] } },
			},
			{
				displayName: 'Inbound Domain',
				name: 'domain',
				type: 'string',
				default: '',
				required: true,
				description: 'Inbound domain configured in Brevo for inbound parsing',
				displayOptions: { show: { type: ['inbound'] } },
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Batched',
						name: 'batched',
						type: 'boolean',
						default: false,
						description: 'Whether Brevo should send events in batches (each event becomes one n8n item)',
					},
					{
						displayName: 'Channel',
						name: 'channel',
						type: 'options',
						options: [
							{ name: 'Email', value: 'email' },
							{ name: 'SMS', value: 'sms' },
						],
						default: 'email',
						description: 'Channel of the webhook (transactional only)',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Auth Token',
						name: 'authToken',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						description:
							'If set, Brevo sends it as a Bearer token and incoming requests without it are rejected',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const type = this.getNodeParameter('type') as string;
				try {
					const res = await brevoRequest.call(this, {
						method: 'GET',
						path: '/webhooks',
						query: [['type', type]],
					});
					const list = (isPlainObject(res.body) ? (res.body.webhooks as IDataObject[]) : []) ?? [];
					const found = list.find((w) => w.url === webhookUrl && w.type === type);
					if (found) {
						staticData.webhookId = found.id as number;
						return true;
					}
				} catch {
					return false;
				}
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const type = this.getNodeParameter('type') as string;
				const options = this.getNodeParameter('options', {}) as IDataObject;
				const body: IDataObject = { url: webhookUrl, type };
				if (type === 'inbound') {
					body.events = ['inboundEmailProcessed'];
					body.domain = this.getNodeParameter('domain') as string;
				} else {
					body.events = this.getNodeParameter('events') as string[];
					if (type === 'transactional' && options.channel) body.channel = options.channel;
				}
				if (options.batched) body.batched = true;
				body.description = (options.description as string) || 'n8n workflow trigger';
				if (options.authToken) body.auth = { type: 'bearer', token: options.authToken };

				const res = await brevoRequest.call(this, { method: 'POST', path: '/webhooks', bodyMode: 'json', body });
				const id = isPlainObject(res.body) ? res.body.id : undefined;
				if (id === undefined) return false;
				staticData.webhookId = id as number;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				if (staticData.webhookId !== undefined) {
					try {
						await brevoRequest.call(this, {
							method: 'DELETE',
							path: `/webhooks/${encodeURIComponent(String(staticData.webhookId))}`,
						});
					} catch {
						return false;
					}
					delete staticData.webhookId;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const options = this.getNodeParameter('options', {}) as IDataObject;
		if (options.authToken) {
			const auth = (this.getHeaderData() as IDataObject).authorization as string | undefined;
			if (auth !== `Bearer ${options.authToken as string}`) {
				const res = this.getResponseObject();
				res.status(401).send('Unauthorized');
				return { noWebhookResponse: true };
			}
		}
		const body = this.getBodyData() as IDataObject | IDataObject[];
		const events = Array.isArray(body) ? body : [body];
		return {
			workflowData: [events.map((e) => ({ json: e }))],
		};
	}
}
