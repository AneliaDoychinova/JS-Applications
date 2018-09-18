$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs')
        let strArray={1:'Jan', 2:'Feb', 3:'Mar', 4:'Apr', 5: 'May', 6:'Jun',
            7:'Jul', 8:'Aug', 9:'Sep', 10:'Oct', 11:'Nov', 12:'Dec'};

        //Index
        this.get('index.html', welcomePage)

        //All flights
        this.get('#/home', welcomePage)

        //Register
        this.get('#/register', function (ctx) {
            ctx.isLogged = isLogged()
            ctx.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/home/register.hbs')
            })
        })

        this.post('#/register', function (ctx) {
            let username = ctx.params.username
            let password = ctx.params.pass
            let repeatPass = ctx.params.checkPass

            if(username.length < 5){
                notify.showError('Username should be at least 5 characters.')
            } else if(password.length < 1){
                notify.showError('Password should be at least 1 character.')
            } else if(password !== repeatPass){
                notify.showError('Passwords don\'t match.')
            } else{
                auth.register(username, password, repeatPass)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo)
                        notify.showInfo('User registration successful.')
                        ctx.redirect('#/home')
                    }).catch(notify.handleError)
            }
        })

        //Login
        this.get('#/login', function (ctx) {
            ctx.isLogged = isLogged()
            ctx.loadPartials({

                footer: './templates/common/footer.hbs',
                navigation: './templates/common/navigation.hbs'
            }).then(function () {
                this.partial('./templates/home/login.hbs')
            })
        })



        this.post('#/login', function (ctx) {
            let username = ctx.params.username
            let password = ctx.params.pass

            if(username.length < 5){
                notify.showError('Username should be at least 5 characters.')
            } else if(password.length < 1){
                notify.showError('Password should be at least 1 character.')
            } else{
                auth.login(username, password)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo)
                        notify.showInfo('Login successful.')
                        ctx.redirect('#/home')
                    }).catch(notify.handleError)
            }
        })

        //Logout
        this.get('#/logout', function (ctx) {

            auth.logout()
                .then(function () {
                    sessionStorage.clear()
                    notify.showInfo('Logout successful.')
                    ctx.redirect('#/home')
                })

        })

        //Add Flight
        this.get('#/create', function (ctx) {
            if(!isLogged()){
               ctx.redirect('index.html')
               return
            }

            ctx.isLogged = isLogged()
            ctx.username = sessionStorage.getItem('username');

            ctx.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/flights/viewAddFlight.hbs')
            })
        })

        this.post('#/create', function (ctx) {
            let destination = ctx.params.destination
            let origin = ctx.params.origin
            let departureDate = ctx.params.departureDate
            let departureTime = ctx.params.departureTime
            let seats = ctx.params.seats
            let cost = ctx.params.cost
            let image = ctx.params.img
            let isPublic = ctx.params.public !== undefined

            let departure = departureDate + ' ' + departureTime

            if(destination === '' || origin === ''){
                notify.showError('Destination and Origin cannot be empty.')
            } else if(seats < 0 || cost < 0){
                notify.showError('Seats and Cost should be positive.')
            } else {
                flights.createFlight(destination, origin, departure, seats, cost, image, isPublic)
                    .then(function (res) {
                        notify.showInfo('Created flight.')
                        ctx.redirect('#/home')
                    }).catch(notify.handleError)
            }
        })


        //Details

        this.get('#/details/:flightId', function (ctx) {
            if(!isLogged()){
                ctx.redirect('index.html')
                return
            }
            ctx.isLogged = isLogged()
            ctx.username = sessionStorage.getItem('username');

            let flightId = ctx.params.flightId.substr(1)

            flights.getFlightById(flightId).then(function (flight) {

                let date = new Date(flight.departure.split(' ')[0])
                ctx.date = date.getDate() + ' ' + (strArray[date.getMonth() + 1]) + ' ' + flight.departure.split(' ')[1]
                ctx.isAuthor = flight._acl.creator === sessionStorage.getItem('userId')
                ctx.image = flight.image
                ctx.destination = flight.destination
                ctx.origin = flight.origin
                ctx.seats = flight.seats
                ctx.cost = flight.cost
                ctx._id = flight._id

                ctx.loadPartials({
                    navigation: './templates/common/navigation.hbs',
                    footer: './templates/common/footer.hbs',
                }).then(function () {
                    this.partial('./templates/flights/viewDetails.hbs')
                })

            }).catch(notify.handleError)
        })

        //Edit Flight

        this.get('#/edit/:flightId', function (ctx) {
            if(!isLogged()){
                ctx.redirect('index.html')
                return
            }

            let flightId = ctx.params.flightId.substr(1)

            flights.getFlightById(flightId).then(function (flight) {
                let isAuthor = flight._acl.creator === sessionStorage.getItem('userId')
                if(!isAuthor){
                    ctx.redirect('#/home')
                    return
                }

                let date =  new Date(flight.departure)
                let month = "0" + (date.getMonth() + 1)
                let data = "0" + date.getDate()
                ctx.date = date.getFullYear() + '-' + month.slice(-2) + '-' + data.slice(-2)

                let hours = "0" + date.getHours()
                let minutes = "0" + date.getMinutes()
                ctx.time = hours.slice(-2) + ":" + minutes.slice(-2)
                ctx.image = flight.image
                ctx.destination = flight.destination
                ctx.origin = flight.origin
                ctx.seats = flight.seats
                ctx.cost = flight.cost
                ctx._id = flight._id

                ctx.isLogged = isLogged()
                ctx.username = sessionStorage.getItem('username');

                ctx.loadPartials({
                    navigation: './templates/common/navigation.hbs',
                    footer: './templates/common/footer.hbs',
                }).then(function () {
                    this.partial('./templates/flights/viewEdit.hbs')
                })
            }).catch(notify.handleError)
        })

        this.post('#/edit/:flightId', function (ctx) {

            let flightId = ctx.params.flightId.substr(1)

            let destination = ctx.params.destination
            let origin = ctx.params.origin
            let departureDate = ctx.params.departureDate
            let departureTime = ctx.params.departureTime
            let seats = ctx.params.seats
            let cost = ctx.params.cost
            let image = ctx.params.img
            let isPublic = ctx.params.public !== undefined

            let departure = departureDate + ' ' + departureTime

            if(destination === '' || origin === ''){
                notify.showError('Destination and Origin cannot be empty.')
            } else if(seats < 0 || cost < 0){
                notify.showError('Seats and Cost should be positive.')
            } else {
                flights.editFlight(flightId, destination, origin, departure, seats, cost, image, isPublic)
                    .then(function (res) {
                        notify.showInfo('Successfully edited flight.')
                        ctx.redirect('#/details/:'+flightId)
                    }).catch(notify.handleError)
            }
        })

        //My Flights

        this.get('#/myFlights', function (ctx) {
            if(!isLogged()){
                ctx.redirect('index.html')
                return
            }
            flights.getMyFlights(sessionStorage.getItem('userId'))
                .then(function (flights) {

                    flights.forEach((f) =>{
                        let date =  new Date(f.departure)

                        f.date = date.getDate() + ' ' + (strArray[date.getMonth() + 1])

                        let hours = "0" + date.getHours()
                        let minutes = "0" + date.getMinutes()
                        f.time = hours.slice(-2) + ":" + minutes.slice(-2)
                    })

                    ctx.flights = flights
                    ctx.isLogged = isLogged()
                    ctx.username = sessionStorage.getItem('username')
                    ctx.loadPartials({
                        myFlight: './templates/flights/myFlight.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                    }).then(function () {
                        this.partial('./templates/flights/viewMyFlights.hbs')
                    })
                }).catch(notify.handleError)
        })

        //Delete

        this.get('#/delete/:flightId', function (ctx) {
            if(!isLogged()){
                ctx.redirect('index.html')
                return
            }
            let flightId = ctx.params.flightId.substr(1)

            flights.getFlightById(flightId).then(function (flight) {
                if(flight._acl.creator === sessionStorage.getItem('userId')){
                    flights.deleteFlight(flightId).then(function () {
                        notify.showInfo('Flight deleted.')
                        ctx.redirect('#/myFlights')
                    })
                }
            }).catch(notify.handleError)

        })
        
        

        function welcomePage(ctx) {

            ctx.isLogged = isLogged()
            ctx.username = sessionStorage.getItem('username');

            if(isLogged()){
                flights.getAllFlights().then(function (flights) {

                    flights.forEach((f) =>{
                        let date = new Date(f.departure.split(' ')[0])
                        f.time = date.getDate() + ' ' + (strArray[date.getMonth() + 1])
                    })

                    ctx.flights = flights
                    ctx.loadPartials({
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                        catalog: './templates/flights/catalog.hbs',
                        flight: './templates/flights/flight.hbs',
                    }).then(function () {
                        this.partial('./templates/home/viewHome.hbs')
                    })
                }).catch(notify.handleError)
            } else{
                ctx.loadPartials({
                    footer: './templates/common/footer.hbs',
                    navigation: './templates/common/navigation.hbs'
                }).then(function () {
                    this.partial('./templates/home/viewHome.hbs')
                })
            }



        }

        function isLogged() {
            return sessionStorage.getItem('username') !== null
        }


    });



    app.run();
});