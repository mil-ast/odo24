import React, { Component } from 'react';
import MessageError from '../../components/errors/MessageError';

class FormConfirm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error : null,
        };
    }

    render() {
        return (<form id="auth_form_confirm" onSubmit={this.Submit.bind(this)} action="/api/register" method="POST">
            <div className="form__row">
                <p className="description">На <b>{this.props.data.login}</b> был отправлен код подтверждения.<br/>Введите его в поле ниже для заврешения регистрации.</p>
            </div>
            <div className="form__row">
                <input autoFocus tabIndex="1" className="form__input" type="number" name="code" required autoComplete="off" placeholder="Код подтверждения" />
            </div>
            <div className="form__row form__row_grid">
                <button tabIndex="2" className="form__button">Завершить</button>
                <div>
                    <a id="button_prev" onClick={this.ClickPrev.bind(this)} className="button-back" href="/"><i className="material-icons">keyboard_arrow_left</i><span>Назад</span></a>
                    <span className="step">
                        <span>Шаг</span>
                        <span>2</span>
                        <span>из 2</span>
                    </span>
                </div>
            </div>
            <MessageError error={this.state.error} />
        </form>);
    }

    Submit(e) {
        e.preventDefault();

        const body = {
            login : this.props.data.login,
            password : this.props.data.password,
            code : e.target.code.value|0,
        };
    
        const request = {
            method: 'POST',
            body: JSON.stringify(body)
        };
        fetch('/api/register', request).then((res) => {
            if (res.status === 201) {
                localStorage.setItem('login', this.props.data.login);
                localStorage.setItem('password', this.props.data.password);

                window.location.replace('/book/');
            }
        }).catch((err) => {
            console.log(err);
            this.setState({ error : err});
        });
    }

    ClickPrev(e) {
        e.preventDefault();
        this.props.stage.emit('change', 1);
    }
}

export default FormConfirm;
