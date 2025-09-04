import { getDb } from "@/db/database";
import { links } from "@/drizzle-out/schema";
import { CreateLinkSchemaType, LinkSchemaType } from "@/zod/links";
import { nanoid } from "nanoid";

export async function createLink(
  data: CreateLinkSchemaType & { accountId: string }
): Promise<LinkSchemaType["linkId"]> {
  const db = getDb();

  const id = nanoid(10);

  const values = {
    linkId: id,
    accountId: data.accountId,
    name: data.name,
    destinations: JSON.stringify(data.destinations),
  };

  const [result] = await db.insert(links).values(values).returning();

  return result.linkId;
}
