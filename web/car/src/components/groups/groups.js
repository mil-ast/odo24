import React from 'react';
import GroupItemComponent from './item';

import './group_rows.css';

class GroupsComponent extends React.Component {
    render() {
        return(<div className="content__column" id="groups">
            <div className="title-block">
                <h2 className="title-medium">Группы</h2>
            </div>
            <ul className="groups">
                {this.props.models.map(g => <GroupItemComponent
                    key={g.group_id}
                    checked={this.props.selected_group_id === g.group_id}
                    model={g}
                    avto_id={this.props.avto_id}
                    count={this.props.count_services.get(g.group_id)|0} />
                )}
            </ul>
        </div>);
    }
}

export default GroupsComponent;