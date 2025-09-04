import { getDb } from "@/db/database";
import { links } from "@/drizzle-out/schema";
import { CreateLinkSchemaType, destinationsSchema, DestinationsSchemaType, linkSchema, LinkSchemaType } from "@/zod/links";
import { and, desc, eq, gt } from "drizzle-orm";
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

export async function getMyLink(
  linkId: LinkSchemaType["linkId"],
  accountId: LinkSchemaType["accountId"]
): Promise<LinkSchemaType | null> {
  const db = getDb();

  const link = await db
    .select()
    .from(links)
    .where(and(eq(links.linkId, linkId), eq(links.accountId, accountId)))
    .limit(1)
    .get();

  if (!link) {
    return null;
  }

  const parsed = linkSchema.safeParse(link);
  if (!parsed.success) {
    throw new Error("Link data is corrupted");
  }

  return parsed.data;
}

export async function getMyLinks(args: {
  accountId: LinkSchemaType["accountId"];
  createdBefore?: string;
  offset?: number;
  limit?: number;
}) {
  const { accountId, offset = 0, limit = 20 } = args;

  const db = getDb();

  const filters = [eq(links.accountId, accountId)];

  if (args.createdBefore) {
    filters.push(gt(links.created, args.createdBefore));
  }

  const linksList = await db
    .select({
      linkId: links.linkId,
      destinations: links.destinations,
      created: links.created,
      name: links.name,
    })
    .from(links)
    .where(and(...filters))
    .orderBy(desc(links.created))
    .limit(25);

  return linksList.map((link) => ({
    ...link,
    lastSixHours: Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 100)
    ),
    linkClicks: 6,
    destinations: Object.keys(JSON.parse(link.destinations as string)).length,
  }));
}

export async function updateLinkDestinations(
    linkId: string,
    destinations: DestinationsSchemaType,
  ) {
    const destinationsParsed = destinationsSchema.parse(destinations);
    const db = getDb();
    await db
      .update(links)
      .set({
        destinations: JSON.stringify(destinationsParsed),
        updated: new Date().toISOString(),
      })
      .where(eq(links.linkId, linkId));
  }
