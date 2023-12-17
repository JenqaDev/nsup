$("document").ready(function () {
    var map = L.map('map', {
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: 'topleft'
        }
    }).setView([0, 0], 2);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.flyTo([39.8097343, -98.5556199], 4.5);

    var composedUri = "http://192.168.160.58/NBA/API/Arenas";
    ajaxHelper(composedUri, 'GET')
        .done(function (data) {
            console.log(data);
            $.each(data.Records, function (index, record) {
                L.marker([record.Lat, record.Lon]).addTo(map)
                    .bindPopup("<b>" + record.Name + "</b><br><a class=\"text-dark text-decoration-none\" target='_blank' href =\"./arenaDetails.html?id=" + record.Id+"\"><span class=\"text-danger\">&rarr;</span> State Details: "  + record.StateName +  "</a><br><a class=\"text-dark text-decoration-none\" target='_blank' href =\"./arenaDetails.html?id=" + record.Id+"\"><span class=\"text-danger\">&rarr;</span> Arena Details</a>");
            });
        });
});

//--- Internal functions
function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("AJAX Call[" + uri + "] Fail...");
        }
    });
}
