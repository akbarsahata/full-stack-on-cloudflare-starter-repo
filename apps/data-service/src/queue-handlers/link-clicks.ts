
import { Env } from '@/bindings';
import { Db } from '@repo/data-ops/database';
import { addLinkClick } from '@repo/data-ops/queries/link-clicks';
import { LinkClickMessageType } from "@repo/data-ops/zod-schema/queue";


export async function handleLinkClick(db: Db, event: LinkClickMessageType) {
	await addLinkClick({
        db: db,
        info: event.data,
    });
}
