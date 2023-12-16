var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/NBA/API/States');
    self.teams = ko.observable('http://192.168.160.58/NBA/API/Teams/Search')
    self.displayName = 'NBA States List';
    self.countTeams = ko.observable(0);
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.previousPage = ko.computed(function () {
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function () {
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.observable(0);
    self.pageArray = function () {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getStates...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.records(data.Records);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalRecords);
            console.log(data.TotalRecords);
            //self.SetFavourites();
        });
        //console.log('CALL: countTeams...');
        //var teamCount = self.teams() + "?q=" + "StateId";
        //ajaxHelper(teamCount, 'GET').done(function (data) {
            //console.log(data)
        //    hideLoading();
        //});
        //console.log(teamCount);
    };

    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }

    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());

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

    autocomplete()
});

function autocomplete() {
    if (localStorage.getItem('statesJSON') == undefined || localStorage.getItem('statesJSON') == null) {
        ajaxHelper('http://192.168.160.58/NBA/API/States', 'GET').done(function (data) {
            localStorage.setItem('statesJSON', JSON.stringify(data.Records))
        })
    }

    var availableTags = JSON.parse(localStorage.getItem('statesJSON'))
    var values = []
    for (i in availableTags) {
        values.push([availableTags[i]["Id"], availableTags[i]["Name"]])
    }
    console.log(values)
    $("#tags").autocomplete({
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(values.map(String), request.term);
            response(results.slice(0, 20));
        },
        select: function (event, ui) {   
            window.location.assign('stateDetails.html?id=' + ui.item.value.split(',')[0]);
        }
    }
    );

    $("#tags").on('keypress',function(e) {
        if(e.which == 13 && values.map(String).indexOf($("#tags").val()) >= 0 ) {
            window.location.assign('stateDetails.html?id=' + $("#tags").val());
        }
    });

    /*
    $("#tags").on('keypress',function(e) {
        const comparator1 = values.map(element => {
            return element.map(eleme => {
                return eleme.toLowerCase();
            });
        });

        const comparator2 = 
        console.log(comparator1)
        console.log(comparator1.indexOf($("#tags").val().toLowerCase()))
        console.log($("#tags").val().toLowerCase())
        if(e.which == 13 && comparator.indexOf($("#tags").val().toLowerCase()) >= 0 ) {
            window.location.assign('stateDetails.html?id=' + $("#tags").val());
        }
    });*/
}

function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("AJAX Call[" + uri + "] Fail...");
            hideLoading();
        }
    });
}

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})
