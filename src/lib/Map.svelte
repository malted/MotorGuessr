<script>
	import mapboxgl from "mapbox-gl";
	import { PUBLIC_MAPBOX_TOKEN } from "$env/static/public";
	import { onMount } from "svelte";
	import { clickCoords, mapObject, clickMarker, guessed } from "$lib/stores.js";

	let container;
	let map;
	let height;

	const date = new Date();
	const isNight = date.getHours() > 8 || date.getHours() < 6;

	onMount(() => {
		mapboxgl.accessToken = PUBLIC_MAPBOX_TOKEN;
		map = new mapboxgl.Map({
			container,
			style: `mapbox://styles/mapbox/navigation-${isNight ? "night" : "day"}-v1`,
			center: [-0.8, 52.5],
			zoom: 6,
			maxBounds: [
				[-12, 48],
				[8, 58]
			]
		});
		map.addControl(new mapboxgl.NavigationControl());

		clickMarker.set(new mapboxgl.Marker({ color: "#db0f0f" }));

		map.on("click", ({ lngLat }) => {
			if ($guessed) return;

			$clickMarker.setLngLat([lngLat.lng, lngLat.lat]);
			if (!$clickCoords) $clickMarker.addTo(map);
			clickCoords.set(lngLat);
		});

		mapObject.set(map);

		$mapObject.loadImage("/favicon.png", (error, image) => {
			if (error) throw error;

			// Add the image to the map style.
			$mapObject.addImage("cameraIcon", image);
		});
	});

	let mouseDown;
	const mouseMoveHandler = ({ clientY }) => {
		if (mouseDown) {
			height = window.innerHeight - clientY + "px";
			map.resize();
		}
	};

	const mouseUpHandler = () => (mouseDown = false);
	const mouseDownHandler = () => (mouseDown = true);
</script>

<svelte:head>
	<link href="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css" rel="stylesheet" />
</svelte:head>

<svelte:body
	on:mouseup={mouseUpHandler}
	on:touchend={mouseUpHandler}
	on:mousemove={mouseMoveHandler}
	on:touchmove={mouseMoveHandler}
/>

<div id="parent">
	<div id="resize" on:mousedown={mouseDownHandler} on:touchstart={mouseDownHandler}>
		<svg fill="white" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 96 960 960">
			<path d="M160 666v-60h640v60H160Zm0-120v-60h640v60H160Z" />
		</svg>
	</div>
	<div id="map-container" bind:this={container} style:height />
</div>

<style>
	#parent {
		position: relative;
		margin-top: 1rem;
	}

	#map-container {
		height: 50vh;
		min-height: 20vh;
		max-height: 80vh;
	}

	#resize {
		position: absolute;
		width: 100%;
		height: 1rem;
		background-color: #5d757e;
		border: 1px solid #2f343b;
		top: -1rem;
		z-index: 1;
		cursor: grab;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	#resize:active {
		cursor: grabbing;
	}
</style>
