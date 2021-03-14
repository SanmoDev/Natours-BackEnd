/*eslint-disable*/

export const displayMap = locations => {
	mapboxgl.accessToken =
		'pk.eyJ1IjoiaWNhcm9tb3R0YSIsImEiOiJja2pyOW12bG4xOXMzMnNrM3NvMzVkM2JlIn0.n0LIYCjkhhmlsxXUD0ydYw';

	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/icaromotta/ckm7s8kj00jvf17qs1w7h8l72',
		scrollZoom: false,
	});

	const bounds = new mapboxgl.LngLatBounds();

	locations.forEach(loc => {
		//CREATE MARKER
		const el = document.createElement('div');
		el.className = 'marker';

		//ADD MARKER
		new mapboxgl.Marker({
			element: el,
			anchor: 'bottom',
		})
			.setLngLat(loc.coordinates)
			.addTo(map);

		//POPUP
		new mapboxgl.Popup({
			offset: 30,
		})
			.setLngLat(loc.coordinates)
			.setHTML(`<p>Day${loc.day}: ${loc.description}</p>`)
			.addTo(map);

		//EXTEND MAP TO FIT MARKERS
		bounds.extend(loc.coordinates);
	});

	map.fitBounds(bounds, {
		padding: {
			top: 200,
			bottom: 150,
			left: 100,
			right: 100,
		},
	});
};
