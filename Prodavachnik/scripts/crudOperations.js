const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_B1Pe4qOEX'
const APP_SECRET = 'b1e8c30259c64140a6fe197868bba2f8'
const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)}

function registerUser() {
    let username = $('#formRegister').find('[name="username"]').val()
    let password = $('#formRegister').find('[name="passwd"]').val()

    if(username.trim().length > 0 && password.trim().length > 0) {
        $.ajax({
            method: "POST",
            url: BASE_URL + 'user/' + APP_KEY + '/',
            headers: AUTH_HEADERS,
            data: {
                username, password
            }
        }).then(function (res) {
            signInUser(res, 'Register successful.')
        }).catch(handleAjaxError)
    }

}

function loginUser() {
    let username = $('#formLogin').find('[name="username"]').val()
    let password = $('#formLogin').find('[name="passwd"]').val()

    $.ajax({
        method: "POST",
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: AUTH_HEADERS,
        data: {
            username, password
        }
    }).then(function (res) {
        signInUser(res, 'Login successful.')
    }).catch(handleAjaxError)

}

function signInUser(res, message) {
    saveAuthInSession(res)
    showHideMenuLinkss()
    showHomeView()
    $('#loggedInUser').text("Hello, " + res.username + "!")
    showInfo(message)
}

function saveAuthInSession(userInfo) {
    sessionStorage.setItem('userId', userInfo._id)
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken)
    sessionStorage.setItem('username', userInfo.username)
}

function getKinveyUserAuthHeaders() {
    return {
        'Authorization': "Kinvey " +
        sessionStorage.getItem('authToken'),
    };
}

function logoutUser() {

    $.ajax({
        method: "POST",
        url: BASE_URL + 'user/' + APP_KEY + '/_logout',
        headers: getKinveyUserAuthHeaders()
    })

    sessionStorage.clear()
    showHomeView()
    showHideMenuLinkss()
    $('#loggedInUser').text('')
    showInfo('Logout successfull.')
}
function listAds() {

    $.ajax({
        method: "GET",
        url: BASE_URL + "appdata/" + APP_KEY + "/adverts",
        headers: getKinveyUserAuthHeaders()
    }).then(function (res) {
        showView('viewAds')
        displayAdverts(res)
    }).catch(handleAjaxError)

    function displayAdverts(adverts) {
        $('#ads').find('> table tr').each((index, element) => {
            if (index > 0) {
                $(element).remove()
            }
        })
        for (let ad of adverts) {
            let tr = $('<tr>')
            tr.append($(`<td>`).text(ad.Title))
            tr.append($(`<td>`).text(ad.Publisher))
            tr.append($(`<td>`).text(ad.Description))
            tr.append($(`<td>`).text(ad.Price))
            tr.append($(`<td>`).text(ad.DateOfPublishing))


            if(sessionStorage.getItem('userId') === ad._acl.creator){
                let td = $('<td>')
                let deleteBtn = $('<a href="#">[Delete]</a>')
                let editBtn = $('<a href="#">[Edit]</a>')
                deleteBtn.on('click', function(){
                    deleteAd(ad)
                })
                editBtn.on('click', function(){
                    loadAdForEdit(ad)
                })

                td.append(deleteBtn).append(editBtn)
                tr.append(td)
            }
            $('#ads > table').append(tr)

        }
    }
}

function createAd() {
    let title = $('#formCreateAd').find('[name="title"]').val()
    let description = $('#formCreateAd').find('[name="description"]').val()

    let today = formatDate(new Date());

    today = today.mm + '/' + today.dd + '/' + today.yyyy;

    let price = Number($('#formCreateAd').find('[name="price"]').val()).toFixed(2)
    let user = sessionStorage.getItem('username')

    if(title && description && price) {
        $.ajax({
            method: "POST",
            url: BASE_URL + "appdata/" + APP_KEY + "/adverts",
            data: {
                'Title': title,
                'Description': description,
                'DateOfPublishing': today,
                'Price': price,
                'Publisher': user
            },
            headers: getKinveyUserAuthHeaders()
        }).then(function (res) {
            listAds()
        }).catch(handleAjaxError)
    }
}

function loadAdForEdit(ad) {
    showView('viewEditAd')
    $('#formEditAd').find('[name="datePublished"]').prop('disabled', true);

    $('#formEditAd').find('[name="id"]').val(ad._id)
    $('#formEditAd').find('[name="publisher"]').val(ad.Publisher)
    $('#formEditAd').find('[name="title"]').val(ad.Title)
    $('#formEditAd').find('[name="description"]').val(ad.Description)

    let date = formatDate(new Date(ad.DateOfPublishing))
    date = date.yyyy + '-' + date.mm + '-' + date.dd
    $('#formEditAd').find('[name="datePublished"]').val(date)
    $('#formEditAd').find('[name="price"]').val(ad.Price)
}
function formatDate(dateP){
    let date = dateP

    let dd = date.getDate();
    let mm = date.getMonth()+1; //January is 0!
    let yyyy = date.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    }

    if(mm<10) {
        mm = '0'+mm
    }

    return {dd,mm,yyyy};
}
function editAd() {
    let id = $('#formEditAd').find('[name="id"]').val()
    let title = $('#formEditAd').find('[name="title"]').val()
    let description = $('#formEditAd').find('[name="description"]').val()
    let publisher = $('#formEditAd').find('[name="publisher"]').val()
    let date = $('#formEditAd').find('[name="datePublished"]').val()

    date = formatDate(new Date(date))
    date = date.mm + '/' + date.dd + '/' + date.yyyy
    let price = Number($('#formEditAd').find('[name="price"]').val()).toFixed(2)

    if(title && description) {
        $.ajax({
            method: "PUT",
            url: BASE_URL + "appdata/" + APP_KEY + "/adverts/" + id,
            data: {
                'Title': title,
                'Description': description,
                'DateOfPublishing': date,
                'Price': price,
                'Publisher': publisher
            },
            headers: getKinveyUserAuthHeaders()
        }).then(function (res) {
            listAds()
            showInfo('Ads edited.')
            showView('viewAds')
        }).catch(handleAjaxError)
    }

}

function deleteAd(ad) {
    let id = ad._id
    $.ajax({
        method: "DELETE",
        url: BASE_URL + 'appdata/' + APP_KEY + "/adverts/" + id,
        headers: getKinveyUserAuthHeaders()
    }).then(function (res) {
        listAds()
        showView('viewAds')
        showInfo('Ad deleted.')
    })
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}