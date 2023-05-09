export async function GET({ fetch }) {
	const response = await fetch("/cameras.json");
	const data = await response.json();
	const random = Math.floor(Math.random() * data.length);

	return new Response(JSON.stringify(data[random]));
}
