--
-- PostgreSQL database dump
--

-- Dumped from database version 11.6 (Debian 11.6-1.pgdg80+1)
-- Dumped by pg_dump version 11.6 (Debian 11.6-1.pgdg80+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cars; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA cars;


ALTER SCHEMA cars OWNER TO postgres;

--
-- Name: profiles; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA profiles;


ALTER SCHEMA profiles OWNER TO postgres;

--
-- Name: service_groups; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA service_groups;


ALTER SCHEMA service_groups OWNER TO postgres;

--
-- Name: services; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA services;


ALTER SCHEMA services OWNER TO postgres;

--
-- Name: createauto(character varying, integer, bigint); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.createauto(_name character varying, _odo integer, _user_id bigint) RETURNS TABLE(auto_id bigint, avatar boolean)
    LANGUAGE plpgsql
    AS $$
declare
	_auto_id int8;
begin
	if length(_name) = 0 then
		raise 'bad_request';
	end if;

	insert into cars.auto (name,odo,user_id,avatar) values (_name, _odo, _user_id, false)
	returning cars.auto.auto_id
	into _auto_id;

	return query
	select _auto_id, false;
end
$$;


ALTER FUNCTION cars.createauto(_name character varying, _odo integer, _user_id bigint) OWNER TO pavel;

--
-- Name: deleteauto(bigint, bigint); Type: PROCEDURE; Schema: cars; Owner: pavel
--

CREATE PROCEDURE cars.deleteauto(_auto_id bigint, _user_id bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM cars.auto
	WHERE auto_id = _auto_id AND user_id = _user_id;
	
	IF NOT FOUND THEN
		RAISE 'auto not found';
	END IF;

	DELETE FROM services.services
	WHERE auto_id = _auto_id;
END;
$$;


ALTER PROCEDURE cars.deleteauto(_auto_id bigint, _user_id bigint) OWNER TO pavel;

--
-- Name: get_all(bigint); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.get_all(_user_id bigint) RETURNS TABLE(auto_id bigint, name character varying, odo integer, avatar boolean)
    LANGUAGE sql
    AS $$
	select  a.auto_id,
			a.name,
			a.odo,
			a.avatar
	from cars.auto a
	where a.user_id = _user_id;
$$;


ALTER FUNCTION cars.get_all(_user_id bigint) OWNER TO pavel;

--
-- Name: updateauto(bigint, bigint, integer, character varying, boolean); Type: PROCEDURE; Schema: cars; Owner: pavel
--

CREATE PROCEDURE cars.updateauto(_auto_id bigint, _user_id bigint, _odo integer, _name character varying, _avatar boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
	UPDATE cars.auto
	SET "name" = _name,
		odo = _odo,
		avatar = CASE
					WHEN _avatar IS NOT NULL THEN
					_avatar
					ELSE avatar
				END
	WHERE auto_id = _auto_id AND user_id = _user_id;

	IF NOT FOUND THEN
		RAISE 'auto not found';
	END IF;
END;
$$;


ALTER PROCEDURE cars.updateauto(_auto_id bigint, _user_id bigint, _odo integer, _name character varying, _avatar boolean) OWNER TO pavel;

--
-- Name: updateodo(bigint, bigint, integer); Type: PROCEDURE; Schema: cars; Owner: pavel
--

CREATE PROCEDURE cars.updateodo(_auto_id bigint, _user_id bigint, _odo integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
	UPDATE cars.auto
	SET odo = _odo
	WHERE auto_id = _auto_id AND user_id = _user_id;

	IF NOT FOUND THEN
		RAISE 'auto not found';
	END IF;
END;
$$;


ALTER PROCEDURE cars.updateodo(_auto_id bigint, _user_id bigint, _odo integer) OWNER TO pavel;

--
-- Name: confirm(character varying, bigint, character varying, boolean); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.confirm(_login character varying, _code bigint, _link_key character varying DEFAULT NULL::character varying, _is_reset boolean DEFAULT NULL::boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare
	_user_id int8;
	_attempts int2;
	_curr_code int8;
	_curr_link_key varchar(32);
	_dt timestamp;
begin
	if _is_reset = true then
		select u.user_id
		into _user_id
		from profiles.users u where u.login = _login;
	
		insert into profiles.confirmations (user_id, link_key, code)
		values (_user_id, _link_key, _code)
		on conflict (user_id) do update set code = _code, link_key = _link_key;
		
		return null;
	end if;
	
	select  u.user_id,
			c.dt,
			c.attempts,
			c.code,
			c.link_key
	into 	_user_id,
			_dt,
			_attempts,
			_curr_code,
			_curr_link_key
	from profiles.users u
	inner join profiles.confirmations c on c.user_id = u.user_id
	where u.login = _login;

	if not found then
		return false;
	end if;

	if extract (epoch from (now() - _dt))::integer/60 > 60 then
		delete from profiles.confirmations c where c.user_id = _user_id;
		return false;
	end if;

	if _attempts >= 5 then
		return false;
	end if;
	
	if (_link_key is not null and _curr_code != _code)
	or (_link_key is not null and _link_key != _curr_link_key) then
		update profiles.confirmations
		set attempts = attempts+1
		where profiles.confirmations.user_id = _user_id;

		return false;
	end if;

	update profiles.users set confirmed = true
	where user_id = _user_id;

	delete from profiles.confirmations c where c.user_id = _user_id;

	return true;
end;
$$;


ALTER FUNCTION profiles.confirm(_login character varying, _code bigint, _link_key character varying, _is_reset boolean) OWNER TO pavel;

--
-- Name: get_profile(bigint); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.get_profile(_user_id bigint) RETURNS TABLE(user_id bigint, login character varying, confirmed boolean)
    LANGUAGE sql
    AS $$
	select  u.user_id,
			u.login,
			u.confirmed
	from profiles.users u where u.user_id = _user_id;
$$;


ALTER FUNCTION profiles.get_profile(_user_id bigint) OWNER TO pavel;

--
-- Name: login(character varying, bytea); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.login(_login character varying, _passwd bytea) RETURNS TABLE(user_id bigint, login character varying, confirmed boolean)
    LANGUAGE plpgsql
    AS $$
declare
	_user_id int8;
	_confirmed bool;
	_password_hash bytea;
begin
	if _login = '' then
		raise 'login is empty';
	end if;
	
	select  u.user_id,
			u.confirmed,
			u.password_hash
	into 	_user_id,
			_confirmed,
			_password_hash
	from profiles.users u where LOWER(u.login)=LOWER(_login);
	if not found then
		raise 'user not found';
	end if;

	if _confirmed = false then
		raise 'user not found';
	end if;

	if _password_hash is null or sha256(_passwd) != _password_hash then
		raise 'password error';
	end if;

	update profiles.users u
	set last_login_dt = now()
	where u.user_id = _user_id;

	return query
	select  u.user_id,
			u.login,
			u.confirmed
	from profiles.users u where u.user_id = _user_id;
end
$$;


ALTER FUNCTION profiles.login(_login character varying, _passwd bytea) OWNER TO pavel;

--
-- Name: oauth_getprofile(character varying, bytea); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.oauth_getprofile(_login character varying, _passwd bytea DEFAULT NULL::bytea) RETURNS TABLE(user_id bigint, login character varying, is_new boolean)
    LANGUAGE plpgsql
    AS $$
DECLARE
	_user_id int8;
	_is_new bool = false;
BEGIN
	IF octet_length(_login) < 4 THEN
		RAISE 'login is empty';
	END IF;

	SELECT u.user_id
	INTO   _user_id
	FROM profiles.users u
	WHERE LOWER(u.login) = LOWER(_login);

	IF NOT FOUND THEN
		INSERT INTO profiles.users
			(login,password_hash,confirmed,oauth,last_login_dt)
		VALUES
			(
				_login,
				CASE
					WHEN _passwd IS NOT NULL THEN sha256(_passwd)
					ELSE NULL
				END,
				true,
				true,
				now()
			)
		RETURNING profiles.users.user_id INTO _user_id;
	
		_is_new = TRUE;
	ELSE
		UPDATE profiles.users
		SET  last_login_dt=now()
		WHERE profiles.users.user_id = _user_id;
	END IF;

	CALL service_groups.create_for_new_user(_user_id);

	RETURN query
	SELECT _user_id, _login, _is_new;
end
 $$;


ALTER FUNCTION profiles.oauth_getprofile(_login character varying, _passwd bytea) OWNER TO pavel;

--
-- Name: password_recovery(character varying, bigint, character varying); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.password_recovery(_login character varying, _code bigint, _link_key character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
	_user_id bigint = null;
BEGIN
	if _login = '' then
		raise 'login is empty';
	end if;

	select u.user_id
	into  _user_id
	from profiles.users u
	where LOWER(u.login)=LOWER(_login);

	if not found then
		raise 'login not found';
	end if;

	insert into profiles.confirmations (user_id, link_key, code)
	values (_user_id, _link_key, _code)
	on conflict (user_id) do update set link_key = _link_key, code = _code;
END;
$$;


ALTER FUNCTION profiles.password_recovery(_login character varying, _code bigint, _link_key character varying) OWNER TO pavel;

--
-- Name: password_update(bigint, bytea); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.password_update(_user_id bigint, _passwd bytea) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
	if _passwd = '' or _passwd is null then
		raise 'password is empty';
	end if;

	perform from profiles.users u
	where u.user_id = _user_id;

	if not found then
		raise exception 'login not found';
	end if;

	update profiles.users
	set password_hash = sha256(_passwd)
	where user_id = _user_id;
END;
$$;


ALTER FUNCTION profiles.password_update(_user_id bigint, _passwd bytea) OWNER TO pavel;

--
-- Name: register(character varying, bigint, character varying); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.register(_login character varying, _code bigint, _link_key character varying) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
declare
	_confirmed bool;
	_user_id bigint = null;
BEGIN
	SELECT u.user_id,
		   u.confirmed
	INTO  _user_id,
		  _confirmed
	FROM profiles.users u
	WHERE LOWER(u.login)=LOWER(_login);

	IF FOUND AND _confirmed = true THEN
		RAISE 'login is exists';
	END IF;

	IF _user_id IS null THEN
		INSERT INTO profiles.users (login, password_hash, confirmed)
		VALUES (_login, null, false)
		RETURNING user_id INTO _user_id;
	END IF;
	
	INSERT INTO profiles.confirmations (user_id, link_key, code)
	VALUES (_user_id, _link_key, _code)
	ON CONFLICT (user_id) DO UPDATE SET link_key = _link_key, code = _code;

	CALL service_groups.create_for_new_user(_user_id);
	
	RETURN _user_id;
END;
$$;


ALTER FUNCTION profiles.register(_login character varying, _code bigint, _link_key character varying) OWNER TO pavel;

--
-- Name: reset_password(character varying, bytea, bigint, character varying); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.reset_password(_login character varying, _passwd bytea, _code bigint, _link_key character varying DEFAULT NULL::character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare
	_user_id int8;
	_attempts int2;
	_curr_code int8;
	_curr_link_key varchar(32);
begin
	select  u.user_id,
			c.attempts,
			c.code,
			c.link_key
	into 	_user_id,
			_attempts,
			_curr_code,
			_curr_link_key
	from profiles.users u
	inner join profiles.confirmations c on c.user_id = u.user_id
	where u.login = _login;
	
	if not found then
		return false;
	end if;

	if _attempts >= 5 then
		return false;
	end if;

	if (_link_key is not null and _curr_code != _code)
	or (_link_key is not null and _link_key != _curr_link_key) then
		update profiles.confirmations
		set attempts = attempts+1
		where profiles.confirmations.user_id = _user_id;

		return false;
	end if;

	update profiles.users
	set password_hash = sha256(_passwd), confirmed = true
	where user_id = _user_id;

	delete from profiles.confirmations c where c.user_id = _user_id;

	return true;
END;
$$;


ALTER FUNCTION profiles.reset_password(_login character varying, _passwd bytea, _code bigint, _link_key character varying) OWNER TO pavel;

--
-- Name: create_for_new_user(bigint); Type: PROCEDURE; Schema: service_groups; Owner: pavel
--

CREATE PROCEDURE service_groups.create_for_new_user(_user_id bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
	INSERT INTO service_groups.service_groups
		(group_name, user_id, sort)
	SELECT dg.group_name, _user_id, dg.sort
	FROM service_groups.defaut_groups dg;
END;
$$;


ALTER PROCEDURE service_groups.create_for_new_user(_user_id bigint) OWNER TO pavel;

--
-- Name: delete_group(bigint, bigint); Type: PROCEDURE; Schema: service_groups; Owner: pavel
--

CREATE PROCEDURE service_groups.delete_group(_group_id bigint, _user_id bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM service_groups.service_groups
	WHERE group_id = _group_id AND user_id = _user_id;

	IF NOT FOUND THEN
		RAISE 'not found';
	END IF;

	DELETE FROM services.services
	WHERE group_id = _group_id;
END;
$$;


ALTER PROCEDURE service_groups.delete_group(_group_id bigint, _user_id bigint) OWNER TO pavel;

--
-- Name: getforuser(bigint); Type: FUNCTION; Schema: service_groups; Owner: pavel
--

CREATE FUNCTION service_groups.getforuser(_user_id bigint) RETURNS TABLE(group_id integer, group_name character varying, sort integer)
    LANGUAGE sql
    AS $$
	select  g.group_id,
			g.group_name,
			g.sort
	from service_groups.service_groups g
	where g.user_id = _user_id;
$$;


ALTER FUNCTION service_groups.getforuser(_user_id bigint) OWNER TO pavel;

--
-- Name: new_group(bigint, character varying); Type: FUNCTION; Schema: service_groups; Owner: pavel
--

CREATE FUNCTION service_groups.new_group(_user_id bigint, _group_name character varying) RETURNS TABLE(group_id bigint, sort integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF NOT EXISTS (
		SELECT u.user_id
		FROM profiles.users u
		WHERE u.user_id = _user_id
	) THEN
		RAISE 'user not found';
	END IF;

	RETURN query
	WITH cte AS (
		SELECT max(g.sort) max_sort
		FROM service_groups.service_groups g
		WHERE g.user_id = _user_id
	),
	cte_inserted AS (
		INSERT INTO service_groups.service_groups
		(group_name, user_id, sort)
		SELECT _group_name, _user_id, cte.max_sort + 1 FROM cte
		RETURNING   service_groups.service_groups.group_id::int8,
					service_groups.service_groups.sort::int4
	)
	SELECT cte_inserted.group_id, cte_inserted.sort
	FROM cte_inserted;
END;
$$;


ALTER FUNCTION service_groups.new_group(_user_id bigint, _group_name character varying) OWNER TO pavel;

--
-- Name: update_group(bigint, bigint, character varying); Type: PROCEDURE; Schema: service_groups; Owner: pavel
--

CREATE PROCEDURE service_groups.update_group(_group_id bigint, _user_id bigint, _group_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
	UPDATE service_groups.service_groups
	SET group_name = _group_name
	WHERE group_id = _group_id AND user_id = _user_id;
	
	IF NOT FOUND THEN
		RAISE 'not found';
	END IF;
END;
$$;


ALTER PROCEDURE service_groups.update_group(_group_id bigint, _user_id bigint, _group_name character varying) OWNER TO pavel;

--
-- Name: update_sort(bigint, bigint[]); Type: PROCEDURE; Schema: service_groups; Owner: pavel
--

CREATE PROCEDURE service_groups.update_sort(_user_id bigint, _sortered bigint[])
    LANGUAGE plpgsql
    AS $$
BEGIN
	UPDATE service_groups.service_groups
	SET sort = s.idx
	FROM (
		SELECT * FROM LATERAL unnest(_sortered) WITH ORDINALITY AS t(id, idx)
	) s
	WHERE user_id = _user_id AND group_id = s.id;
END;
$$;


ALTER PROCEDURE service_groups.update_sort(_user_id bigint, _sortered bigint[]) OWNER TO pavel;

--
-- Name: create_service(bigint, bigint, bigint, integer, integer, date, text, integer); Type: FUNCTION; Schema: services; Owner: pavel
--

CREATE FUNCTION services.create_service(_auto_id bigint, _user_id bigint, _group_id bigint, _odo integer, _next_distance integer, _dt date, _descript text, _price integer) RETURNS TABLE(service_id bigint)
    LANGUAGE plpgsql
    AS $$
DECLARE
	_service_id int8;
BEGIN
	IF NOT EXISTS(
		SELECT a.auto_id FROM cars.auto a
		WHERE a.auto_id = _auto_id AND a.user_id = _user_id
	) THEN
		RAISE 'auto not found';
	END IF;

	IF NOT EXISTS(
		SELECT g.group_id FROM service_groups.service_groups g
		WHERE g.group_id = _group_id AND g.user_id = _user_id
	) THEN
		RAISE 'group not found';
	END IF;
	
	INSERT INTO services.services (auto_id, user_id, group_id, odo, next_distance, dt, description, price)
	VALUES
	(_auto_id, _user_id, _group_id, _odo, _next_distance, _dt, _descript, _price)
	RETURNING services.services.service_id INTO _service_id;
	
	RETURN query SELECT _service_id;
END;
$$;


ALTER FUNCTION services.create_service(_auto_id bigint, _user_id bigint, _group_id bigint, _odo integer, _next_distance integer, _dt date, _descript text, _price integer) OWNER TO pavel;

--
-- Name: delete_service(bigint, bigint); Type: PROCEDURE; Schema: services; Owner: pavel
--

CREATE PROCEDURE services.delete_service(_service_id bigint, _user_id bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF NOT EXISTS(
		SELECT s.service_id FROM services.services s
		WHERE s.service_id = _service_id AND s.user_id = _user_id
	) THEN
		RAISE 'service not found';
	END IF;

	DELETE FROM services.services
	WHERE service_id = _service_id;
END;
$$;


ALTER PROCEDURE services.delete_service(_service_id bigint, _user_id bigint) OWNER TO pavel;

--
-- Name: get_all(bigint, bigint, bigint); Type: FUNCTION; Schema: services; Owner: pavel
--

CREATE FUNCTION services.get_all(_user_id bigint, _auto_id bigint, _group_id bigint) RETURNS TABLE(service_id bigint, odo integer, next_distance integer, dt date, description text, price integer)
    LANGUAGE sql
    AS $$
	select  s.service_id,
			s.odo,
			s.next_distance,
			s.dt,
			s.description,
			s.price
	from services.services s
	where s.user_id = _user_id and s.auto_id = _auto_id and s.group_id = _group_id;
$$;


ALTER FUNCTION services.get_all(_user_id bigint, _auto_id bigint, _group_id bigint) OWNER TO pavel;

--
-- Name: update_service(bigint, bigint, integer, integer, timestamp without time zone, text, integer); Type: PROCEDURE; Schema: services; Owner: pavel
--

CREATE PROCEDURE services.update_service(_service_id bigint, _user_id bigint, _odo integer, _next_distance integer, _dt timestamp without time zone, _descript text, _price integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF NOT EXISTS(
		SELECT s.service_id FROM services.services s
		WHERE s.service_id = _service_id AND s.user_id = _user_id
	) THEN
		RAISE 'service not found';
	END IF;

	UPDATE services.services
	SET odo = _odo,
		next_distance = _next_distance,
		dt = _dt,
		description = _descript,
		price = _price
	WHERE service_id = _service_id;
END;
$$;


ALTER PROCEDURE services.update_service(_service_id bigint, _user_id bigint, _odo integer, _next_distance integer, _dt timestamp without time zone, _descript text, _price integer) OWNER TO pavel;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: auto; Type: TABLE; Schema: cars; Owner: pavel
--

CREATE TABLE cars.auto (
    auto_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    odo integer,
    user_id bigint NOT NULL,
    avatar boolean DEFAULT false NOT NULL
);


ALTER TABLE cars.auto OWNER TO pavel;

--
-- Name: avto_avto_id_seq; Type: SEQUENCE; Schema: cars; Owner: pavel
--

CREATE SEQUENCE cars.avto_avto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.avto_avto_id_seq OWNER TO pavel;

--
-- Name: avto_avto_id_seq; Type: SEQUENCE OWNED BY; Schema: cars; Owner: pavel
--

ALTER SEQUENCE cars.avto_avto_id_seq OWNED BY cars.auto.auto_id;


--
-- Name: confirmations; Type: TABLE; Schema: profiles; Owner: pavel
--

CREATE TABLE profiles.confirmations (
    user_id bigint NOT NULL,
    dt timestamp without time zone DEFAULT now() NOT NULL,
    link_key character varying(32) NOT NULL,
    code bigint NOT NULL,
    attempts smallint DEFAULT 0 NOT NULL
);


ALTER TABLE profiles.confirmations OWNER TO pavel;

--
-- Name: users; Type: TABLE; Schema: profiles; Owner: pavel
--

CREATE TABLE profiles.users (
    user_id bigint NOT NULL,
    login character varying(255) NOT NULL,
    password_hash bytea,
    confirmed boolean NOT NULL,
    oauth boolean DEFAULT false NOT NULL,
    last_login_dt timestamp without time zone DEFAULT (now())::timestamp without time zone
);


ALTER TABLE profiles.users OWNER TO pavel;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: profiles; Owner: pavel
--

CREATE SEQUENCE profiles.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE profiles.users_user_id_seq OWNER TO pavel;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: profiles; Owner: pavel
--

ALTER SEQUENCE profiles.users_user_id_seq OWNED BY profiles.users.user_id;


--
-- Name: defaut_groups; Type: TABLE; Schema: service_groups; Owner: pavel
--

CREATE TABLE service_groups.defaut_groups (
    group_id integer NOT NULL,
    group_name character varying(50) NOT NULL,
    sort smallint DEFAULT 0 NOT NULL
);


ALTER TABLE service_groups.defaut_groups OWNER TO pavel;

--
-- Name: defaut_groups_group_id_seq; Type: SEQUENCE; Schema: service_groups; Owner: pavel
--

CREATE SEQUENCE service_groups.defaut_groups_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE service_groups.defaut_groups_group_id_seq OWNER TO pavel;

--
-- Name: defaut_groups_group_id_seq; Type: SEQUENCE OWNED BY; Schema: service_groups; Owner: pavel
--

ALTER SEQUENCE service_groups.defaut_groups_group_id_seq OWNED BY service_groups.defaut_groups.group_id;


--
-- Name: service_groups; Type: TABLE; Schema: service_groups; Owner: pavel
--

CREATE TABLE service_groups.service_groups (
    group_id integer NOT NULL,
    group_name character varying NOT NULL,
    user_id bigint,
    sort integer DEFAULT 0
);


ALTER TABLE service_groups.service_groups OWNER TO pavel;

--
-- Name: groups_group_id_seq; Type: SEQUENCE; Schema: service_groups; Owner: pavel
--

CREATE SEQUENCE service_groups.groups_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE service_groups.groups_group_id_seq OWNER TO pavel;

--
-- Name: groups_group_id_seq; Type: SEQUENCE OWNED BY; Schema: service_groups; Owner: pavel
--

ALTER SEQUENCE service_groups.groups_group_id_seq OWNED BY service_groups.service_groups.group_id;


--
-- Name: services; Type: TABLE; Schema: services; Owner: pavel
--

CREATE TABLE services.services (
    service_id bigint NOT NULL,
    auto_id bigint NOT NULL,
    user_id bigint NOT NULL,
    group_id bigint NOT NULL,
    odo integer,
    next_distance integer,
    dt date,
    description text,
    price integer
);


ALTER TABLE services.services OWNER TO pavel;

--
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: services; Owner: pavel
--

CREATE SEQUENCE services.services_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE services.services_service_id_seq OWNER TO pavel;

--
-- Name: services_service_id_seq; Type: SEQUENCE OWNED BY; Schema: services; Owner: pavel
--

ALTER SEQUENCE services.services_service_id_seq OWNED BY services.services.service_id;


--
-- Name: auto auto_id; Type: DEFAULT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.auto ALTER COLUMN auto_id SET DEFAULT nextval('cars.avto_avto_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: profiles; Owner: pavel
--

ALTER TABLE ONLY profiles.users ALTER COLUMN user_id SET DEFAULT nextval('profiles.users_user_id_seq'::regclass);


--
-- Name: defaut_groups group_id; Type: DEFAULT; Schema: service_groups; Owner: pavel
--

ALTER TABLE ONLY service_groups.defaut_groups ALTER COLUMN group_id SET DEFAULT nextval('service_groups.defaut_groups_group_id_seq'::regclass);


--
-- Name: service_groups group_id; Type: DEFAULT; Schema: service_groups; Owner: pavel
--

ALTER TABLE ONLY service_groups.service_groups ALTER COLUMN group_id SET DEFAULT nextval('service_groups.groups_group_id_seq'::regclass);


--
-- Name: services service_id; Type: DEFAULT; Schema: services; Owner: pavel
--

ALTER TABLE ONLY services.services ALTER COLUMN service_id SET DEFAULT nextval('services.services_service_id_seq'::regclass);


--
-- Name: auto pk_auto_id; Type: CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.auto
    ADD CONSTRAINT pk_auto_id PRIMARY KEY (auto_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: profiles; Owner: pavel
--

ALTER TABLE ONLY profiles.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: defaut_groups defaut_groups_pkey; Type: CONSTRAINT; Schema: service_groups; Owner: pavel
--

ALTER TABLE ONLY service_groups.defaut_groups
    ADD CONSTRAINT defaut_groups_pkey PRIMARY KEY (group_id);


--
-- Name: service_groups groups_pkey; Type: CONSTRAINT; Schema: service_groups; Owner: pavel
--

ALTER TABLE ONLY service_groups.service_groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);


--
-- Name: services pk_services; Type: CONSTRAINT; Schema: services; Owner: pavel
--

ALTER TABLE ONLY services.services
    ADD CONSTRAINT pk_services PRIMARY KEY (service_id);


--
-- Name: avto_user_id_idx; Type: INDEX; Schema: cars; Owner: pavel
--

CREATE INDEX avto_user_id_idx ON cars.auto USING btree (user_id);


--
-- Name: confirmations_link_key_idx; Type: INDEX; Schema: profiles; Owner: pavel
--

CREATE UNIQUE INDEX confirmations_link_key_idx ON profiles.confirmations USING btree (link_key);


--
-- Name: confirmations_user_id_idx; Type: INDEX; Schema: profiles; Owner: pavel
--

CREATE UNIQUE INDEX confirmations_user_id_idx ON profiles.confirmations USING btree (user_id);


--
-- Name: users_login_idx; Type: INDEX; Schema: profiles; Owner: pavel
--

CREATE UNIQUE INDEX users_login_idx ON profiles.users USING btree (login);


--
-- Name: service_groups_user_id_idx; Type: INDEX; Schema: service_groups; Owner: pavel
--

CREATE INDEX service_groups_user_id_idx ON service_groups.service_groups USING btree (user_id);


--
-- Name: services_auto_id_idx; Type: INDEX; Schema: services; Owner: pavel
--

CREATE INDEX services_auto_id_idx ON services.services USING btree (auto_id, user_id);


--
-- Name: auto auto_fk; Type: FK CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.auto
    ADD CONSTRAINT auto_fk FOREIGN KEY (user_id) REFERENCES profiles.users(user_id) ON DELETE CASCADE;


--
-- Name: confirmations confirmations_fk; Type: FK CONSTRAINT; Schema: profiles; Owner: pavel
--

ALTER TABLE ONLY profiles.confirmations
    ADD CONSTRAINT confirmations_fk FOREIGN KEY (user_id) REFERENCES profiles.users(user_id) ON DELETE CASCADE;


--
-- Name: service_groups service_groups_fk; Type: FK CONSTRAINT; Schema: service_groups; Owner: pavel
--

ALTER TABLE ONLY service_groups.service_groups
    ADD CONSTRAINT service_groups_fk FOREIGN KEY (user_id) REFERENCES profiles.users(user_id) ON DELETE CASCADE;


--
-- Name: services services_fk; Type: FK CONSTRAINT; Schema: services; Owner: pavel
--

ALTER TABLE ONLY services.services
    ADD CONSTRAINT services_fk FOREIGN KEY (auto_id) REFERENCES cars.auto(auto_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

