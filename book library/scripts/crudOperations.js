const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_rkunN4uEQ'
const APP_SECRET = 'd4c9c7f23ae0496d93af016711dc58ee'
const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)}
const BOOKS_PER_PAGE = 10

function loginUser() {
    let username = $('#formLogin').find('[name="username"]').val()
    let password = $('#formLogin').find('[name="passwd"]').val()

    $.ajax({
        method: "POST",
        url: BASE_URL + "user/" + APP_KEY + "/login",
        headers: AUTH_HEADERS,
        data:{
            username, password
        }
    }).then(function (res) {
        signInUser(res, 'Login successful.')
    }).catch(handleAjaxError)

    // POST -> BASE_URL + 'user/' + APP_KEY + '/login'
    // signInUser(res, 'Login successful.')
}

function registerUser() {
    let username = $('#formRegister').find('[name="username"]').val()
    let password = $('#formRegister').find('[name="passwd"]').val()

    $.ajax({
        method: "POST",
        url: BASE_URL + "user/" + APP_KEY + "/",
        headers: AUTH_HEADERS,
        data:{
            username, password
        }
    }).then(function (res) {
        signInUser(res, 'Registration successful.')
    }).catch(handleAjaxError)

    // POST -> BASE_URL + 'user/' + APP_KEY + '/'
    // signInUser(res, 'Registration successful.')
}

function listBooks() {
    $.ajax({
        method: "GET",
        url: BASE_URL + "appdata/" + APP_KEY + "/books",
        headers: getKinveyUserAuthHeaders(),
    }).then(function(res){
        showView('viewBooks')
        displayPaginationAndBooks(res.reverse())
    }).catch(handleAjaxError)
    // GET -> BASE_URL + 'appdata/' + APP_KEY + '/books'
    // displayPaginationAndBooks(res.reverse())
}

function getKinveyUserAuthHeaders() {
    return {
        'Authorization': "Kinvey " +
        sessionStorage.getItem('authToken'),
    };
}

function createBook() {
    let title = $('#formCreateBook').find('[name="title"]').val()
    let author = $('#formCreateBook').find('[name="author"]').val()
    let description = $('#formCreateBook').find('[name="description"]').val()
    $.ajax({
        method: "POST",
        url: BASE_URL + "appdata/" + APP_KEY + "/books",
        headers: getKinveyUserAuthHeaders(),
        data:{
            title, author, description
        }
    }).then(function (res) {
        listBooks()
        showView('viewBooks')
        showInfo('Book created.')
    }).catch(handleAjaxError)

    // POST -> BASE_URL + 'appdata/' + APP_KEY + '/books'
    // showInfo('Book created.')
}

function deleteBook(book) {
    let id = book._id

    $.ajax({
        method:"DELETE",
        url: BASE_URL + "appdata/" + APP_KEY + "/books/" + id,
        headers: getKinveyUserAuthHeaders()
    }).then(function (res) {
        listBooks()
        showView('viewBooks')
        showInfo('Book deleted.')
    })
    // DELETE -> BASE_URL + 'appdata/' + APP_KEY + '/books/' + book._id
    // showInfo('Book deleted.')
}

function loadBookForEdit(book) {
    showView('viewEditBook')
    $('#formEditBook').find('[name="id"]').val(book._id)
    $('#formEditBook').find('[name="title"]').val(book.title)
    $('#formEditBook').find('[name="author"]').val(book.author)
    $('#formEditBook').find('[name="description"]').val(book.description)
}

function editBook() {
    let title = $('#formEditBook').find('[name="title"]').val()
    let author = $('#formEditBook').find('[name="author"]').val()
    let description = $('#formEditBook').find('[name="description"]').val()
    let id = $('#formEditBook').find('[name="id"]').val()

    $.ajax({
        method: "PUT",
        url: BASE_URL + "appdata/" + APP_KEY + "/books/" + id,
        data: {
            title, author, description
        },
        headers: getKinveyUserAuthHeaders()
    }).then(function (res) {
        listBooks()
        showInfo('Book edited.')
        showView('viewBooks')
    }).catch(handleAjaxError)
    // PUT -> BASE_URL + 'appdata/' + APP_KEY + '/books/' + book._id
    // showInfo('Book edited.')
}

function saveAuthInSession(userInfo) {
    sessionStorage.setItem('userId', userInfo._id)
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken)
}

function logoutUser() {
    $.ajax({
        method: "POST",
        url: BASE_URL + "user/" + APP_KEY + '/_logout',
        headers: getKinveyUserAuthHeaders()
    })

    sessionStorage.clear()
    showHomeView()
    showHideMenuLinks()
    $('#loggedInUser').text('')
    showInfo('Logout succesful.')
    // showInfo('Logout successful.')
}

function signInUser(res, message) {
    saveAuthInSession(res)
    showHideMenuLinks()
    showHomeView()
    $('#loggedInUser').text("Hello, " + res.username + "!")
    showInfo(message)
}

function displayPaginationAndBooks(books) {
    let pagination = $('#pagination-demo')
    if(pagination.data("twbs-pagination")){
        pagination.twbsPagination('destroy')
    }

    pagination.twbsPagination({
        totalPages: Math.ceil(books.length / BOOKS_PER_PAGE),
        visiblePages: 5,
        next: 'Next',
        prev: 'Prev',
        onPageClick: function (event, page) {
            $('#books').find('> table tr').each((index, element) => {
                if (index > 0) {
                    $(element).remove()
                }
            })
            let startBook = (page - 1) * BOOKS_PER_PAGE
            let endBook = Math.min(startBook + BOOKS_PER_PAGE, books.length)
            $(`a:contains(${page})`).addClass('active')
            for (let i = startBook; i < endBook; i++) {
                let tr = $(`<tr><td>${books[i].title}</td>`+
                    `<td>${books[i].author}</td>`+
                    `<td>${books[i].description}</td>`)
                $('#books > table').append(tr)
                if (books[i]._acl.creator === sessionStorage.getItem("userId")) {
                    let td = $('<td>')
                    let aDel = $('<a href="#">[Delete]</a>').on('click', function () {
                        deleteBook(books[i])
                    })
                    let aEdit = $('<a href="#">[Edit]</a>').on('click', function () {
                        loadBookForEdit(books[i])
                    })
                    td.append(aDel).append(aEdit)
                    tr.append(td)
                }
            }
        }
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