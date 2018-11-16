import React from 'react';
import { Redirect } from 'react-router-dom';

import GroupsComponent from './components/groups/groups';
import ServicesComponent from './components/services/services';
// коллекции
import GroupsCollection from './collection/groups';
import ServicesCollection from './collection/services';

import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            avto_id : 0,
            selected_group_id : 0,
            groups : [],
            services : []
        };

        const avto_id = window.parseInt(this.props.match.params.avto_id);
        if (isNaN(avto_id)) {
            throw new Error('id is NaN');
        }

        // синхронизируем группы и сервисы
        const collection_groups = new GroupsCollection();
        const collection_services = new ServicesCollection();

        Promise.all([
            collection_groups.get(avto_id),
            collection_services.get(avto_id),
        ]).then(this.onSyncAll.bind(this))
    }

    render() {
        try {
            const avto_id = window.parseInt(this.props.match.params.avto_id);
            if (isNaN(avto_id)) {
                throw new Error('avto_id is NaN');
            }

            let group_id = this.props.match.params.group_id|0;
            if (group_id === 0 || isNaN(group_id)) {
                if (this.state.selected_group_id > 0) {
                    group_id = this.state.selected_group_id;
                    return <Redirect to={`/car/${avto_id}/${group_id}`}/>;
                } else {
                    group_id = 0;
                }
            }

            const count_services = new Map();
            this.state.services.forEach((item) => {
                let cnt = count_services.get(item.group_id)|0;
                count_services.set(item.group_id, cnt+1);
            });

            return <div id="content">
                <GroupsComponent
                    models={this.state.groups}
                    selected_group_id={group_id}
                    avto_id={avto_id}
                    count_services={count_services}
                />
                <ServicesComponent
                    models={this.state.services}
                    selected_group_id={group_id}
                    avto_id={avto_id}
                />
            </div>;
        } catch(e) {
            console.error(e);

            const el_error = <div id="content">404</div>;
            return el_error;
        }
    }

    /**
     * когда пришли данные групп и сервисов
     */
    onSyncAll(data) {
        const groups = data[0]||[];
        const services = data[1]||[];

        // выбираем первую группу по-умолчанию
        if (groups.length > 0 && this.state.selected_group_id === 0){
            this.setState({
                selected_group_id : groups[0].group_id
            });
        }

        this.setState({
            groups : groups,
            services : services,
        });
    }
}

export default App;
