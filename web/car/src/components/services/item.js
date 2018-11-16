import React from 'react';

class ServiceItemComponent extends React.Component {
    render() {
        return <li className="service_row">
            <div className="service_row__odo">
                <span>{this.props.model.odo}</span>
                <span>км</span>
            </div>
            <div className="service_row__date">
                <span>{this.props.model.date}</span>
            </div>
            <div className="service_row__comment">{this.props.model.comment}</div>
        </li>;
    }
}

export default ServiceItemComponent;