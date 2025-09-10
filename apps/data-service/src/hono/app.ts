import { Env } from '@/bindings';
import { getDestinationForCountry, getRoutingDestinations } from '@/helpers/route-ops';
import { Db, getDb } from '@repo/data-ops/database';
import { cloudflareInfoSchema } from '@repo/data-ops/zod-schema/links';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';

interface HonoEnv extends Env {
	Bindings: Env;
	Variables: {
		db: Db;
		accountId: string;
	};
}

export const app = new Hono<HonoEnv>();

const setDbClientMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
	c.set('db', getDb());
	await next();
});

const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
	c.set('accountId', '1234567890'); // TODO: Replace with actual account ID from auth
	await next();
});

app.use(setDbClientMiddleware);

app.use(authMiddleware);

app.get('/:id', async (c) => {
	const id = c.req.param('id');

	const linkInfo = await getRoutingDestinations({
		env: c.env,
		id,
		db: c.get('db'),
		accountId: c.get('accountId'),
	});
	if (!linkInfo) {
		return c.text('Destination not found', 404);
	}

	const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	if (!cfHeader.success) {
		return c.text('Invalid Cloudflare headers', 400);
	}

	const headers = cfHeader.data;
	const destination = getDestinationForCountry(linkInfo, headers.country);

	return c.redirect(destination);
});

app.get('/', (c) => {
	console.log(JSON.stringify(c.req.raw.cf, null, 2));
	const country = c.req.raw.cf?.country || 'unknown';
	const city = c.req.raw.cf?.city || 'unknown';
	const postalCode = c.req.raw.cf?.postalCode || 'unknown';
	const regionCode = c.req.raw.cf?.regionCode || 'unknown';
	const timezone = c.req.raw.cf?.timezone || 'unknown';
	const isp = c.req.raw.cf?.asOrganization || 'unknown';
	const coordinates = {
		latitude: c.req.raw.cf?.latitude || 'unknown',
		longitude: c.req.raw.cf?.longitude || 'unknown',
	};

	return c.json({ country, city, postalCode, regionCode, timezone, isp, coordinates });
});

app.get('/health', (c) => {
	return c.text('OK');
});
