GrrMap = {
    map: undefined,

    init: function(x, y, z) {

        var goToLocation = typeof x === 'undefined' ? true : false;
        x = typeof x !== 'undefined' ? x : 25;
        y = typeof y !== 'undefined' ? y : -4;
        z = typeof z !== 'undefined' ? z : 3;

        x = this.getCoordinateAsDec(x);
        y = this.getCoordinateAsDec(y);

        var osmUrl='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors | html + js: <a href="http://ideale.ch">a.l.e</a>';

        this.map = L.map('map', {fadeAnimation: false}).setView([x, y], z);

        this.map.locate(); // will ask the current location...
        if (goToLocation) {
            this.map.on('locationfound', function (e) {
                // console.log('e', e);
                this.map.setZoom(10);
                this.map.panTo(e.latlng);
            }
        )}

        this.map.on('locationfound', function (e) {
            var crossIcon = L.icon({
                iconUrl: '../grr/grrrr_kreuzblink.gif',
                shadowUrl: '../grr/grrrr_kreuzblink.gif',
                iconSize: [19, 19],
                shadowSize: [0, 0],
                iconAnchor: [10, 10],
                popupAnchor: [-10, -10]
            });
            var marker = L.marker(e.latlng, {icon: crossIcon});
            marker.addTo(this.map);
        }.bind(this));

        L.tileLayer.blackAndWhite(
            osmUrl,
            {
                attribution: osmAttrib,
                maxZoom: 18, minZoom: 4
            }
        ).addTo(this.map);

		this.map.on('zoomend', function (e) {
            // console.log('zoom', e.target._zoom);
        }.bind(this));

        // initialise the dots
        var DotIcon1 = L.icon({
            iconUrl: '../map/grrrr_da_h.png',
            shadowUrl: '../map/grrrr_da_h.png',
            iconSize: [25, 25],
            shadowSize: [0, 0],
            iconAnchor: [0, 25],
            popupAnchor: [0, 0]
        });

        var DotIcon2 = L.icon({
            iconUrl: '../map/grrrr_da_v.png',
            shadowUrl: '../map/grrrr_da_v.png',
            iconSize: [25, 25],
            shadowSize: [0, 0],
            iconAnchor: [0, 25],
            popupAnchor: [0, 0]
        });

        this.blinkDot = [
            DotIcon1,
            DotIcon2
        ];

    },
    /**
     * if the coordinates are in degree, convert it to
     * decimal values
     */
    getCoordinateAsDec: function(coordinate) {
        // console.log('coordinate', coordinate);
        if ((typeof coordinate === 'string') && (coordinate.indexOf('°') > -1)) {
            var direction = coordinate.slice(-1);
            var parts = coordinate.slice(0, -1).trim().split(/ +/);
            parts = parts.map(function(i) {return parseFloat(i.replace(/[^\d.]/g, ''));});
            if (parts.length < 3) {
                // if no seconds
                parts[2] = 0;
            }
            // console.log('parts', parts);
            var coordinate = parts[0] + parts[1]/60 + parts[2]/(60*60);

            if (direction == "S" || direction == "W") {
                coordinate = coordinate * -1;
            } // Don't do anything for N or E
        }
        // console.log('coordinate', coordinate);
        return coordinate;
    },
    /**
     * read the markers from the json file and call the addMarkers() function
     */
    readMarkers: function(url) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                    var markers = JSON.parse(xmlhttp.responseText);
                    this.addMarkers(markers);
                }
            }
        }.bind(this);
        xmlhttp.send(null);
    },
    /**
     * create the markers from the list read from the json file
     * and them to the markers list
     */
    addMarkers: function(markersSource) {

        var markers = L.markerClusterGroup({
            disableClusteringAtZoom:12, // grrrr default zoom - 2
            maxClusterRadius: 40, // cluster default / 2
            /* zoomToBoundsOnClick: false, */
            showCoverageOnHover: false,
            iconCreateFunction: function(cluster) {
                return L.divIcon({ html: '<span>' + cluster.getChildCount() + '</span>', className:'grrrr-clustered' });
            }
        });

        for (var i=0; i<markersSource.length; i++) {
            var lon = markersSource[i][0];
            var lat = markersSource[i][1];
            var url = markersSource[i][2];
            // var url = "../city/adelaide/adelaide.gif";
            var grrNumber = markersSource[i][3];
            var grrWidth = markersSource[i][4];

            var marker;
            if (grrNumber == 0) {
                // standard arrow markers: picks one of two icons in alternance
                marker = L.marker(L.latLng(lon, lat), {icon: ( this.blinkDot[i%2]) });
            } else {
                var GrrIcon = L.icon({
                    iconUrl: '../grr/grr'+grrNumber+'n.png',
                    shadowUrl: '../grr/grr'+grrNumber+'n.png',
                    iconSize: [grrWidth, 19],
                    shadowSize: [0, 0],
                    iconAnchor: [grrWidth/2, 10],
                    popupAnchor: [0, 0]
                });
                // console.log('../grr/grr'+grr+'n.png');

                grrIconN = GrrIcon;
                marker = L.marker(L.latLng(lon, lat), {icon: grrIconN });
            }

            marker.data = {
                imageUrl: (grrNumber == 0 ? url : ""),
                locationUrl: (grrNumber != 0 ? url: ""),
                visible: false
            }
            marker.on('click', function(e) {
                // console.log(e.target.data);
                if (e.target.data.imageUrl != "") {
                    this.show(e.target.data.imageUrl);
                } else if (e.target.data.locationUrl != "") {
                    document.location = e.target.data.locationUrl;
                }
            }.bind(this));

            markers.addLayer(marker);
        }
        this.map.addLayer(markers);
    },
    /**
     * show the image attached to marker
     */
	show: function(image) {
        // console.log('image', image);
		var grrimage="url("+image+")";
		document.getElementById('bild').style.backgroundImage=grrimage;
		document.getElementById('bild').style.visibility='visible';
		// document.getElementById('map').style.visibility='hidden';
	},
    /**
     * hide the image attached to marker
     */
	hide: function() {
		document.getElementById('bild').style.visibility='hidden';
		document.getElementById('map').style.visibility='visible';
	}
}
