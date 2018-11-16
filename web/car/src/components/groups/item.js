import React from 'react';
import { Link } from 'react-router-dom';

class GroupItemComponent extends React.Component {
    render() {
        const className = 'group_row '.concat(this.props.checked ? 'group_row__checked' : '');

        return <li className={className}>
            <Link to={`/car/${this.props.avto_id}/${this.props.model.group_id}`}>{this.props.model.name}</Link>
            <span className="group_row__count"><i>{this.props.count}</i></span>
        </li>;
    };

    Click(el) {
        el.preventDefault();

        this.props.setGroupId(this.props.model.group_id);
    }
}

export default GroupItemComponent;