$(document).ready(function () {
  app.initialized().then(function (_client) {
    _client.data.get("ticket").then(
      function (data) {
        loc = data.ticket.custom_field.location;

        if (loc) {
          split = loc.split(",");
          initMap(split.map(Number));
        } else {
          initMap(null);
        }
      },

      function () {
        initMap(null);
      }
    )
  });
});

function initMap(initialLocation) {
  require([
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "esri/widgets/Search",
    "esri/tasks/Locator",
    "esri/geometry/Polygon"
  ], function (Map, MapView, Point, Extent, Search, Locator, Polygon) {

    var map = new Map({
      basemap: "gray-vector",
      // extent: new Extent({
      //   xmin: 1733629.31,
      //   xmax: 1757506.12,
      //   ymin: 5417808.44,
      //   ymax: 5441775.30,
      //   spatialReference: { wkid: 2193 }
      // })
    });

    var view = new MapView({
      container: "map",
      map: map,
      center: initialLocation || new Point(174.777205, -41.288792),
      // center: new Point(1748815.34, 5427660.80, { wkid: 2193 }),
      zoom: 15
    });

    view.on("drag", function (event) {
      if (event.action === 'end') {
        storeLocation(view.center);
        reverseGeocode(view.center);
      }
    });

    // var wccLocator = {
    //   locator: new Locator({ url: "https://gis.wcc.govt.nz/arcgis/rest/services/Locators/addressLocator/GeocodeServer" }),
    //   singleLineFieldName: "Single Line Input",
    //   outFields: ["Addr_type"],
    //   name: "WCC Address Locator",
    //   placeholder: 'Search Wellington addresses'
    // }

    var esriLocator = {
      locator: new Locator({ url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer" }),
      singleLineFieldName: "SingleLine",
      outFields: ["Addr_type"],
      name: "ArcGIS World Geocoding Service",
      placeholder: 'Search Wellington addresses',
      filter: {
        geometry: new Polygon({
          "spatialReference": { "wkid": 4326 },
          "rings": [
            [
              [174.782677, -41.0622542],
              [174.5742774, -41.2785825],
              [174.6896338, -41.38119],
              [174.9227419, -41.4598627],
              [175.1407599, -41.3255236],
              [174.782677, -41.0622542]
            ]
          ]
        })
      }
    }

    var geosearch = new Search({
      view: view,
      autoSelect: false,
      includeDefaultSources: false,
      sources: [esriLocator]
    });

    jQuery("#location-search").autocomplete({
      source: function (request, response) {
        geosearch.suggest(request.term).then(function (data) {
          results = data.results[0].results;
          suggestions = results.map((res) => { return { "label": res.text, "value": res.text } });
          response(suggestions);
        });
      },

      select: function (event, ui) {
        geosearch.search(ui.item.value).then(function (data) {
          result = data.results[0].results[0];
          view.goTo(result);
          storeLocation(result.feature.geometry);
          setAddress(ui.item.value);
        });
      }
    });

    reverseGeocode = function (geometry) {
      var geocoder = geosearch.activeSource.locator;

      geocoder.locationToAddress({ location: geometry })
        .then(function (res) {
          address = res.attributes.LongLabel
          jQuery("#location-search").val(address);
          setAddress(address);
        });
    }

    storeLocation = function (geometry) {
      jQuery("#view-coordinates").val(geometry.longitude + "," + geometry.latitude);
      setLocation(geometry.longitude + "," + geometry.latitude);
    };

    jQuery('#open-google-map').click(function () {
      var lnglat = jQuery('#view-coordinates').val();

      if (lnglat != "") {
        var latlng = lnglat.split(",").reverse().join(",");
        window.open("https://www.google.com/maps/search/?api=1&query=" + latlng);
      }
    });

  });
}