function showView(viewName) {
    $('main > section').hide() // Hide all views
    $('#' + viewName).show() // Show the selected view only
}

function showHideMenuLinks() {
    console.log('Inside');
    $("#linkHome").show()
    if (sessionStorage.getItem('authToken') === null) { // No logged in user
        $("#linkLogin").show()
        $("#linkRegister").show()
        $("#linkListBooks").hide()
        $("#linkCreateBook").hide()
        $("#linkLogout").hide()
    } else { // We have logged in user
        $("#linkLogin").hide()
        $("#linkRegister").hide()
        $("#linkListBooks").show()
        $("#linkCreateBook").show()
        $("#linkLogout").show()
        $('#loggedInUser').text("Welcome, " + sessionStorage.getItem('username') + "!")
    }
}

function showInfo(message) {
    let infoBox = $('#infoBox')
    infoBox.text(message)
    infoBox.show()
    setTimeout(function() {
        $('#infoBox').fadeOut()
    }, 3000)
}

function showError(errorMsg) {
    let errorBox = $('#errorBox')
    errorBox.text("Error: " + errorMsg)
    errorBox.show()
}

function showHomeView() {
    showView('viewHome')
}

function showLoginView() {
    $('#formLogin').trigger('reset')
    showView('viewLogin')

}

function showRegisterView() {
    $('#formRegister').trigger('reset')
    showView('viewRegister')
}

function showCreateBookView() {
    $('#formCreateBook').trigger('reset')
    showView('viewCreateAd')
}