# Operations

Auto-generated from `@getbrevo/brevo` v6.2.0: **292 endpoints** across **35 resources**.

## Account

| Operation | Method | Path |
|---|---|---|
| Get Account | `GET` | `/account` |
| Get Account Activity | `GET` | `/organization/activities` |

## Balance (Loyalty)

| Operation | Method | Path |
|---|---|---|
| Begin Transaction | `POST` | `/loyalty/balance/programs/{pid}/transactions` |
| Cancel Transaction | `POST` | `/loyalty/balance/programs/{pid}/transactions/{tid}/cancel` |
| Complete Transaction | `POST` | `/loyalty/balance/programs/{pid}/transactions/{tid}/complete` |
| Create Balance Definition | `POST` | `/loyalty/balance/programs/{pid}/balance-definitions` |
| Create Balance Limit | `POST` | `/loyalty/balance/programs/{pid}/balance-definitions/{bdid}/limits` |
| Create Balance Order | `POST` | `/loyalty/balance/programs/{pid}/create-order` |
| Create Subscription Balances | `POST` | `/loyalty/balance/programs/{pid}/subscriptions/{cid}/balances` |
| Delete Balance Definition | `DELETE` | `/loyalty/balance/programs/{pid}/balance-definitions/{bdid}` |
| Delete Balance Limit | `DELETE` | `/loyalty/balance/programs/{pid}/balance-definitions/{bdid}/limits/{blid}` |
| Get Active Balances API | `GET` | `/loyalty/balance/programs/{pid}/active-balance` |
| Get Balance Definition | `GET` | `/loyalty/balance/programs/{pid}/balance-definitions/{bdid}` |
| Get Balance Definition List | `GET` | `/loyalty/balance/programs/{pid}/balance-definitions` |
| Get Balance Limit | `GET` | `/loyalty/balance/programs/{pid}/balance-definitions/{bdid}/limits/{blid}` |
| Get Contact Balances | `GET` | `/loyalty/balance/programs/{pid}/contact-balances` |
| Get Subscription Balances | `GET` | `/loyalty/balance/programs/{pid}/subscriptions/{cid}/balances` |
| Get Transaction History API | `GET` | `/loyalty/balance/programs/{pid}/transaction-history` |
| Update Balance Definition | `PUT` | `/loyalty/balance/programs/{pid}/balance-definitions/{bdid}` |
| Update Balance Limit | `PUT` | `/loyalty/balance/programs/{pid}/balance-definitions/{bdid}/limits/{blid}` |

## Company (CRM)

| Operation | Method | Path |
|---|---|---|
| Create A Company | `POST` | `/companies` |
| Create A Company Deal Attribute | `POST` | `/crm/attributes` |
| Delete A Company | `DELETE` | `/companies/{id}` |
| Delete An Attribute | `DELETE` | `/crm/attributes/{id}` |
| Get A Company | `GET` | `/companies/{id}` |
| Get All Companies | `GET` | `/companies` |
| Get Company Attributes | `GET` | `/crm/attributes/companies` |
| Import Companies Creation And Update | `POST` | `/companies/import` |
| Link And Unlink Company With Contact And Deal | `PATCH` | `/companies/link-unlink/{id}` |
| Update A Company | `PATCH` | `/companies/{id}` |
| Update An Attribute | `PATCH` | `/crm/attributes/{id}` |

## Consent Group

| Operation | Method | Path |
|---|---|---|
| Create Consent Group | `POST` | `/contacts/consent-groups` |
| Delete Consent Group | `DELETE` | `/contacts/consent-groups/{id}` |
| Get Consent Group | `GET` | `/contacts/consent-groups/{id}` |
| Get Consent Groups | `GET` | `/contacts/consent-groups` |
| Update Consent Group | `PUT` | `/contacts/consent-groups/{id}` |

## Contact

| Operation | Method | Path |
|---|---|---|
| Add Contact To List | `POST` | `/contacts/lists/{listId}/contacts/add` |
| Create Attribute | `POST` | `/contacts/attributes/{attributeCategory}/{attributeName}` |
| Create Contact | `POST` | `/contacts` |
| Create DOI Contact | `POST` | `/contacts/doubleOptinConfirmation` |
| Create Folder | `POST` | `/contacts/folders` |
| Create List | `POST` | `/contacts/lists` |
| Delete Attribute | `DELETE` | `/contacts/attributes/{attributeCategory}/{attributeName}` |
| Delete Contact | `DELETE` | `/contacts/{identifier}` |
| Delete Folder | `DELETE` | `/contacts/folders/{folderId}` |
| Delete List | `DELETE` | `/contacts/lists/{listId}` |
| Delete Multi Attribute Options | `DELETE` | `/contacts/attributes/{attributeType}/{multipleChoiceAttribute}/{multipleChoiceAttributeOption}` |
| Get Attributes | `GET` | `/contacts/attributes` |
| Get Contact Info | `GET` | `/contacts/{identifier}` |
| Get Contact Stats | `GET` | `/contacts/{identifier}/campaignStats` |
| Get Contacts | `GET` | `/contacts` |
| Get Contacts From List | `GET` | `/contacts/lists/{listId}/contacts` |
| Get Folder | `GET` | `/contacts/folders/{folderId}` |
| Get Folder Lists | `GET` | `/contacts/folders/{folderId}/lists` |
| Get Folders | `GET` | `/contacts/folders` |
| Get List | `GET` | `/contacts/lists/{listId}` |
| Get Lists | `GET` | `/contacts/lists` |
| Get Segments | `GET` | `/contacts/segments` |
| Import Contacts | `POST` | `/contacts/import` |
| Remove Contact From List | `POST` | `/contacts/lists/{listId}/contacts/remove` |
| Request Contact Export | `POST` | `/contacts/export` |
| Update Attribute | `PUT` | `/contacts/attributes/{attributeCategory}/{attributeName}` |
| Update Batch Contacts | `POST` | `/contacts/batch` |
| Update Contact | `PUT` | `/contacts/{identifier}` |
| Update Folder | `PUT` | `/contacts/folders/{folderId}` |
| Update List | `PUT` | `/contacts/lists/{listId}` |

## Conversation

| Operation | Method | Path |
|---|---|---|
| Delete A Message Sent By An Agent | `DELETE` | `/conversations/messages/{id}` |
| Delete An Automated Message | `DELETE` | `/conversations/pushedMessages/{id}` |
| Get A Message | `GET` | `/conversations/messages/{id}` |
| Get An Automated Message | `GET` | `/conversations/pushedMessages/{id}` |
| Send A Message As An Agent | `POST` | `/conversations/messages` |
| Send An Automated Message To A Visitor | `POST` | `/conversations/pushedMessages` |
| Set Visitor Group Assignment | `PUT` | `/conversations/visitorGroup` |
| Sets Agents Status To Online For23 Minutes | `POST` | `/conversations/agentOnlinePing` |
| Update A Message Sent By An Agent | `PUT` | `/conversations/messages/{id}` |
| Update An Automated Message | `PUT` | `/conversations/pushedMessages/{id}` |

## Coupon

| Operation | Method | Path |
|---|---|---|
| Create Coupon Collection | `POST` | `/couponCollections` |
| Create Coupons | `POST` | `/coupons` |
| Get Coupon Collection | `GET` | `/couponCollections/{id}` |
| Get Coupon Collections | `GET` | `/couponCollections` |
| Update Coupon Collection | `PATCH` | `/couponCollections/{id}` |

## Custom Object

| Operation | Method | Path |
|---|---|---|
| Batch Delete Object Records | `POST` | `/objects/{object_type}/batch/delete` |
| Get Associated Records | `GET` | `/objects/{object_type}/associated-records` |
| Getrecords | `GET` | `/objects/{object_type}/records` |
| Upsertrecords | `POST` | `/objects/{object_type}/batch/upsert` |

## Deal (CRM)

| Operation | Method | Path |
|---|---|---|
| Create A Deal | `POST` | `/crm/deals` |
| Delete A Deal | `DELETE` | `/crm/deals/{id}` |
| Get A Deal | `GET` | `/crm/deals/{id}` |
| Get A Pipeline | `GET` | `/crm/pipeline/details/{pipelineID}` |
| Get All Deals | `GET` | `/crm/deals` |
| Get All Pipelines | `GET` | `/crm/pipeline/details/all` |
| Get Deal Attributes | `GET` | `/crm/attributes/deals` |
| Get Pipeline Stages *(deprecated)* | `GET` | `/crm/pipeline/details` |
| Import Deals Creation And Update | `POST` | `/crm/deals/import` |
| Link And Unlink A Deal With Contacts And Companies | `PATCH` | `/crm/deals/link-unlink/{id}` |
| Update A Deal | `PATCH` | `/crm/deals/{id}` |

## Domain

| Operation | Method | Path |
|---|---|---|
| Authenticate Domain | `PUT` | `/senders/domains/{domainName}/authenticate` |
| Create Domain | `POST` | `/senders/domains` |
| Delete Domain | `DELETE` | `/senders/domains/{domainName}` |
| Get Domain Configuration | `GET` | `/senders/domains/{domainName}` |
| Get Domains | `GET` | `/senders/domains` |

## E-Commerce

| Operation | Method | Path |
|---|---|---|
| Activate The E Commerce App | `POST` | `/ecommerce/activate` |
| Create Batch Order | `POST` | `/orders/status/batch` |
| Create Order | `POST` | `/orders/status` |
| Create Product Alert | `POST` | `/products/{id}/alerts/{type}` |
| Create Update Batch Category | `POST` | `/categories/batch` |
| Create Update Batch Products | `POST` | `/products/batch` |
| Create Update Category | `POST` | `/categories` |
| Create Update Product | `POST` | `/products` |
| Get Attributed Product Sales For A Single Brevo Campaign Or Workflow | `GET` | `/ecommerce/attribution/products/{conversionSource}/{conversionSourceId}` |
| Get Attribution Metrics For One Or More Brevo Campaigns Or Workflows | `GET` | `/ecommerce/attribution/metrics` |
| Get Categories | `GET` | `/categories` |
| Get Category Info | `GET` | `/categories/{id}` |
| Get Detailed Attribution Metrics For A Single Brevo Campaign Or Workflow | `GET` | `/ecommerce/attribution/metrics/{conversionSource}/{conversionSourceId}` |
| Get Orders | `GET` | `/orders` |
| Get Product Info | `GET` | `/products/{id}` |
| Get Products | `GET` | `/products` |
| Get The Iso4217 Compliant Display Currency Code For Your Brevo Account | `GET` | `/ecommerce/config/displayCurrency` |
| Set Config Display Currency | `POST` | `/ecommerce/config/displayCurrency` |

## Email Campaign

| Operation | Method | Path |
|---|---|---|
| Create Email Campaign | `POST` | `/emailCampaigns` |
| Delete Email Campaign | `DELETE` | `/emailCampaigns/{campaignId}` |
| Email Export Recipients | `POST` | `/emailCampaigns/{campaignId}/exportRecipients` |
| Get A/B Test Campaign Result | `GET` | `/emailCampaigns/{campaignId}/abTestCampaignResult` |
| Get Email Campaign | `GET` | `/emailCampaigns/{campaignId}` |
| Get Email Campaigns | `GET` | `/emailCampaigns` |
| Get Shared Template URL | `GET` | `/emailCampaigns/{campaignId}/sharedUrl` |
| Send Email Campaign Now | `POST` | `/emailCampaigns/{campaignId}/sendNow` |
| Send Report | `POST` | `/emailCampaigns/{campaignId}/sendReport` |
| Send Test Email | `POST` | `/emailCampaigns/{campaignId}/sendTest` |
| Update Campaign Status | `PUT` | `/emailCampaigns/{campaignId}/status` |
| Update Email Campaign | `PUT` | `/emailCampaigns/{campaignId}` |
| Upload Image To Gallery | `POST` | `/emailCampaigns/images` |

## Event

| Operation | Method | Path |
|---|---|---|
| Create Batch Events | `POST` | `/events/batch` |
| Create Event | `POST` | `/events` |
| Get Events | `GET` | `/events` |

## External Feed

| Operation | Method | Path |
|---|---|---|
| Create External Feed | `POST` | `/feeds` |
| Delete External Feed | `DELETE` | `/feeds/{uuid}` |
| Get All External Feeds | `GET` | `/feeds` |
| Get External Feed By Uuid | `GET` | `/feeds/{uuid}` |
| Update External Feed | `PUT` | `/feeds/{uuid}` |

## File (CRM)

| Operation | Method | Path |
|---|---|---|
| Delete A File | `DELETE` | `/crm/files/{id}` |
| Download A File | `GET` | `/crm/files/{id}` |
| Get All Files | `GET` | `/crm/files` |
| Get File Details | `GET` | `/crm/files/{id}/data` |
| Upload A File | `POST` | `/crm/files` |

## Inbound Parsing

| Operation | Method | Path |
|---|---|---|
| Get Inbound Email Attachment | `GET` | `/inbound/attachments/{downloadToken}` |
| Get Inbound Email Events | `GET` | `/inbound/events` |
| Get Inbound Email Events By Uuid | `GET` | `/inbound/events/{uuid}` |

## Master Account

| Operation | Method | Path |
|---|---|---|
| Associate An IP To Sub Accounts | `POST` | `/corporate/subAccount/ip/associate` |
| Change Admin User Permissions | `PUT` | `/corporate/user/{email}/permissions` |
| Create A New Group Of Sub Accounts | `POST` | `/corporate/group` |
| Create A New Sub Account Under A Master Account | `POST` | `/corporate/subAccount` |
| Create An API Key For A Sub Account | `POST` | `/corporate/subAccount/key` |
| Delete A Group | `DELETE` | `/corporate/group/{id}` |
| Delete A Sub Account | `DELETE` | `/corporate/subAccount/{id}` |
| Delete Sub Account From Group | `PUT` | `/corporate/group/unlink/{groupId}/subAccounts` |
| Dissociate An IP To Sub Accounts | `PUT` | `/corporate/subAccount/ip/dissociate` |
| Enable Disable Sub Account Application S | `PUT` | `/corporate/subAccount/{id}/applications/toggle` |
| Generate SSO Token To Access Admin Account | `POST` | `/corporate/ssoToken` |
| Generate SSO Token To Access Sub Account | `POST` | `/corporate/subAccount/ssoToken` |
| Get A Group Details | `GET` | `/corporate/group/{id}` |
| Get Corporate Invited Users List | `GET` | `/corporate/invited/users` |
| Get Corporate User Permission | `GET` | `/corporate/user/{email}/permissions` |
| Get Sub Account Details | `GET` | `/corporate/subAccount/{id}` |
| Get Sub Account Groups | `GET` | `/corporate/groups` |
| Get The Details Of Requested Master Account | `GET` | `/corporate/masterAccount` |
| Get The List Of All The Sub Accounts Of The Master Account | `GET` | `/corporate/subAccount` |
| Invite Admin User | `POST` | `/corporate/user/invitation/send` |
| List Of All I Ps | `GET` | `/corporate/ip` |
| Resend Cancel Admin User Invitation | `PUT` | `/corporate/user/invitation/{action}/{email}` |
| Revoke An Admin User | `DELETE` | `/corporate/user/revoke/{email}` |
| Update A Group Of Sub Accounts | `PUT` | `/corporate/group/{id}` |
| Update Sub Account Plan | `PUT` | `/corporate/subAccount/{id}/plan` |
| Update Sub Accounts Plan | `PUT` | `/corporate/subAccounts/plan` |

## Note (CRM)

| Operation | Method | Path |
|---|---|---|
| Create A Note | `POST` | `/crm/notes` |
| Delete A Note | `DELETE` | `/crm/notes/{id}` |
| Get A Note | `GET` | `/crm/notes/{id}` |
| Get All Notes | `GET` | `/crm/notes` |
| Update A Note | `PATCH` | `/crm/notes/{id}` |

## OAuth

| Operation | Method | Path |
|---|---|---|
| Get OAuth M2M Token | `POST` | `/realms/partner/oauth/token` |

## Payment

| Operation | Method | Path |
|---|---|---|
| Create Payment Request | `POST` | `/payments/requests` |
| Delete Payment Request | `DELETE` | `/payments/requests/{id}` |
| Get Payment Request | `GET` | `/payments/requests/{id}` |

## Process

| Operation | Method | Path |
|---|---|---|
| Get Process | `GET` | `/processes/{processId}` |
| Get Processes | `GET` | `/processes` |

## Program (Loyalty)

| Operation | Method | Path |
|---|---|---|
| Create New Lp | `POST` | `/loyalty/config/programs` |
| Delete Contact Members | `DELETE` | `/loyalty/config/programs/{pid}/subscription-members` |
| Delete Contact Subscription | `DELETE` | `/loyalty/config/programs/{pid}/contact/{cid}` |
| Delete Loyalty Program | `DELETE` | `/loyalty/config/programs/{pid}` |
| Get Loyalty Program Info | `GET` | `/loyalty/config/programs/{pid}` |
| Get Lp List | `GET` | `/loyalty/config/programs` |
| Get Parameter Subscription Info | `GET` | `/loyalty/config/programs/{pid}/account-info` |
| Partially Update Loyalty Program | `PATCH` | `/loyalty/config/programs/{pid}` |
| Publish Loyalty Program | `POST` | `/loyalty/config/programs/{pid}/publish` |
| Subscribe Member To A Subscription | `POST` | `/loyalty/config/programs/{pid}/subscription-members` |
| Subscribe To Loyalty Program | `POST` | `/loyalty/config/programs/{pid}/subscriptions` |
| Update Loyalty Program | `PUT` | `/loyalty/config/programs/{pid}` |

## Reward (Loyalty)

| Operation | Method | Path |
|---|---|---|
| Complete Redeem Transaction | `POST` | `/loyalty/offer/programs/{pid}/rewards/redeem/{tid}/complete` |
| Create Reward | `POST` | `/loyalty/offer/programs/{pid}/offers` |
| Create Voucher | `POST` | `/loyalty/offer/programs/{pid}/rewards/attribute` |
| Get Code Count | `GET` | `/loyalty/offer/programs/{pid}/code-pools/{cpid}/codes-count` |
| Get Reward Information | `GET` | `/loyalty/offer/programs/{pid}/rewards/{rid}` |
| Get Reward Page API | `GET` | `/loyalty/offer/programs/{pid}/offers` |
| Get Voucher For A Contact | `GET` | `/loyalty/offer/programs/{pid}/vouchers` |
| Redeem Voucher | `POST` | `/loyalty/offer/programs/{pid}/rewards/redeem` |
| Revoke Vouchers | `DELETE` | `/loyalty/offer/programs/{pid}/rewards/revoke` |
| Validate Reward | `POST` | `/loyalty/offer/programs/{pid}/rewards/validate` |

## Sender

| Operation | Method | Path |
|---|---|---|
| Create Sender | `POST` | `/senders` |
| Delete Sender | `DELETE` | `/senders/{senderId}` |
| Get IPs | `GET` | `/senders/ips` |
| Get IPs From Sender | `GET` | `/senders/{senderId}/ips` |
| Get Senders | `GET` | `/senders` |
| Update Sender | `PUT` | `/senders/{senderId}` |
| Validate Sender By Otp | `PUT` | `/senders/{senderId}/validate` |

## SMS Campaign

| Operation | Method | Path |
|---|---|---|
| Create SMS Campaign | `POST` | `/smsCampaigns` |
| Delete SMS Campaign | `DELETE` | `/smsCampaigns/{campaignId}` |
| Get SMS Campaign | `GET` | `/smsCampaigns/{campaignId}` |
| Get SMS Campaigns | `GET` | `/smsCampaigns` |
| Request SMS Recipient Export | `POST` | `/smsCampaigns/{campaignId}/exportRecipients` |
| Send SMS Campaign Now | `POST` | `/smsCampaigns/{campaignId}/sendNow` |
| Send SMS Report | `POST` | `/smsCampaigns/{campaignId}/sendReport` |
| Send Test SMS | `POST` | `/smsCampaigns/{campaignId}/sendTest` |
| Update SMS Campaign | `PUT` | `/smsCampaigns/{campaignId}` |
| Update SMS Campaign Status | `PUT` | `/smsCampaigns/{campaignId}/status` |

## SMS Template

| Operation | Method | Path |
|---|---|---|
| Get SMS Templates | `GET` | `/transactionalSMS/templates` |

## Task (CRM)

| Operation | Method | Path |
|---|---|---|
| Create A Task | `POST` | `/crm/tasks` |
| Delete A Task | `DELETE` | `/crm/tasks/{id}` |
| Get A Task | `GET` | `/crm/tasks/{id}` |
| Get All Task Types | `GET` | `/crm/tasktypes` |
| Get All Tasks | `GET` | `/crm/tasks` |
| Update A Task | `PATCH` | `/crm/tasks/{id}` |

## Tier (Loyalty)

| Operation | Method | Path |
|---|---|---|
| Add Subscription To Tier | `POST` | `/loyalty/tier/programs/{pid}/contacts/{cid}/tiers/{tid}` |
| Create Tier For Tier Group | `POST` | `/loyalty/tier/programs/{pid}/tier-groups/{gid}/tiers` |
| Create Tier Group | `POST` | `/loyalty/tier/programs/{pid}/tier-groups` |
| Delete Tier | `DELETE` | `/loyalty/tier/programs/{pid}/tiers/{tid}` |
| Delete Tier Group | `DELETE` | `/loyalty/tier/programs/{pid}/tier-groups/{gid}` |
| Get List Of Tier Groups | `GET` | `/loyalty/tier/programs/{pid}/tier-groups` |
| Get Loyalty Program Tier | `GET` | `/loyalty/tier/programs/{pid}/tiers` |
| Get Tier Group | `GET` | `/loyalty/tier/programs/{pid}/tier-groups/{gid}` |
| Update Tier | `PUT` | `/loyalty/tier/programs/{pid}/tiers/{tid}` |
| Update Tier Group | `PUT` | `/loyalty/tier/programs/{pid}/tier-groups/{gid}` |

## Transactional Email

| Operation | Method | Path |
|---|---|---|
| Block New Domain | `POST` | `/smtp/blockedDomains` |
| Create SMTP Template | `POST` | `/smtp/templates` |
| Delete An SMTP Transactional Log | `DELETE` | `/smtp/log/{identifier}` |
| Delete Blocked Domain | `DELETE` | `/smtp/blockedDomains/{domain}` |
| Delete Hardbounces | `POST` | `/smtp/deleteHardbounces` |
| Delete Scheduled Email By ID | `DELETE` | `/smtp/email/{identifier}` |
| Delete SMTP Template | `DELETE` | `/smtp/templates/{templateId}` |
| Get Aggregated SMTP Report | `GET` | `/smtp/statistics/aggregatedReport` |
| Get Blocked Domains | `GET` | `/smtp/blockedDomains` |
| Get Email Event Report | `GET` | `/smtp/statistics/events` |
| Get Scheduled Email By ID | `GET` | `/smtp/emailStatus/{identifier}` |
| Get SMTP Report | `GET` | `/smtp/statistics/reports` |
| Get SMTP Template | `GET` | `/smtp/templates/{templateId}` |
| Get SMTP Templates | `GET` | `/smtp/templates` |
| Get Transactional Blocked Contacts | `GET` | `/smtp/blockedContacts` |
| Get Transactional Email Content | `GET` | `/smtp/emails/{uuid}` |
| Get Transactional Emails List | `GET` | `/smtp/emails` |
| Post Preview SMTP Email Templates | `POST` | `/smtp/template/preview` |
| Send Test Template | `POST` | `/smtp/templates/{templateId}/sendTest` |
| Send Transactional Email | `POST` | `/smtp/email` |
| Unblock Or Resubscribe A Transactional Contact | `DELETE` | `/smtp/blockedContacts/{email}` |
| Update SMTP Template | `PUT` | `/smtp/templates/{templateId}` |

## Transactional SMS

| Operation | Method | Path |
|---|---|---|
| Get SMS Events | `GET` | `/transactionalSMS/statistics/events` |
| Get Transactional Aggregated SMS Report | `GET` | `/transactionalSMS/statistics/aggregatedReport` |
| Get Transactional SMS Report | `GET` | `/transactionalSMS/statistics/reports` |
| Send Async Transactional SMS | `POST` | `/transactionalSMS/send` |
| Send Transactional SMS *(deprecated)* | `POST` | `/transactionalSMS/sms` |

## Transactional WhatsApp

| Operation | Method | Path |
|---|---|---|
| Get WhatsApp Event Report | `GET` | `/whatsapp/statistics/events` |
| Send WhatsApp Message | `POST` | `/whatsapp/sendMessage` |

## User

| Operation | Method | Path |
|---|---|---|
| Edit User Permission | `POST` | `/organization/user/update/permissions` |
| Get Invited Users List | `GET` | `/organization/invited/users` |
| Get User Permission | `GET` | `/organization/user/{email}/permissions` |
| Inviteuser | `POST` | `/organization/user/invitation/send` |
| Put Revoke User Permission | `PUT` | `/organization/user/invitation/revoke/{email}` |
| Putresendcancelinvitation | `PUT` | `/organization/user/invitation/{action}/{email}` |

## Wallet (Loyalty)

| Operation | Method | Path |
|---|---|---|
| Get Wallet Pass Install URL | `GET` | `/wallet/passes/{passId}/installUrl/{contactId}` |

## Webhook

| Operation | Method | Path |
|---|---|---|
| Create Webhook | `POST` | `/webhooks` |
| Delete Webhook | `DELETE` | `/webhooks/{webhookId}` |
| Export Webhooks History | `POST` | `/webhooks/export` |
| Get Webhook | `GET` | `/webhooks/{webhookId}` |
| Get Webhooks | `GET` | `/webhooks` |
| Update Webhook | `PUT` | `/webhooks/{webhookId}` |

## WhatsApp Campaign

| Operation | Method | Path |
|---|---|---|
| Create WhatsApp Campaign | `POST` | `/whatsappCampaigns` |
| Create WhatsApp Template | `POST` | `/whatsappCampaigns/template` |
| Delete WhatsApp Campaign | `DELETE` | `/whatsappCampaigns/{campaignId}` |
| Get WhatsApp Campaign | `GET` | `/whatsappCampaigns/{campaignId}` |
| Get WhatsApp Campaigns | `GET` | `/whatsappCampaigns` |
| Get WhatsApp Config | `GET` | `/whatsappCampaigns/config` |
| Get WhatsApp Templates | `GET` | `/whatsappCampaigns/template-list` |
| Send WhatsApp Template Approval | `POST` | `/whatsappCampaigns/template/approval/{templateId}` |
| Update WhatsApp Campaign | `PUT` | `/whatsappCampaigns/{campaignId}` |
