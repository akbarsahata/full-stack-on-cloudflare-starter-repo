import { Env } from '@/bindings';
import { getDb, initDatabase } from '@repo/data-ops/database';
import { WorkerEntrypoint } from 'cloudflare:workers';
import { app } from './hono/app';
import { QueueMessageSchema, QueueMessageType } from '@repo/data-ops/zod-schema/queue';
import { handleLinkClick } from './queue-handlers/link-clicks';

export { DestinationEvaluationWorkflow } from './workflows/destination-evaluation-workflow';

export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		initDatabase(env.DB);
	}
	fetch(request: Request) {
		return app.fetch(request, this.env, this.ctx);
	}
	async queue(batch: MessageBatch<QueueMessageType>) {
		for (const message of batch.messages) {
			const parsedEvent = QueueMessageSchema.safeParse(message.body);
			if (parsedEvent.success) {
				const event = parsedEvent.data;
				if (event.type === "LINK_CLICK") {
					await handleLinkClick(getDb(), event)
				}
			} else {
				console.error(parsedEvent.error)
			}
		}
	}
}
