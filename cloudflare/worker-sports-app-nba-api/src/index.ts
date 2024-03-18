/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	API_HOST: string;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {

		const url = new URL(request.url);
		const targetUrl = `${env.API_HOST}${url.pathname}${url.search}`;
		// Check if it's a preflight OPTIONS request
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
				}
			});
		}

		// For non-preflight requests, proxy to the target API
		const response = await fetch(targetUrl, {
			method: request.method,
			headers: request.headers
		});

		// Create a new Headers object to hold the response headers
		const headers = new Headers(response.headers);

		// Add the Access-Control-Allow-Origin header with a wildcard value (*)
		headers.set('Access-Control-Allow-Origin', '*');

		// Construct a new response with the modified headers
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: headers
		});
	},
};
