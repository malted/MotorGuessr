<script>
	import Camera from "$lib/Camera.svelte";
	import Map from "$lib/Map.svelte";

	export let data;
</script>

<main>
	<Camera {data} />

	<Map />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		margin: 0;
		height: 100%;
	}
</style>
