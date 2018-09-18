$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs')

        //HOME
        this.get('index.html', displayHome)
        this.get('#/home', displayHome)
        
        //REGISTER
        
        this.get('#/register', function (ctx) {
            ctx.isLogged = isLogged()

            ctx.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/home/register.hbs')
            }).catch(notify.handleError)
        })

        this.post('#/register', function (ctx) {
            let username = ctx.params.username
            let password = ctx.params.password
            let repeatPass = ctx.params.repeatPass

           if(!/^[a-zA-Z]{3,}$/.test(username)){
                notify.showError('Username should be at least 3 latin letters.')
           } else if(!/^[a-zA-Z0-9]{6,}$/.test(password)){
               notify.showError('Password should be at least 6 latin letters or digits.')
           } else if(password !== repeatPass){
               notify.showError('Both passwords must match.')
           } else{
              auth.register(username, password).then(function (userInfo) {
                  notify.showInfo('User registration successful.')
                  auth.saveSession(userInfo)
                  ctx.redirect('#/allCars')
              }).catch(notify.handleError)
           }
        })

        //LOGIN

        this.get('#/login', function (ctx) {
            ctx.isLogged = isLogged()

            ctx.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/home/login.hbs')
            }).catch(notify.handleError)
        })

        this.post('#/login', function (ctx) {
            let username = ctx.params.username
            let password = ctx.params.password

            if(!/^[a-zA-Z]{3,}$/.test(username)){
                notify.showError('Username should be at least 3 latin letters.')
            } else if(!/^[a-zA-Z0-9]{6,}$/.test(password)){
                notify.showError('Password should be at least 6 latin letters or digits.')
            } else{
                auth.login(username, password).then(function (userInfo) {
                    notify.showInfo('Login successful.')
                    auth.saveSession(userInfo)
                    ctx.redirect('#/allCars')
                }).catch(notify.handleError)
            }
        })

        //LOGOUT

        this.get('#/logout', function (ctx) {
            auth.logout().then(function () {
                notify.showInfo('Logout successful.')
                sessionStorage.clear()
                ctx.redirect('#/login')
            }).catch(notify.handleError)
        })
        
        //CATALOG
        
        this.get('#/allCars', function (ctx) {
            if(!isLogged()){
                ctx.redirect('#/home')
                return
            }
            ctx.isLogged = isLogged()
            ctx.username = sessionStorage.getItem('username')
            
            cars.getAllCars().then(function (cars) {
                cars.forEach((c) => {
                    c.isAuthor = c._acl.creator === sessionStorage.getItem('userId')
                })

                ctx.cars = cars

                ctx.loadPartials({
                    navigation: './templates/common/navigation.hbs',
                    footer: './templates/common/footer.hbs',
                    car: './templates/catalog/car.hbs'
                }).then(function () {
                    this.partial('./templates/catalog/carListing.hbs')
                })

            }).catch(notify.handleError)
        })

        //CREATE
        this.get('#/create', function (ctx) {
            if(!isLogged()){
                ctx.redirect('#/home')
                return
            }
            ctx.isLogged = isLogged()
            ctx.username = sessionStorage.getItem('username')


            ctx.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/create/createView.hbs')
            }).catch(notify.handleError)
        })
        
        this.post('#/create', function (ctx) {
            let title = ctx.params.title
            let description = ctx.params.description
            let brand = ctx.params.brand
            let model = ctx.params.model
            let year = ctx.params.year
            let imageUrl = ctx.params.imageUrl
            let fuelType = ctx.params.fuelType
            let price = ctx.params.price
            let seller = sessionStorage.getItem('username')

            if(validateCar(brand, description, fuelType, imageUrl,model, price, title, year)){
                cars.createCar(brand, description, fuelType, imageUrl, true, model, price, seller, title, year )
                    .then(function () {
                        notify.showInfo('Listing created.')
                        ctx.redirect('#/allCars')
                    }).catch(notify.handleError)
            }
        })

        //EDIT

        this.get('#/edit/:carId', function (ctx) {
            if(!isLogged()){
                ctx.redirect('#/home')
                return
            }
            ctx.isLogged = isLogged()
            ctx.username = sessionStorage.getItem('username')

            let carId = ctx.params.carId.substr(1)

            cars.getCarById(carId).then(function (car) {
                ctx.id = car._id
                ctx.title = car.title
                ctx.description = car.description
                ctx.brand = car.brand
                ctx.model = car.model
                ctx.year = car.year
                ctx.imageUrl = car.imageUrl
                ctx.fuel = car.fuel
                ctx.price = car.price

                ctx.loadPartials({
                    navigation: './templates/common/navigation.hbs',
                    footer: './templates/common/footer.hbs',
                    editForm: './templates/edit/editForm.hbs',
                }).then(function () {
                    this.partial('./templates/edit/editView.hbs')
                }).catch(notify.handleError)
            })

        })

        this.post('#/edit/:carId', function (ctx) {

            let carId = ctx.params.carId.substr(1)
            let title = ctx.params.title
            let description = ctx.params.description
            let brand = ctx.params.brand
            let model = ctx.params.model
            let year = ctx.params.year
            let imageUrl = ctx.params.imageUrl
            let fuelType = ctx.params.fuelType
            let price = ctx.params.price
            let seller = sessionStorage.getItem('username')

            if(validateCar(brand, description, fuelType, imageUrl,model, price, title, year)){
                cars.editCar(carId, brand , description, fuelType, imageUrl,true, model, price, seller, title, year)
                    .then(function () {
                        notify.showInfo(`Listing ${title} updated.`)
                        ctx.redirect('#/allCars')
                    }).catch(notify.handleError)
            }

        })


        //DELETE

        this.get('#/delete/:carId', function (ctx) {
            if(!isLogged()){
                ctx.redirect('#/home')
                return
            }
            let carId = ctx.params.carId.substr(1)
            
            cars.deleteCar(carId).then(function () {
                notify.showInfo('Listing deleted.')
                ctx.redirect('#/allCars')
            }).catch(notify.handleError)
        })

        //MY LISTINGS

        this.get('#/myCars', function (ctx) {
            if(!isLogged()){
                ctx.redirect('#/home')
                return
            }
            ctx.isLogged = isLogged()
            ctx.username = sessionStorage.getItem('username')

            cars.getMyCars(sessionStorage.getItem('username')).then(function (cars) {
                ctx.cars = cars

                ctx.loadPartials({
                    navigation: './templates/common/navigation.hbs',
                    footer: './templates/common/footer.hbs',
                    myCars: './templates/catalog/myCars.hbs'
                }).then(function () {
                    this.partial('./templates/catalog/myListing.hbs')
                })

            }).catch(notify.handleError)
        })

        //DETAILS
        this.get('#/details/:carId', function (ctx) {
            if(!isLogged()){
                ctx.redirect('#/home')
                return
            }
            ctx.isLogged = isLogged()
            ctx.username = sessionStorage.getItem('username')

            let carId = ctx.params.carId.substr(1)

            cars.getCarById(carId).then(function (car) {
                ctx.id = car._id
                ctx.title = car.title
                ctx.description = car.description
                ctx.brand = car.brand
                ctx.model = car.model
                ctx.year = car.year
                ctx.imageUrl = car.imageUrl
                ctx.fuel = car.fuel
                ctx.price = car.price
                ctx.isAuthor = car._acl.creator === sessionStorage.getItem('userId')

                ctx.loadPartials({
                    navigation: './templates/common/navigation.hbs',
                    footer: './templates/common/footer.hbs',
                }).then(function () {
                    this.partial('./templates/details/detailView.hbs')
                }).catch(notify.handleError)
            })


        })


        function displayHome(ctx) {
            ctx.isLogged = isLogged()
            ctx.loadPartials({
                navigation: './templates/common/navigation.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/home/homeView.hbs')
            }).catch(notify.handleError)
        }

        function isLogged() {
            return sessionStorage.getItem('username') !== null
        }

        function validateCar(brand, description, fuelType, imageUrl,model, price, title, year){
            if(title === '' || title.length > 33){
                notify.showError('The title must not exceed 33 characters or be empty.')
            } else if(description.length < 30 || description.length > 450){
                notify.showError('The description must not exceed 450 characters and should be at least 30.')
            } else if(brand === '' || brand.length > 11){
                notify.showError('The brand must not exceed 11 characters or be empty.')
            } else if(model.length < 4 || model.length > 11){
                notify.showError('The model must not exceed 11 characters and should be at least 4.')
            }else if(year.length !== 4){
                notify.showError('The year must be exactly 4 chars long.')
            } else if(!imageUrl.startsWith('http')){
                notify.showError('Image url should always start with “http”.')
            }else if(fuelType === '' || fuelType.length > 11){
                notify.showError('The fuel type must not exceed 11 characters or be empty.')
            } else if(price > 1000000 || price <= 0){
                notify.showError('The maximum price is 1000000$ and should be positive number')
            } else{
                return true
            }

            return false
        }
    })
    app.run();
});