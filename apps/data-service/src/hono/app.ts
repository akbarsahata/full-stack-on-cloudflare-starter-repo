import { Hono } from 'hono';

export const app = new Hono<{ Bindings: Env }>();

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
