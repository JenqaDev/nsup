var favs = {};
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    var fav_records;
    self.baseUri = ko.observable('http://192.168.160.58/NBA/API/Divisions');
    self.displayName = 'NBA Divisions List';
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
            fav_records = data.Records;
            console.log(data.Records);
        });
    };

    self.update = function() {
        var lst = [];
        for (var rec in favs) {
            lst.push(favs[rec])
        }
        self.favRecords(lst);
    }
    self.recoverFavs = function() {
        if (localStorage.getItem("division_favs")) {
            favs = JSON.parse(localStorage.getItem("division_favs"))
            for (var id in favs) {
                $(`#${id}`).find("i").toggleClass("fa-heart text-danger");
                $(`#${id}`).find("i").toggleClass("fa-heart-o");
            }
            self.update()
        }
    }
    self.favReady = function() {
        $('[id^="favourite_"]').on('click', e => {
            $(e.target).find("i").toggleClass("fa-heart text-danger");
            $(e.target).find("i").toggleClass("fa-heart-o");
            var id = e.target.id;
            if (id in favs) {
                delete favs[id]
            } else {
                var rec_id = Number(id.slice(10))
                for (var rec of fav_records) {
                    if (rec.Id == rec_id) {
                        favs[id] = rec;
                        break;
                    }
                }
            }
            localStorage.setItem("division_favs", JSON.stringify(favs))
            self.update()
        })
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

var nvm;
$(document).ready(function () {
    console.log("ready!");
    nvm = new vm();
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

    autocomplete()
});

function autocomplete() {
    if (localStorage.getItem('divisionsJSON') == undefined || localStorage.getItem('divisionsJSON') == null) {
        ajaxHelper('http://192.168.160.58/NBA/API/Divisions', 'GET').done(function (data) {
            localStorage.setItem('divisionsJSON', JSON.stringify(data.Records))
        })
    }

    var availableTags = JSON.parse(localStorage.getItem('divisionsJSON'))
    var values = []
    for (i in availableTags) {
        values.push([availableTags[i]["Id"], " " + availableTags[i]["Name"]])
    }

    console.log("w", values)
    $("#tags").autocomplete({
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(values.map(String), request.term);
            response(results.slice(0, 20));
        },
        select: function (event, ui) {   
            window.location.assign('divisionDetails.html?id=' + ui.item.value.split(",")[0].trim());
        }
    }
    );
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
    nvm.recoverFavs();
    nvm.favReady();
});



