export async function load({ fetch }) {
	const res = await fetch("/api/randcam");
	const data = await res.json();

	return { ...data };
}
