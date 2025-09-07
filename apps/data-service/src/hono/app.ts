import { Env } from '@/bindings';
import { Db, getDb } from '@repo/data-ops/database';
import { getMyLink } from '@repo/data-ops/queries/links';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';

interface HonoEnv extends Env {
    Bindings: Env;
    Variables: {
        db: Db;
    }
}

export const app = new Hono<HonoEnv>();

const setDbClientMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
	c.set('db', getDb());
	await next();
});

app.use(setDbClientMiddleware);

app.get('/:id', async (c) => {
	const id = c.req.param('id');

	const link = await getMyLink({
        db: c.var.db,
        linkId: id,
        accountId: '1234567890', // TODO: Replace with actual account ID from auth
    });

	if (!link) {
		return c.json({ error: 'Link not found' }, 404);
	}

	return c.json({ link });
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
