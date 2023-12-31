
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/NBA/API/Seasons');
    self.displayName = 'NBA Seasons List';
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
        console.log('CALL: getSeasons...');
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
            console.log(data.Records);
        });
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
    var nvm = new vm();
    ko.applyBindings(nvm);

    $(document).on('click', "[id^='favourite_']", event => {
        var id = $(event.target).parents()[1].firstElementChild.innerHTML;
        
        var fid = 'favourite_' + id
        var favorites = localStorage.getItem("favorites");
        
        if (!favorites) {
            console.log("adding fav")
            localStorage.setItem("season_fav_" + id, id);
        }else{
            localStorage.removeItem("season_fav_" + id, id);
        }

        if (favorites["Id"].includes(season)){
            console.log("removing " + season)
            $('#'+fid + ' i').removeClass("fa-heart text-danger");
            $('#'+fid + ' i').addClass("fa-heart-o");
            for (var key in favorites["Id"]) {
                if (favorites["Id"][key] == season) delete favorites["Id"][key];
            }
        }else{
            $('#'+fid + ' i').removeClass("fa-heart-o");
            $('#'+fid + ' i').addClass("fa-heart text-danger");
            favorites.Id.push(season);
            console.log("adding " + season)
        }
        
        localStorage.setItem("favorites", JSON.stringify(favorites));
    });

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

    $("form").submit(function(e){
        e.preventDefault();
        localStorage.setItem("try", ($(".form-control").val()))
    });
});

self.activate = function (id) {
};

function getJSON() {
    if (localStorage.getItem('seasonsJSON') != null) {
        console.log(JSON.stringify(localStorage.getItem('seasonsJSON')))
    } else {
        console.log('CALL: Searching Seasons...');
        baseUri = "http://192.168.160.58/NBA/API/Seasons?page=1&pagesize=100"
        var composedUri = baseUri;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            $('#results').empty()
            $('#parent_results').empty()
            results = []
            localStorage.setItem('seasonsJSON', data.Records)
            $("")
        });
    }
    
/*
    $(document).ready(function () {
        if ($(".form-control").val() != ""){
            $('#parent_results').append('<tr><th scope="col">Id</th><th scope="col">Season</th><th></th></tr>')
        }
        for (var res of results) {
            $("#results").append(
                '<tr><td class="">' + res["Id"] + '</td><td class="">' + res["Season"] + '</td><td class="text-end"><a class="btn btn-default btn-light btn-xs" href="./seasonDetails.html?id= ' + res["Id"] + '"><i class="fa fa-eye" title="Show details"></i></a></td></tr>'
            )
        }})*/
}

function showresults() {
    getJSON()
}

function redirect() {
    //     http://192.168.160.58/NBA/API/Seasons/Search?q=ano
    //window.location.assign("./seasonDetails.html?id=" + localStorage.getItem('try'))
    baseUri = "http://192.168.160.58/NBA/API/Seasons/Search"
    console.log('CALL: Searching Seasons...');
    var composedUri = baseUri + "?q=" + $(".form-control").val();
    ajaxHelper(composedUri, 'GET').done(function (data) {
        console.log(data);
    });
}

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
            hideLoading();
        }
    });
}

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
    
    /*var favorites = localStorage.getItem("favorites")
    favorites = JSON.parse(favorites);
    console.log(favorites["Id"])
    for (var fv in favorites["Id"]){
        if (favorites["Id"][fv] != null){
            item = 'favourite_'+favorites["Id"][fv]
            $('#' + item + ' i').addClass("fa-heart text-danger").removeClass("fa-heart-o");
            console.log("found " + item)
        }
    }*/
});



