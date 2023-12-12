// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/NBA/API/States/');
    self.displayName = 'NBA State Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.Id = ko.observable('');
    self.Name = ko.observable('');
    self.Flag = ko.observable('');

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getState...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.Id(data.Id);
            self.Name(data.Name);
            self.Flag(data.Flag);
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

    function showLoading() {
        $('#myModal').modal('show', {
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

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    //--- start ....
    showLoading();
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
    console.log("VM initialized!");
};

$(document).ready(function () {
    console.log("document.ready!");
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
    })

    $('#ld-light').click(function() {
        localStorage.setItem('bs-mode', 'light');
        $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
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

$(document).ajaxComplete(function (event, xhr, options) {
    $("#myModal").modal('hide');
})
