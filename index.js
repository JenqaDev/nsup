$(document).ready(function() { 
    if (localStorage.getItem('bs-mode') != null){
        if (localStorage.getItem('bs-mode') == 'light'){
            $('#ld-toggle i').removeClass("fa-toggle-off").addClass("fa-toggle-on")
            $('.carousel-caption').addClass('faderwtb').removeClass('faderbtw')
            $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
        }else {
            $('#ld-toggle i').removeClass("fa-toggle-on").addClass("fa-toggle-off")
            $('.carousel-caption').addClass('faderbtw').removeClass('faderwtb')
            $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
        }
    }

    $('#ld-dark').click(function() {
        localStorage.setItem('bs-mode', 'dark');
        $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
        $('.carousel-caption').addClass('faderbtw').removeClass('faderwtb')
        $('#ld-toggle i').removeClass("fa-toggle-on").addClass("fa-toggle-off")
    })

    $('#ld-light').click(function() {
        localStorage.setItem('bs-mode', 'light');
        $('.carousel-caption').addClass('faderwtb').removeClass('faderbtw')
        $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
        $('#ld-toggle i').removeClass("fa-toggle-off").addClass("fa-toggle-on")
    })

    $('#ld-toggle').click(function() {
        var theme = $("html").attr("data-bs-theme")
        if (theme == "dark") {
            localStorage.setItem('bs-mode', 'light');
            $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
            $('.carousel-caption').addClass('faderwtb').removeClass('faderbtw')
            $('#ld-toggle i').removeClass("fa-toggle-off").addClass("fa-toggle-on")
        }else{ 
            localStorage.setItem('bs-mode', 'dark');
            $("html").attr('data-bs-theme', localStorage.getItem('bs-mode'))
            $('.carousel-caption').addClass('faderbtw').removeClass('faderwtb')
            $('#ld-toggle i').removeClass("fa-toggle-on").addClass("fa-toggle-off")
        }
    })

})
