<script>
	import { clickCoords, mapObject, clickMarker, guessed } from "$lib/stores.js";
	import { fly } from "svelte/transition";
	import mapboxGl from "mapbox-gl";
	import { distanceInKmBetweenEarthCoordinates } from "./coordinates";

	export let data;

	$: src = data.url.replace("/html/", "/images/").replace(".html", ".jpg");

	function guess() {
		guessed.set(true);

		const geojson = {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					geometry: {
						type: "LineString",
						properties: {},
						coordinates: [
							[$clickCoords.lng, $clickCoords.lat],
							[data.longitude, data.latitude]
						]
					}
				}
			]
		};

		$mapObject.addSource("LineString", {
			type: "geojson",
			data: geojson
		});
		$mapObject.addLayer({
			id: "LineString",
			type: "line",
			source: "LineString",
			layout: {
				"line-join": "round",
				"line-cap": "round"
			},
			paint: {
				"line-color": "#ffd307",
				"line-width": 5
			}
		});

		// Add a data source containing one point feature.
		$mapObject.addSource("point", {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: [
					{
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: [data.longitude, data.latitude]
						}
					}
				]
			}
		});
		$mapObject.addLayer({
			id: "cameraIconLayer",
			type: "symbol",
			source: "point", // reference the data source
			layout: {
				"icon-image": "cameraIcon", // reference the image
				"icon-size": 0.15
			}
		});

		const coordinates = geojson.features[0].geometry.coordinates;

		// Create a 'LngLatBounds' with both corners at the first coordinate.
		const bounds = new mapboxGl.LngLatBounds(coordinates[0], coordinates[0]);

		// Extend the 'LngLatBounds' to include every coordinate in the bounds result.
		for (const coord of coordinates) {
			bounds.extend(coord);
		}

		$mapObject.fitBounds(bounds, {
			padding: 50
		});
	}

	async function again() {
		const res = await fetch("/api/randcam");
		data = await res.json();

		clickCoords.set(null);
		guessed.set(false);
		$mapObject.removeLayer("LineString");
		$mapObject.removeSource("LineString");
		$clickMarker.remove();
		$mapObject.removeLayer("cameraIconLayer");
		$mapObject.removeSource("point");

		$mapObject.easeTo({ zoom: 6, duration: 3000 });
	}
</script>

<div id="parent">
	<img {src} alt="camera" draggable="false" />
	<div id="info-container">
		<h2>Locate the motorway camera</h2>
		{#if $clickCoords}
			{#if $guessed}
				<p in:fly={{ y: -50 }}>
					You were <b
						>{Math.round(
							distanceInKmBetweenEarthCoordinates(
								$clickCoords.lat,
								$clickCoords.lng,
								data.latitude,
								data.longitude
							) * 10
						) / 10}</b
					> KM away
				</p>
				<p in:fly={{ y: -100 }}>This is the <b>{data.description}</b></p>
				<button on:click={again} in:fly={{ y: -150 }}>Play Again</button>
			{:else}
				<button in:fly={{ y: -50 }} on:click={guess}>Confirm Guess</button>
			{/if}
		{:else}
			<p in:fly={{ y: -50 }}>Select a location on the map to guess</p>
		{/if}
	</div>
</div>

<style>
	#parent {
		height: 100%;
		width: 100%;
		position: relative;
		overflow: hidden;
		display: flex;
	}
	#parent * {
		text-transform: uppercase;
		margin: 0;
	}
	img {
		height: 100%;
		width: auto;
		aspect-ratio: 720/576;
		user-select: none;
		object-fit: contain;
	}

	#info-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3rem;
		width: 100%;
		height: 100%;
		margin: 1rem;
	}
	button {
		margin: 0;
		font-family: "DVLA";
		padding: 1rem;
		font-size: 1.2rem;
		text-align: center;
		background-color: #ffd307;
		border-radius: 0.25em;
		text-transform: uppercase;
		outline-color: transparent;
		border: none;
		cursor: pointer;
		transition: scale 0.1s;
	}
	button:hover {
		scale: 1.5;
	}

	h2 {
		font-size: 2rem;
	}
	p {
		font-size: 1.2rem;
	}
</style>
