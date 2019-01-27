import React, { Component } from 'react';

class Success extends Component {
    render() {
        return (<div>
            <h3 className="form-block__title">
                <i className="material-icons">fingerprint</i>
                <span>Регистрация прошла успешно!</span>
            </h3>
            <div>
                <p>Теперь можно перейти к <a href="/book/">авторизации</a> для начала работы!</p>
            </div>
        </div>);
    }
}

export default Success;
