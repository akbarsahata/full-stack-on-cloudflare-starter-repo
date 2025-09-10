import { Env } from '@/bindings';
import { Db } from '@repo/data-ops/database';
import { getMyLink } from '@repo/data-ops/queries/links';
import { linkSchema, LinkSchemaType } from '@repo/data-ops/zod-schema/links';

async function getLinkInfoFromKv(env: Env, id: string) {
	const linkInfo = await env.CACHE.get(id);
	if (!linkInfo) return null;
	try {
		const parsedLinkInfo = JSON.parse(linkInfo);
		return linkSchema.parse(parsedLinkInfo);
	} catch (error) {
		return null;
	}
}

const TTL_TIME = 60 * 60 * 24; // 1 day

async function saveLinkInfoToKv(env: Env, id: string, linkInfo: LinkSchemaType) {
	try {
		await env.CACHE.put(id, JSON.stringify(linkInfo), {
			expirationTtl: TTL_TIME,
		});
	} catch (error) {
		console.error('Error saving link info to KV:', error);
	}
}

export async function getRoutingDestinations(args: { env: Env; id: string; db: Db; accountId: string }): Promise<LinkSchemaType | null> {
	const { env, id, db, accountId } = args;
	const linkInfo = await getLinkInfoFromKv(env, id);
	if (linkInfo) return linkInfo;
	const linkInfoFromDb = await getMyLink({
		db,
		linkId: id,
		accountId: accountId,
	});
	if (!linkInfoFromDb) return null;
	await saveLinkInfoToKv(env, id, linkInfoFromDb);
	return linkInfoFromDb;
}

export function getDestinationForCountry(linkInfo: LinkSchemaType, countryCode?: string) {
	if (!countryCode) {
		return linkInfo.destinations.default;
	}

	// Check if the country code exists in destinations
	if (linkInfo.destinations[countryCode]) {
		return linkInfo.destinations[countryCode];
	}

	// Fallback to default
	return linkInfo.destinations.default;
}
