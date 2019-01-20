import React, { Component } from 'react';
import FormRegister from './components/formRegister/FormRegister';
import Success from './components/success/Success';
import { EventEmitter } from 'events';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = { stage: 1 }

        this.data = {
            login : '',
            password : '',
        };

        this.step = new EventEmitter();
        this.step.on('change', (v) => {
            this.setState({ stage : v });
            this.render();
        });
    }

    render() {
        switch(this.state.stage) {
        case 2:
            return <Success data={this.data}/>;
        default:
            return <FormRegister stage={this.step} data={this.data}/>;
        }
    }
}

export default App;
