const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/;
const ALLOWED_ORIGIN = "https://clouds.danateagle.com";

export default async (request: Request, context: { next: () => Promise<Response> }) => {
    const response = await context.next();
    const origin = request.headers.get("origin");

    if (origin && (origin === ALLOWED_ORIGIN || LOCALHOST_ORIGIN.test(origin))) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Vary", "Origin");
    }

    return response;
};
