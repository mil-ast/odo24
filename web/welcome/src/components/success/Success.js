import React, { Component } from 'react';

class Success extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div>
            <h2>Регистрация прошла успешно!</h2>
            <div>
                <p>Теперь можно перейти к <a href="/book/">авторизации</a> для начала работы!</p>
            </div>
        </div>);
    }
}

export default Success;
