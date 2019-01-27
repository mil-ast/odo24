import React, { Component } from 'react';
import MessageError from '../errors/messageError';

class FormRegister extends Component {
    constructor(props) {
        super(props);

        this.state = {
            login : this.props.data.login,
            password : this.props.data.password,
            password2 : this.props.data.password,
            error : null,
        };
    }

    render() {
        return (<div>
            <h3 className="form-block__title">
                <i className="material-icons">fingerprint</i>
                <span>Регистрация</span>
            </h3>
            <div>
                <form id="auth_form" onSubmit={this.submit.bind(this)} action="/api/register/confirm" method="POST">
                <div className="form__row">
                    <input autoFocus tabIndex="1" value={this.state.login} onChange={this.handleChange.bind(this)} className="form__input" type="text" name="login" required autoComplete="off" placeholder="E-mail" />
                </div>
                <div className="form__row form__row_grid">
                    <input tabIndex="2" value={this.state.password} onChange={this.handleChange.bind(this)} className="form__input" type="password" name="password" required autoComplete="off" placeholder="Новый пароль" />
                    <input tabIndex="3" value={this.state.password2} onChange={this.handleChange.bind(this)} className="form__input" type="password" name="password2" required autoComplete="off" placeholder="Пароль ещё раз" />
                </div>
                <div className="form__row form__row_grid">
                    <button tabIndex="4" className="form__button">Дальше</button>
                    <div>
                        <span className="step">
                            <span>Шаг</span>
                            <span>1</span>
                            <span>из 2</span>
                        </span>
                    </div>
                </div>
                <MessageError error={this.state.error} />
                <div id="repair">
                    <button type="button" onClick={this.clickRepair.bind(this)}>Восстановить пароль</button>
                </div>
            </form>
        </div>
        </div>);
    }

    handleChange(e) {
        const value = e.target.value;
        const newState = {};
        newState[e.target.name] = value;

        this.setState(newState);
    }

    setError(err) {
        this.setState({ error : err});
    }

    submit(e) {
        e.preventDefault();

        this.setState({ error : null});

        const reg_email = new RegExp(/\S+@\S+\.\S+/);
        const classError = 'form__input form__input__error';
    
        const login = e.target.login.value;
        const passwd = e.target.password.value;
        const passwd2 = e.target.password2.value;
    
        this.props.data.login = login;
        this.props.data.password = passwd;

         e.target.login.className = 'form__input';
    
        if (!reg_email.test(login)) {
            e.target.login.className = classError;
            this.setError('incorrect_email');
            return false;
        }
    
        if (passwd.length < 5) {
            e.target.password.className = classError;
            this.setError('password_length');
            return false;
        } else if (passwd !== passwd2) {
            e.target.password2.className = classError;
            this.setError('password_diff');
            return false;
        }

        const body = {
            login : login,
            password: passwd,
        };
    
        const request = {
            method: 'POST',
            body: JSON.stringify(body)
        };
        fetch('/api/register', request).then((res) => {
            switch(res.status) {
            case 201:
                this.props.stage.emit('change', 2);
            break;
            case 409:
                this.setError('login_busy');
            break;
            default:
                this.setError('any');
            }
        }).catch((err) => {
            console.log(err);
            this.setError('any');
        });
        return false;
    }

    clickRepair() {
        this.props.stage.emit('change', 3);
    }
}

export default FormRegister;
