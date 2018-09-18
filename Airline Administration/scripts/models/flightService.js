let flights = (() => {
    function getAllFlights() {
        const endpoint = 'flights?query={"isPublished":"true"}';

        return requester.get('appdata', endpoint, 'kinvey');
    }
    
    function createFlight(destination, origin, departure, seats, cost, image, isPublished) {
        let data = {destination, origin, departure, seats, cost, image, isPublished };

        return requester.post('appdata', 'flights', 'kinvey', data);
    }

    function editFlight(flightId, destination, origin, departure, seats, cost, image, isPublished) {
        const endpoint = `flights/${flightId}`;
        let data = { destination, origin, departure, seats, cost, image, isPublished };

        return requester.update('appdata', endpoint, 'kinvey', data);
    }
    
    function deleteFlight(flightId) {
        const endpoint = `flights/${flightId}`;

        return requester.remove('appdata', endpoint, 'kinvey');
    }

    function getMyFlights(userId) {
        const endpoint = `flights?query={"_acl.creator":"${userId}"}`;

        return requester.get('appdata', endpoint, 'kinvey');
    }

    function getFlightById(flightId) {
        const endpoint = `flights/${flightId}`;

        return requester.get('appdata', endpoint, 'kinvey');
    }

    return {
        getAllFlights,
        createFlight,
        editFlight,
        deleteFlight,
        getFlightById,
        getMyFlights
    }
})();