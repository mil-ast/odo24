import React from 'react';
import ServiceItemComponent from './item';
import './service_rows.css';

class ServicesComponent extends React.Component {
    render() {
        const services = this.props.models.filter((item) => {
            return item.group_id === this.props.selected_group_id;
        });

        return <div className="content__column">
            <div className="title-block">
                <h2 className="title-medium">Записи</h2>
            </div>
            <ul className="services-list">
                {services.map((s) => 
                    <ServiceItemComponent
                        key={s.service_id}
                        model={s}
                        avto_id={this.props.avto_id}
                    />
                )}
            </ul>
        </div>;
    };
}

export default ServicesComponent;