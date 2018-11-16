import React from 'react';

class AvtoComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            avto : {},
        };

        this.fetchAvto();
    }

    fetchAvto() {
        const avto_id = window.location.pathname.substr(1).split('/')[1]|0;
        
        fetch(`/api/avto/public/?id=${avto_id}`).then((res) => {
            return res.json();
        }).then((avto) => {
            this.setState({
                avto : avto,
            });
        }).catch((err) => {
            console.error(err);
        });
    }

    render() {
        const avto = this.state.avto;

        let avatar_img = '/assets/images/no_photo.png';
        if (avto.avatar) {
            avatar_img = `/api/images/medium/${avto.avto_id}.jpg`;
        }

        return(<div id="car_item">
            <div><img src={avatar_img} alt={avto.name} /></div>
            <div>{avto.name}</div>
            { (avto.odo > 0) ? <div>{avto.odo}км</div> : null }
        </div>);
    }
}

export default AvtoComponent;