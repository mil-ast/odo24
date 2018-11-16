export default class GroupsCollection {
    constructor() {
        this.url = '/api/groups/public/';
    }

    get(avto_id) {
        return fetch(`${this.url}?avto_id=${avto_id}`).then((res) => {
            return res.json();
        });
    }
}