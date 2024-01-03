const composedUri = "http://192.168.160.58/NBA/API/Statistics/NumPlayersBySeason"

$('document').ready(function () {
    const ctx = document.getElementById('myChart');
    const plfctx = document.getElementById('playoffChart');

    ajaxHelper(composedUri, 'GET').done(function (stats) {
        // Interact with the data returned
        var myLabels = [];
        var myData = [];
        var evenLabels = [];
        var evenData = [];
        var i = 0
        $.each(stats, function (index, item) {
            if(i%2!=0) {
                myLabels.push(item.Season);
                myData.push(item.Players);
            }
            else {
                evenLabels.push(item.Season);
                evenData.push(item.Players);
            }
            i++;
        })

        // Instantiate and draw our chart, passing in some options.
        new Chart(ctx, {
            type: 'line',
            title: 'Regulars',
            data: {
                labels: myLabels,
                datasets: [{
                    label: 'Number of Players',
                    data: myData,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { align: 'start', font: { family: 'Open Sans' } },
                        title: {
                            display: true, text: ['Statistics', 'Number of Players per Regular Season'], padding: { top: 10, bottom: 10 }, font: { size: 12, family: 'Open Sans' }
                        },
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: { family: 'Open Sans', color: '#800' } ,
                        }
                    },
                    y: {
                        beginAtZero: true, 
                        ticks: {
                            font: { family: 'Open Sans', color: '#800', size: 8, width: 200 } ,
                        }
                    }
                }
            }
        });
        new Chart(plfctx, {
            type: 'line',
            title: 'Playoffs',
            data: {
                labels: evenLabels,
                datasets: [{
                    label: 'Number of Players',
                    data: evenData,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { align: 'start', font: { family: 'Open Sans' } },
                        title: {
                            display: true, text: ['Statistics', 'Number of Players per Playoff Season'], padding: { top: 10, bottom: 10 }, font: { size: 12, family: 'Open Sans' }
                        },
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: { family: 'Open Sans', color: '#ff1717' } ,
                        }
                    },
                    y: {
                        beginAtZero: true, 
                        ticks: {
                            font: { family: 'Open Sans', color: '#ff1717', size: 8, width: 200 } ,
                        }
                    }
                }
            }
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


$(document).ready(function () {
    if (localStorage.getItem('bs-mode') != null){
        if (localStorage.getItem('bs-mode') == 'light'){
            $('#ld-toggle i').removeClass("fa-toggle-off").addClass("fa-toggle-on")
        }
        $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
    }

    $('#ld-dark').click(function() {
        localStorage.setItem('bs-mode', 'dark');
        $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
        $('#ld-toggle i').removeClass("fa-toggle-on").addClass("fa-toggle-off")
    })

    $('#ld-light').click(function() {
        localStorage.setItem('bs-mode', 'light');
        $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
        $('#ld-toggle i').removeClass("fa-toggle-off").addClass("fa-toggle-on")
    })

    $('#ld-toggle').click(function() {
        var theme = $("html").attr("data-bs-theme")
        if (theme == "dark") {
            localStorage.setItem('bs-mode', 'light');
            $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
            $('#ld-toggle i').removeClass("fa-toggle-off").addClass("fa-toggle-on")
        }else{ 
            localStorage.setItem('bs-mode', 'dark');
            $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
            $('#ld-toggle i').removeClass("fa-toggle-on").addClass("fa-toggle-off")
        }
    })
});
