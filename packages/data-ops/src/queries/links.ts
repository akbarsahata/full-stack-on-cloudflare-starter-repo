import { getDb } from '@/db/database';
import { links } from '@/drizzle-out/schema';
import { CreateLinkSchemaType } from '@/zod/links';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function createLink(data: CreateLinkSchemaType & { accountId: string }) {
    const db = getDb();

    const id = nanoid(10);

    const values = {
        linkId: id,
        accountId: data.accountId,
        name: data.name,
        destinations: JSON.stringify(data.destinations),
    };
    
    const [result] = await db.insert(links).values(values).returning({ linkId: links.linkId });

    return result.linkId;
}