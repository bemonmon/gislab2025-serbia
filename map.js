// --- Extent for PNG image in EPSG:4326 (converted to EPSG:3857)
const aadExtent3857 = ol.proj.transformExtent(
  [18.8, 42.2, 23.0, 46.2],  // lon/lat bounds of Serbia
  'EPSG:4326',
  'EPSG:3857'
);

// --- PM10 AAD PNG Layer ---
const aadPngLayer = new ol.layer.Image({
  source: new ol.source.ImageStatic({
    url: 'assets/images/AAD_map_overlay.png',
    imageExtent: aadExtent3857,
    projection: 'EPSG:3857'
  }),
  opacity: 0.7,
  title: 'PM10 AAD Overlay'
});

// --- Bivariate Vector Layer ---
const bivariateLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'assets/data/serbia_bivariate.geojson',
    format: new ol.format.GeoJSON()
  }),
  style: function (feature) {
    const code = feature.get('bivariate');
    const colorMap = {
      '11': '#ffffff',
      '12': '#ffe0ea',
      '13': '#ffc9dc',
      '14': '#ffb2cd',
      '15': '#ff99be',
      '21': '#e0f8f8',
      '22': '#b7e6e6',
      '23': '#a3d4d4',
      '24': '#c0c0d9',
      '25': '#d8a7c8',
      '31': '#b0f0f0',
      '32': '#99dddd',
      '33': '#82cbcb',
      '34': '#6bb8b8',
      '35': '#559999',
      '41': '#8affff',
      '42': '#6eefff',
      '43': '#54dbff',
      '44': '#3fc8ff',
      '45': '#00b5ff',
      '51': '#adffff',
      '52': '#82faff',
      '53': '#58f0ff',
      '54': '#2bd6ff',
      '55': '#0099cc'
    };
    const color = colorMap[code] || '#d9d9d9';
    return new ol.style.Style({
      fill: new ol.style.Fill({ color }),
      stroke: new ol.style.Stroke({ color: '#333', width: 0.5 })
    });
  },
  visible: true,
  title: 'Bivariate Map'
});

// --- OSM Basemap ---
const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: true,
  title: 'OpenStreetMap'
});

// --- ESRI Basemap ---
const esriLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles © Esri'
  }),
  visible: false,
  title: 'ESRI Satellite'
});

// --- Create the Map ---
const map = new ol.Map({
  target: 'map',
  layers: [
    osmLayer,
    esriLayer,
    aadPngLayer,
    bivariateLayer
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([20.9, 44.3]),
    zoom: 7
  }),
  controls: ol.control.defaults.defaults().extend([
    new ol.control.FullScreen(),
    new ol.control.ScaleLine(),
    new ol.control.MousePosition({ target: 'mouse-position' })
  ])
});

// --- Basemap Switcher ---
document.querySelectorAll('input[name="basemap"]').forEach((input) => {
  input.addEventListener('change', () => {
    const value = input.value;
    osmLayer.setVisible(value === 'OpenStreetMap');
    esriLayer.setVisible(value === 'ESRI Satellite');
  });
});

// --- Bivariate Toggle Logic ---
document.getElementById('toggle-bivariate').addEventListener('change', function () {
  bivariateLayer.setVisible(this.checked);
  document.getElementById('legend-bivariate').style.display = this.checked ? 'block' : 'none';
});

// --- Info Popup Logic ---
const popup = document.createElement('div');
popup.id = 'popup';
popup.className = 'ol-popup';
popup.style.position = 'absolute';
popup.style.background = 'white';
popup.style.padding = '8px 12px';
popup.style.border = '1px solid #ccc';
popup.style.borderRadius = '6px';
popup.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
popup.style.zIndex = '1000';
popup.style.minWidth = '120px';
popup.style.display = 'none';
document.body.appendChild(popup);

map.on('click', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
  if (feature && feature.get('bivariate')) {
    const coordinate = evt.coordinate;
    const code = feature.get('bivariate');
    const name = feature.get('gaul1_name') || 'Unknown area';

    popup.innerHTML = `<strong>${name}</strong><br>Bivariate code: ${code}`;
    popup.style.display = 'block';
    popup.style.left = evt.pixel[0] + 10 + 'px';
    popup.style.top = evt.pixel[1] + 10 + 'px';
  } else {
    popup.style.display = 'none';
  }
});
