export default class ServicesCollection {
    constructor() {
        this.url = '/api/services/public/';
    }

    get(avto_id) {
        return fetch(`${this.url}?avto_id=${avto_id}`).then((res) => {
            return res.json();
        });
    }
}