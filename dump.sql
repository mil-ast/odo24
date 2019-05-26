--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE pavel;
ALTER ROLE pavel WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'md50b727579e570838d5d11c835b38ecb8a';
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;






\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2 (Debian 11.2-1.pgdg80+1)
-- Dumped by pg_dump version 11.2 (Debian 11.2-1.pgdg80+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2 (Debian 11.2-1.pgdg80+1)
-- Dumped by pg_dump version 11.2 (Debian 11.2-1.pgdg80+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
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
-- Name: reminding; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA reminding;


ALTER SCHEMA reminding OWNER TO postgres;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: eventtypes; Type: TYPE; Schema: cars; Owner: pavel
--

CREATE TYPE cars.eventtypes AS ENUM (
    'insurance',
    'docs'
);


ALTER TYPE cars.eventtypes OWNER TO pavel;

--
-- Name: status; Type: TYPE; Schema: public; Owner: pavel
--

CREATE TYPE public.status AS ENUM (
    'bad_request',
    'forbidden'
);


ALTER TYPE public.status OWNER TO pavel;

--
-- Name: eventtypes; Type: TYPE; Schema: reminding; Owner: pavel
--

CREATE TYPE reminding.eventtypes AS ENUM (
    'insurance',
    'docs'
);


ALTER TYPE reminding.eventtypes OWNER TO pavel;

--
-- Name: avto_avto_id_seq; Type: SEQUENCE; Schema: cars; Owner: pavel
--

CREATE SEQUENCE cars.avto_avto_id_seq
    START WITH 18
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.avto_avto_id_seq OWNER TO pavel;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: avto; Type: TABLE; Schema: cars; Owner: pavel
--

CREATE TABLE cars.avto (
    avto_id bigint DEFAULT nextval('cars.avto_avto_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    odo integer,
    user_id bigint NOT NULL,
    avatar boolean NOT NULL,
    public boolean NOT NULL
);


ALTER TABLE cars.avto OWNER TO pavel;

--
-- Name: createavto(character varying, integer, bigint); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.createavto(_name character varying, _odo integer, _user_id bigint) RETURNS cars.avto
    LANGUAGE plpgsql
    AS $$
declare
	new_avto cars.avto;
begin
	if length(_name) = 0 then
		raise 'bad_request' using HINT = 'Не указано название';
	end if;

	if _user_id = 0 then
		raise 'bad_request' using HINT = 'Не указан пользователь';
	end if;

	insert into cars.avto (name,odo,user_id,avatar,public) values (_name, _odo, _user_id, false, false) returning * into new_avto;
	return new_avto;
end
$$;


ALTER FUNCTION cars.createavto(_name character varying, _odo integer, _user_id bigint) OWNER TO pavel;

--
-- Name: groups_group_id_seq; Type: SEQUENCE; Schema: cars; Owner: pavel
--

CREATE SEQUENCE cars.groups_group_id_seq
    START WITH 32
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.groups_group_id_seq OWNER TO pavel;

--
-- Name: groups; Type: TABLE; Schema: cars; Owner: pavel
--

CREATE TABLE cars.groups (
    group_id bigint DEFAULT nextval('cars.groups_group_id_seq'::regclass) NOT NULL,
    user_id bigint,
    name character varying(42) NOT NULL,
    sort smallint NOT NULL,
    global boolean NOT NULL
);


ALTER TABLE cars.groups OWNER TO pavel;

--
-- Name: creategroup(bigint, character varying); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.creategroup(_user_id bigint, _name character varying) RETURNS cars.groups
    LANGUAGE plpgsql
    AS $_$
declare
	next_sort int2;
	new_group cars."groups";
begin
	if length(_name) = 0 then
		raise 'bad_request' using HINT = 'Не указано название';
	end if;

	if _user_id = 0 then
		raise 'bad_request' using HINT = 'Не указан пользователь';
	end if;

	select coalesce(max(sort)+1, 1) into next_sort from cars."groups" where user_id=$1;

	insert into cars."groups" (user_id,name,sort,global)
	values (_user_id, _name, next_sort, false) returning * into new_group;
	
	return new_group;
end
$_$;


ALTER FUNCTION cars.creategroup(_user_id bigint, _name character varying) OWNER TO pavel;

--
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: cars; Owner: pavel
--

CREATE SEQUENCE cars.services_service_id_seq
    START WITH 37
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.services_service_id_seq OWNER TO pavel;

--
-- Name: services; Type: TABLE; Schema: cars; Owner: pavel
--

CREATE TABLE cars.services (
    service_id bigint DEFAULT nextval('cars.services_service_id_seq'::regclass) NOT NULL,
    avto_id bigint NOT NULL,
    user_id bigint NOT NULL,
    group_id bigint NOT NULL,
    odo integer,
    next_distance integer,
    date date,
    comment text,
    price money
);


ALTER TABLE cars.services OWNER TO pavel;

--
-- Name: createservice(bigint, bigint, bigint, integer, integer, date, text, money); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.createservice(_avto_id bigint, _user_id bigint, _group_id bigint, _odo integer, _next_distance integer, _date date, _comment text, _price money) RETURNS cars.services
    LANGUAGE plpgsql
    AS $$
declare
	_error_str VARCHAR(128);
	curr_avto_odo int4;
	new_service cars.services;
begin
	if _avto_id = 0 then
		RAISE 'bad_request' USING HINT = 'Не указано авто';
	end if;

	if _user_id = 0 then
		RAISE 'bad_request' USING HINT = 'Не указан пользователь';
	end if;

	if _group_id = 0 then
		RAISE 'bad_request' USING HINT = 'Не указана группа';
	end if;

	select	case
				when a.user_id != _user_id then 'Авто не принадлежит этому пользователю'
				else null
			end
	into _error_str
	from cars.avto a where a.avto_id=_avto_id;

	IF _error_str IS NOT NULL
	THEN
    	raise 'forbidden' using HINT = _error_str;
	END IF;	

	insert into cars.services (avto_id,user_id,group_id,odo,next_distance,"date","comment",price)
	values (_avto_id,_user_id,_group_id,_odo,_next_distance,_date,_comment,_price) returning * into new_service;

	select odo into curr_avto_odo from cars.avto where cars.avto.avto_id=avto_id;
	if new_service.odo > curr_avto_odo then
		update cars.avto set odo=curr_avto_odo where avto_id=avto_id;
	end if;

	return new_service;
end
$$;


ALTER FUNCTION cars.createservice(_avto_id bigint, _user_id bigint, _group_id bigint, _odo integer, _next_distance integer, _date date, _comment text, _price money) OWNER TO pavel;

--
-- Name: deleteavto(bigint, bigint); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.deleteavto(_avto_id bigint, _user_id bigint) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
	avto_id int8;
	user_id int8;
begin
	select
		avto.avto_id,
		avto.user_id
	into
		avto_id,
		user_id
	from cars.avto
	where avto.avto_id=_avto_id;

	if not found then
		raise 'not_found' using HINT = 'Авто не найдено';
	end if;

	if user_id != _user_id then
		raise 'forbidden' using HINT = 'Пользователь не является владельцем авто';
	end if;

	delete from cars.avto where avto.avto_id=_avto_id;
end
$$;


ALTER FUNCTION cars.deleteavto(_avto_id bigint, _user_id bigint) OWNER TO pavel;

--
-- Name: deletegroup(bigint, bigint); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.deletegroup(_group_id bigint, _user_id bigint) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
	group_id int8;
	user_id int8;
	is_global bool;
begin
	select
		groups.group_id,
		groups.user_id,
		groups.global
	into
		group_id,
		user_id,
		is_global
	from cars.groups
	where cars.groups.group_id=_group_id;

	if not found or is_global then
		raise 'not_found' using HINT = 'Группа не найдена';
	end if;

	if user_id != _user_id then
		raise 'forbidden' using HINT = 'Пользователь не является владельцем группы';
	end if;

	delete from cars.groups where cars.groups.group_id=_group_id;
end
$$;


ALTER FUNCTION cars.deletegroup(_group_id bigint, _user_id bigint) OWNER TO pavel;

--
-- Name: deleteremind(bigint, bigint); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.deleteremind(_remind_id bigint, _user_id bigint) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
	user_id int8;
begin
	select
		reminding.user_id
	into
		user_id
	from cars.reminding
	where reminding.id=_remind_id;

	if not found then
		raise 'not_found' using HINT = 'Напоминание не найдено';
	end if;

	if user_id != _user_id then
		raise 'forbidden' using HINT = 'Пользователь не является владельцем напоминания';
	end if;

	delete from cars.reminding where id=_remind_id;
end
$$;


ALTER FUNCTION cars.deleteremind(_remind_id bigint, _user_id bigint) OWNER TO pavel;

--
-- Name: deleteservice(bigint, bigint); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.deleteservice(_service_id bigint, _user_id bigint) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
	service_id int8;
	user_id int8;
begin
	select
		services.service_id,
		services.user_id
	into
		service_id,
		user_id
	from cars.services
	where services.service_id=_service_id;

	if service_id is null then
		raise 'not_found' using HINT = 'Сервис не найден';
	end if;

	if user_id != _user_id then
		raise 'forbidden' using HINT = 'Пользователь не является владельцем сервиса';
	end if;

	delete from cars.services where services.service_id=_service_id;
end
$$;


ALTER FUNCTION cars.deleteservice(_service_id bigint, _user_id bigint) OWNER TO pavel;

--
-- Name: setavtoodo(bigint, integer, bigint); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.setavtoodo(_avto_id bigint, _odo integer, _user_id bigint) RETURNS cars.avto
    LANGUAGE plpgsql
    AS $$
declare
	found_car cars.avto;
begin
	select * into found_car
	from cars.avto
	where avto.avto_id=_avto_id;

	if not found then
		raise 'not_found' using HINT = 'Авто не найдено';
	end if;

	if found_car.user_id != _user_id then
		raise 'forbidden' using HINT = 'Пользователь не является владельцем авто';
	end if;

	if _odo > found_car.odo then
		update cars.avto
		set
			odo=_odo
		where cars.avto.avto_id=_avto_id returning * into found_car;
	end if;

	return found_car;
end
$$;


ALTER FUNCTION cars.setavtoodo(_avto_id bigint, _odo integer, _user_id bigint) OWNER TO pavel;

--
-- Name: statsgroups(bigint, bigint); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.statsgroups(_user_id bigint, _avto_id bigint) RETURNS TABLE(group_id bigint, cnt bigint)
    LANGUAGE sql
    AS $$
	select g.group_id,count(s.service_id) cnt
	from cars."groups" g
	left join cars.services s on s.group_id=g.group_id and s.avto_id=_avto_id
	where g.user_id in (0,_user_id)
	group by g.group_id;
$$;


ALTER FUNCTION cars.statsgroups(_user_id bigint, _avto_id bigint) OWNER TO pavel;

--
-- Name: updateavto(bigint, integer, character varying, bigint, boolean, boolean); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.updateavto(_avto_id bigint, _odo integer, _name character varying, _user_id bigint, _avatar boolean DEFAULT NULL::boolean, _public boolean DEFAULT NULL::boolean) RETURNS cars.avto
    LANGUAGE plpgsql
    AS $$
declare
	found_car cars.avto;
begin
	if length(_name) = 0 then
		raise 'bad_request' using HINT = 'Не указано название';
	end if;
	
	select * into found_car
	from cars.avto
	where avto.avto_id=_avto_id;

	if not found then
		raise 'not_found' using HINT = 'Авто не найдено';
	end if;

	if found_car.user_id != _user_id then
		raise 'forbidden' using HINT = 'Пользователь не является владельцем авто';
	end if;

	update cars.avto
	set
		"name"=_name,
		odo=_odo,
		avatar=case when (_avatar is not null) then _avatar else found_car.avatar end,
		public=case when (_public is not null) then _public else found_car.public end
	where cars.avto.avto_id=_avto_id returning * into found_car;

	return found_car;
end
$$;


ALTER FUNCTION cars.updateavto(_avto_id bigint, _odo integer, _name character varying, _user_id bigint, _avatar boolean, _public boolean) OWNER TO pavel;

--
-- Name: updategroup(bigint, bigint, character varying); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.updategroup(_group_id bigint, _user_id bigint, _name character varying) RETURNS cars.groups
    LANGUAGE plpgsql
    AS $$
declare
	found_group cars."groups";
begin
	if length(_name) < 2 then
		raise 'bad_request' using HINT = 'Не указано название';
	end if;
	
	select * into found_group
	from cars."groups"
	where group_id=_group_id;

	if not found or found_group."global" then
		raise 'not_found' using HINT = 'Группа не найдена';
	end if;

	if found_group.user_id != _user_id then
		raise 'forbidden' using HINT = 'Пользователь не является владельцем группы';
	end if;

	update cars."groups" set "name"=_name where group_id=_group_id returning * into found_group;
	return found_group;
end
$$;


ALTER FUNCTION cars.updategroup(_group_id bigint, _user_id bigint, _name character varying) OWNER TO pavel;

--
-- Name: updateservice(bigint, bigint, integer, integer, date, character varying, money); Type: FUNCTION; Schema: cars; Owner: pavel
--

CREATE FUNCTION cars.updateservice(_service_id bigint, _user_id bigint, _odo integer, _next_distance integer, _date date, _comment character varying, _price money) RETURNS cars.services
    LANGUAGE plpgsql
    AS $$
declare
	found_service cars.services;
begin
	select * into found_service
	from cars.services
	where services.service_id=_service_id;

	if not found then
		raise 'not_found' using HINT = 'Сервис не найден';
	end if;

	if found_service.user_id != _user_id then
		raise 'forbidden' using HINT = 'Сервис не принадлежит пользователю';
	end if;

	update cars.services set odo=_odo,next_distance=_next_distance,"date"=_date,comment=_comment,price=_price where service_id=_service_id returning * into found_service;
	return found_service;
end
$$;


ALTER FUNCTION cars.updateservice(_service_id bigint, _user_id bigint, _odo integer, _next_distance integer, _date date, _comment character varying, _price money) OWNER TO pavel;

--
-- Name: checkrestorecode(character varying, integer); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.checkrestorecode(_login character varying, _code integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare
	_user_id int8;
	item profiles."restore";
begin
	select u.user_id from profiles.users u into _user_id where u.login=_login;
	if not found then
		return false;
	end if;

	select * from profiles."restore" r into item where r.user_id=_user_id;
	if not found then
		return false;
	end if;

	if item.number_attempts=3 or item.number_attempts=-1 then
		delete from profiles."restore" r where r.user_id=_user_id;
		return false;
	end if;

	if item.code!=_code then
		update profiles."restore" r set number_attempts=number_attempts+1 where r.user_id=_user_id;
		return false;
	end if;

	update profiles."restore" r set number_attempts=-1 where r.user_id=_user_id;

	return true;
end
 $$;


ALTER FUNCTION profiles.checkrestorecode(_login character varying, _code integer) OWNER TO pavel;

--
-- Name: createrestorecode(character varying); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.createrestorecode(_login character varying, OUT code integer) RETURNS integer
    LANGUAGE plpgsql
    AS $_$
declare
	TIME_DIFF CONSTANT interval := interval '-20 minutes';
	_user_id int8;
begin
	select u.user_id from profiles.users u into _user_id where LOWER(u.login)=LOWER($1);
	if not found then
		raise 'user not found';
	end if;

	delete from profiles."restore" r where r.user_id=_user_id or r.dt<(NOW() + TIME_DIFF);

	select getrand from public.getrand(10000,99999) into code;
	insert into profiles."restore" (user_id,code,dt) values (_user_id,code,now());
end
$_$;


ALTER FUNCTION profiles.createrestorecode(_login character varying, OUT code integer) OWNER TO pavel;

--
-- Name: getprofilebyuuid(uuid, character varying); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.getprofilebyuuid(_uuid uuid, _user_agent character varying) RETURNS TABLE(user_id bigint, login character varying, is_no_confirmed boolean)
    LANGUAGE plpgsql
    AS $$
declare
	_sess profiles.authorizations;
begin
	select * into _sess
	from profiles.authorizations auth where auth.uuid=_uuid;

	if not found then
		raise 'user not found';
	end if;

	if _sess.expiration < now() then
		raise 'session expired';
	end if;
	if _sess.user_agent != _user_agent then
		raise 'user not found';
	end if;
	
	return query
	select u.user_id,u.login,not u.confirmed from profiles.users u where u.user_id=_sess.user_id;
end
 $$;


ALTER FUNCTION profiles.getprofilebyuuid(_uuid uuid, _user_agent character varying) OWNER TO pavel;

--
-- Name: login(character varying, bytea); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.login(_login character varying, _passwd bytea) RETURNS TABLE(user_id bigint, login character varying, is_no_confirmed boolean)
    LANGUAGE plpgsql
    AS $$
declare
	u profiles.users;
begin
	if _login = '' then
		raise 'login is empty';
	end if;
	
	select * into u from profiles.users user_row where LOWER(user_row.login)=LOWER(_login);
	if not found then
		raise 'user not found';
	end if;

	if sha256(_passwd) != u.password_hash then
		raise 'password error';
	end if;

	update profiles.users user_row
	set last_login_dt=now()::timestamp with time zone at time zone 'UTC', oauth=true
	where LOWER(user_row.login)=LOWER(_login);

	return query
	select u.user_id,_login,not u.confirmed;
end
$$;


ALTER FUNCTION profiles.login(_login character varying, _passwd bytea) OWNER TO pavel;

--
-- Name: oauthgetprofile(character varying); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.oauthgetprofile(_login character varying) RETURNS TABLE(user_id bigint, login character varying)
    LANGUAGE plpgsql
    AS $$
declare
	u profiles.users;
begin
	if octet_length(_login)<4 then
		raise 'email is empty';
	end if;

	select * into u from profiles.users usr where LOWER(usr.login)=LOWER(_login);
	if not found then
		insert into profiles.users (login,password_hash,confirmed,oauth) values (_login,sha256(''), true, true)
		returning * into u;
	else
		update profiles.users user_row
		set  last_login_dt=now()::timestamp with time zone at time zone 'UTC'
		where user_row.user_id=u.user_id;
	end if;

	return query
	select u.user_id,_login;
end
 $$;


ALTER FUNCTION profiles.oauthgetprofile(_login character varying) OWNER TO pavel;

--
-- Name: register(character varying, bytea); Type: FUNCTION; Schema: profiles; Owner: pavel
--

CREATE FUNCTION profiles.register(_login character varying, _passwd bytea) RETURNS TABLE(user_id bigint, login character varying)
    LANGUAGE plpgsql
    AS $$
declare
	new_profile profiles.users;
begin
	if _login = '' then
		raise 'login is empty';
	end if;

	if _passwd = '' then
		raise 'passwd is empty';
	end if;

	if exists(select 1 from profiles.users u where LOWER(u.login)=LOWER(_login)) then
		raise 'login is exists';
	end if;

	insert into profiles.users (login,password_hash,confirmed) values (_login,sha256(_passwd), false)
	returning * into new_profile;

	return query select new_profile.user_id,new_profile.login;
end
$$;


ALTER FUNCTION profiles.register(_login character varying, _passwd bytea) OWNER TO pavel;

--
-- Name: resetpassword(character varying, bytea); Type: PROCEDURE; Schema: profiles; Owner: pavel
--

CREATE PROCEDURE profiles.resetpassword(_login character varying, _passwd bytea)
    LANGUAGE plpgsql
    AS $$
declare
	_user_id int8;
	attempts int2;
begin
	if octet_length(_passwd)<4 then
		raise 'password length error';
	end if;

	select u.user_id from profiles.users u into _user_id where LOWER(u.login)=LOWER(_login);
	if not found then
		raise 'user not found';
	end if;

	select number_attempts from profiles."restore" r into attempts where r.user_id=_user_id;
	if not found then
		raise 'attempts not found';
	end if;

	delete from profiles."restore" r where r.user_id=_user_id;

	if attempts != -1 then
		raise 'attempts is not equal';
	end if;
	
	call profiles.updatepassword(_user_id, _passwd);
end
 $$;


ALTER PROCEDURE profiles.resetpassword(_login character varying, _passwd bytea) OWNER TO pavel;

--
-- Name: updatepassword(bigint, bytea); Type: PROCEDURE; Schema: profiles; Owner: pavel
--

CREATE PROCEDURE profiles.updatepassword(_user_id bigint, _passwd bytea)
    LANGUAGE plpgsql
    AS $$
begin
	if octet_length(_passwd)<4 then
		raise 'password length error';
	end if;

	perform 1 from profiles.users where user_id=_user_id;
	if not found then
		raise 'user not found';
	end if;

	update profiles.users set password_hash=sha256(_passwd) where user_id=_user_id;
end
$$;


ALTER PROCEDURE profiles.updatepassword(_user_id bigint, _passwd bytea) OWNER TO pavel;

--
-- Name: getrand(integer, integer); Type: FUNCTION; Schema: public; Owner: pavel
--

CREATE FUNCTION public.getrand(minval integer, maxval integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
begin
	return (floor(random()*(maxval-minval+1))+minval)::int;
end
$$;


ALTER FUNCTION public.getrand(minval integer, maxval integer) OWNER TO pavel;

--
-- Name: reminding_id_seq; Type: SEQUENCE; Schema: reminding; Owner: pavel
--

CREATE SEQUENCE reminding.reminding_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE reminding.reminding_id_seq OWNER TO pavel;

--
-- Name: reminding; Type: TABLE; Schema: reminding; Owner: pavel
--

CREATE TABLE reminding.reminding (
    id bigint DEFAULT nextval('reminding.reminding_id_seq'::regclass) NOT NULL,
    user_id bigint NOT NULL,
    event_type character varying NOT NULL,
    date_start date NOT NULL,
    date_end date NOT NULL,
    days_before_event smallint NOT NULL,
    comment text,
    is_closed boolean DEFAULT false,
    avto_id bigint
);


ALTER TABLE reminding.reminding OWNER TO pavel;

--
-- Name: createremind(bigint, bigint, reminding.eventtypes, date, date, smallint, text); Type: FUNCTION; Schema: reminding; Owner: pavel
--

CREATE FUNCTION reminding.createremind(_user_id bigint, _avto_id bigint, _event_type reminding.eventtypes, _date_start date, _date_end date, _days_before_event smallint, _comment text) RETURNS reminding.reminding
    LANGUAGE plpgsql
    AS $$ 
declare
	new_remind reminding.reminding;
	is_closed bool;
begin
	if _event_type='insurance' and _avto_id is null then
		raise 'Avto ID is empty';
	end if;

	if _user_id = 0 then
		raise 'User ID is empty'
		using HINT = 'Не указан пользователь';
	end if;

	if _days_before_event < 1 then
		raise 'days_before_event is empty';
	end if;

	is_closed = true;
	if _date_end < now() then
		is_closed = false;
	end if;
	
	insert into reminding.reminding
		(user_id,event_type,date_start,date_end,days_before_event,"comment",is_closed,avto_id) values
		(_user_id,_event_type,_date_start,_date_end,_days_before_event,_comment,is_closed,_avto_id)
		returning * into new_remind;

	return new_remind;
end
$$;


ALTER FUNCTION reminding.createremind(_user_id bigint, _avto_id bigint, _event_type reminding.eventtypes, _date_start date, _date_end date, _days_before_event smallint, _comment text) OWNER TO pavel;

--
-- Name: deleteremind(bigint, bigint); Type: FUNCTION; Schema: reminding; Owner: pavel
--

CREATE FUNCTION reminding.deleteremind(_id bigint, _user_id bigint) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
	_found_user_id bigint;
begin
	select r.user_id into _found_user_id from reminding.reminding r
	where r.id=_id;

	if not found then
		raise 'not found'
		using HINT = 'Напоминание не найдено', ERRCODE = 'H0404';
	end if;

	if _user_id != _found_user_id then
		raise 'forbidden'
		using HINT = 'Пользователь не является владельцем напоминания', ERRCODE = 'H0403';
	end if;

	delete from reminding.reminding where id=_id;
end
 $$;


ALTER FUNCTION reminding.deleteremind(_id bigint, _user_id bigint) OWNER TO pavel;

--
-- Name: updateremind(bigint, bigint, date, date, smallint, text); Type: FUNCTION; Schema: reminding; Owner: pavel
--

CREATE FUNCTION reminding.updateremind(_id bigint, _user_id bigint, _date_start date, _date_end date, _days_before_event smallint, _comment text) RETURNS reminding.reminding
    LANGUAGE plpgsql
    AS $$ 
declare
	_is_closed bool;
	found_rem reminding.reminding;
begin
	if _user_id = 0 then
		raise 'User ID is empty'
		using HINT = 'Не указан пользователь';
	end if;

	if _days_before_event < 1 then
		raise 'days_before_event is empty';
	end if;

	select * into found_rem
	from reminding.reminding r
	where r.id=_id;

	if not found then
		raise 'Reminder not found %', _id;
	end if;

	if found_rem.user_id != _user_id then
		raise 'Forbidden. Reminder_id: %, UserID: %', _avto_id, _user_id
		using HINT = 'Пользователь не является владельцем напоминания', ERRCODE = 'H0403';
	end if;

	_is_closed = found_rem.is_closed;
	if found_rem.is_closed=false and _date_end < now() then
		_is_closed = false;
	end if;

	update reminding.reminding
	set
		date_start=_date_start,
		date_end=_date_end,
		days_before_event=_days_before_event,
		"comment"=_comment,
		is_closed=_is_closed
	where reminding.reminding.id=_id returning * into found_rem;

	return found_rem;
end
$$;


ALTER FUNCTION reminding.updateremind(_id bigint, _user_id bigint, _date_start date, _date_end date, _days_before_event smallint, _comment text) OWNER TO pavel;

--
-- Name: reminding_id_seq; Type: SEQUENCE; Schema: cars; Owner: pavel
--

CREATE SEQUENCE cars.reminding_id_seq
    START WITH 9
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.reminding_id_seq OWNER TO pavel;

--
-- Name: authorizations; Type: TABLE; Schema: profiles; Owner: pavel
--

CREATE TABLE profiles.authorizations (
    uuid uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id bigint NOT NULL,
    user_agent character varying NOT NULL,
    expiration timestamp without time zone NOT NULL
);


ALTER TABLE profiles.authorizations OWNER TO pavel;

--
-- Name: restore_user_id_seq; Type: SEQUENCE; Schema: profiles; Owner: pavel
--

CREATE SEQUENCE profiles.restore_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE profiles.restore_user_id_seq OWNER TO pavel;

--
-- Name: restore; Type: TABLE; Schema: profiles; Owner: pavel
--

CREATE TABLE profiles.restore (
    user_id bigint DEFAULT nextval('profiles.restore_user_id_seq'::regclass) NOT NULL,
    code integer NOT NULL,
    dt timestamp without time zone NOT NULL,
    number_attempts smallint DEFAULT 0 NOT NULL
);


ALTER TABLE profiles.restore OWNER TO pavel;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: profiles; Owner: pavel
--

CREATE SEQUENCE profiles.users_user_id_seq
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE profiles.users_user_id_seq OWNER TO pavel;

--
-- Name: users; Type: TABLE; Schema: profiles; Owner: pavel
--

CREATE TABLE profiles.users (
    user_id bigint DEFAULT nextval('profiles.users_user_id_seq'::regclass) NOT NULL,
    login character varying(255) NOT NULL,
    password_hash bytea,
    confirmed boolean NOT NULL,
    last_login_dt timestamp without time zone DEFAULT (now())::timestamp without time zone,
    oauth boolean DEFAULT false
);


ALTER TABLE profiles.users OWNER TO pavel;

--
-- Name: _sess; Type: TABLE; Schema: public; Owner: pavel
--

CREATE TABLE public._sess (
    user_id bigint,
    user_agent character varying,
    expiration timestamp without time zone
);


ALTER TABLE public._sess OWNER TO pavel;

--
-- Name: test; Type: TABLE; Schema: public; Owner: pavel
--

CREATE TABLE public.test (
    id integer NOT NULL,
    dt timestamp without time zone DEFAULT (now())::timestamp without time zone NOT NULL
);


ALTER TABLE public.test OWNER TO pavel;

--
-- Name: test_id_seq; Type: SEQUENCE; Schema: public; Owner: pavel
--

CREATE SEQUENCE public.test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.test_id_seq OWNER TO pavel;

--
-- Name: test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pavel
--

ALTER SEQUENCE public.test_id_seq OWNED BY public.test.id;


--
-- Name: getforevent; Type: VIEW; Schema: reminding; Owner: pavel
--

CREATE VIEW reminding.getforevent AS
 SELECT r.id,
    r.event_type,
    r.date_start,
    r.date_end,
    r.avto_id,
    u.login,
    a.name AS car_name
   FROM ((reminding.reminding r
     JOIN profiles.users u ON ((u.user_id = r.user_id)))
     LEFT JOIN cars.avto a ON ((a.avto_id = r.avto_id)))
  WHERE (((r.date_end - ('1 day'::interval * (r.days_before_event)::double precision)) < now()) AND (r.is_closed = false));


ALTER TABLE reminding.getforevent OWNER TO pavel;

--
-- Name: test id; Type: DEFAULT; Schema: public; Owner: pavel
--

ALTER TABLE ONLY public.test ALTER COLUMN id SET DEFAULT nextval('public.test_id_seq'::regclass);


--
-- Data for Name: avto; Type: TABLE DATA; Schema: cars; Owner: pavel
--

COPY cars.avto (avto_id, name, odo, user_id, avatar, public) FROM stdin;
1	Nissan Teana	184800	1	t	f
24	Ipsum	10000	10	f	f
25	Chaser	10000	10	f	f
26	VW Polo	10000	21	f	f
27	Ipsum	10000	20	f	f
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: cars; Owner: pavel
--

COPY cars.groups (group_id, user_id, name, sort, global) FROM stdin;
1	0	Моторное масло	2	t
2	0	Трансмиссионное масло	3	t
3	0	Фильтры	4	t
4	0	Охлаждающие жидкости	5	t
6	0	Тормозная жидкость	7	t
7	0	Ходовая часть	8	t
8	0	Двигатель	9	t
5	0	Жидкость гидроусилителя	6	t
11	1	Прочее	10	f
37	10	Test	1	f
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: cars; Owner: pavel
--

COPY cars.services (service_id, avto_id, user_id, group_id, odo, next_distance, date, comment, price) FROM stdin;
2	1	1	2	119850	\N	2015-11-08	Totachi ATF CVT, 9.2	\N
4	1	1	1	136070	\N	2016-08-06	Totachi 5W30 синт.	\N
5	1	1	2	136140	\N	2016-08-14	Замена на оригинал NS-3. С промывкой.	\N
6	1	1	1	144600	\N	2017-01-14	Totachi 5W30 синт.	\N
9	1	1	1	153800	\N	2017-06-16	Totachi 5W30 синт.	\N
10	1	1	1	160700	\N	2017-09-23	Totachi 5W30 синт.	\N
11	1	1	1	168700	\N	2018-02-24	Totachi 5W30 синт.	\N
12	1	1	11	156000	\N	2017-08-05	Подшипник натяжного и обводного роликов. Ремень.	$320.00
13	1	1	3	168700	\N	2018-02-24	Воздушный	\N
16	1	1	5	177300	\N	2018-07-14	Castrol Dext III	$800.00
17	1	1	6	177300	\N	2018-07-14	Nissan DOT4	$800.00
1	1	1	1	119850	\N	2015-04-01	Totachi 5W30 синт. Фильтр C-224 Zic	\N
3	1	1	1	127425	\N	2015-11-07	Totachi 5W30 синт.	\N
14	1	1	1	177300	8000	2018-07-14	Totachi 5W30 синт.	\N
8	1	1	2	151060	40000	2017-04-28	Чистка гидроблока. Стоимость со всеми расходниками.	$21,800.00
7	1	1	8	144600	\N	2017-01-14	Замена свечей. Denso, 6шт	$1,500.00
15	1	1	4	170000	\N	2018-04-14	Антифриз "KYK" -40C Зеленый	$1,100.00
37	1	1	1	112500	\N	2014-05-31	\N	\N
45	1	1	1	184650	8000	2019-05-20	Mobil1 FS 5W30 (153750)\nФильтр MANN (W67/1)	$4,750.00
46	1	1	3	184800	15000	2019-05-25	MANN A-243V	$420.00
\.


--
-- Data for Name: authorizations; Type: TABLE DATA; Schema: profiles; Owner: pavel
--

COPY profiles.authorizations (uuid, user_id, user_agent, expiration) FROM stdin;
e50c3c34-7a2e-11e9-9355-9d4fde50cf40	1	qwerty	2019-05-20 16:09:04
\.


--
-- Data for Name: restore; Type: TABLE DATA; Schema: profiles; Owner: pavel
--

COPY profiles.restore (user_id, code, dt, number_attempts) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: profiles; Owner: pavel
--

COPY profiles.users (user_id, login, password_hash, confirmed, last_login_dt, oauth) FROM stdin;
11	andreev.zapchast-lider@yandex.ru	\\x63c1ac5450b0e2604c262e4a96bb25dc68d1a2fa1c8fa92e537fdac7098ea1e9	f	2019-02-20 11:39:42.802285	f
0	admin	\\x3509c18dce81d24b7d3780748e7b80024b5d802023e58f030d905395b1d192a1	t	2222-11-22 22:22:22	f
19	kuzenkaan@mail.ru	\\xa320480f534776bddb5cdb54b1e93d210a3c7d199e80a23c1b2178497b184c76	t	2019-05-13 18:18:27.43457	t
21	fisherman85@mail.ru	\\xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	t	2019-05-13 21:27:40.889588	t
20	0x5af4@gmail.com	\\xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	t	2019-05-17 18:00:18.293599	t
10	mil-ast@ya.ru	\\xa320480f534776bddb5cdb54b1e93d210a3c7d199e80a23c1b2178497b184c76	t	2019-04-07 14:15:38.403868	f
22	info@odo24.ru	\\xa320480f534776bddb5cdb54b1e93d210a3c7d199e80a23c1b2178497b184c76	f	2019-05-26 10:25:18.94646	t
14	yagerr@gmail.com	\\xc3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2	f	2019-04-05 18:10:37.311304	f
1	mil-ast@yandex.ru	\\xa320480f534776bddb5cdb54b1e93d210a3c7d199e80a23c1b2178497b184c76	t	2019-05-26 10:25:27.292256	t
\.


--
-- Data for Name: _sess; Type: TABLE DATA; Schema: public; Owner: pavel
--

COPY public._sess (user_id, user_agent, expiration) FROM stdin;
\.


--
-- Data for Name: test; Type: TABLE DATA; Schema: public; Owner: pavel
--

COPY public.test (id, dt) FROM stdin;
1	2019-02-20 10:57:21.469705
2	2019-02-20 11:38:15.485111
\.


--
-- Data for Name: reminding; Type: TABLE DATA; Schema: reminding; Owner: pavel
--

COPY reminding.reminding (id, user_id, event_type, date_start, date_end, days_before_event, comment, is_closed, avto_id) FROM stdin;
18	1	docs	2003-09-01	2019-04-10	30	test	t	\N
19	1	insurance	2018-04-13	2019-04-14	20	ХХХ0039480985 Альфастрахование, электронный полис. 3294.40 руб	t	1
20	1	insurance	2019-05-13	2020-04-14	30	ХХХ0081520021, альфа страхование, продление. 3795.46 руб.	t	1
\.


--
-- Name: avto_avto_id_seq; Type: SEQUENCE SET; Schema: cars; Owner: pavel
--

SELECT pg_catalog.setval('cars.avto_avto_id_seq', 27, true);


--
-- Name: groups_group_id_seq; Type: SEQUENCE SET; Schema: cars; Owner: pavel
--

SELECT pg_catalog.setval('cars.groups_group_id_seq', 37, true);


--
-- Name: reminding_id_seq; Type: SEQUENCE SET; Schema: cars; Owner: pavel
--

SELECT pg_catalog.setval('cars.reminding_id_seq', 9, false);


--
-- Name: services_service_id_seq; Type: SEQUENCE SET; Schema: cars; Owner: pavel
--

SELECT pg_catalog.setval('cars.services_service_id_seq', 47, true);


--
-- Name: restore_user_id_seq; Type: SEQUENCE SET; Schema: profiles; Owner: pavel
--

SELECT pg_catalog.setval('profiles.restore_user_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: profiles; Owner: pavel
--

SELECT pg_catalog.setval('profiles.users_user_id_seq', 22, true);


--
-- Name: test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pavel
--

SELECT pg_catalog.setval('public.test_id_seq', 1, true);


--
-- Name: reminding_id_seq; Type: SEQUENCE SET; Schema: reminding; Owner: pavel
--

SELECT pg_catalog.setval('reminding.reminding_id_seq', 20, true);


--
-- Name: avto avto_pkey; Type: CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.avto
    ADD CONSTRAINT avto_pkey PRIMARY KEY (avto_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- Name: authorizations authorizations_pk; Type: CONSTRAINT; Schema: profiles; Owner: pavel
--

ALTER TABLE ONLY profiles.authorizations
    ADD CONSTRAINT authorizations_pk PRIMARY KEY (uuid);


--
-- Name: restore restore_pkey; Type: CONSTRAINT; Schema: profiles; Owner: pavel
--

ALTER TABLE ONLY profiles.restore
    ADD CONSTRAINT restore_pkey PRIMARY KEY (user_id);


--
-- Name: users users_un; Type: CONSTRAINT; Schema: profiles; Owner: pavel
--

ALTER TABLE ONLY profiles.users
    ADD CONSTRAINT users_un UNIQUE (user_id);


--
-- Name: test test_pkey; Type: CONSTRAINT; Schema: public; Owner: pavel
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_pkey PRIMARY KEY (id);


--
-- Name: reminding reminding_pk; Type: CONSTRAINT; Schema: reminding; Owner: pavel
--

ALTER TABLE ONLY reminding.reminding
    ADD CONSTRAINT reminding_pk PRIMARY KEY (id);


--
-- Name: groups_global_idx; Type: INDEX; Schema: cars; Owner: pavel
--

CREATE INDEX groups_global_idx ON cars.groups USING btree (global);


--
-- Name: services_user_id_idx; Type: INDEX; Schema: cars; Owner: pavel
--

CREATE INDEX services_user_id_idx ON cars.services USING btree (user_id, avto_id, group_id);


--
-- Name: authorizations_expiration_idx; Type: INDEX; Schema: profiles; Owner: pavel
--

CREATE INDEX authorizations_expiration_idx ON profiles.authorizations USING btree (expiration);


--
-- Name: users_login_idx; Type: INDEX; Schema: profiles; Owner: pavel
--

CREATE UNIQUE INDEX users_login_idx ON profiles.users USING btree (login);


--
-- Name: reminding_is_closed_idx; Type: INDEX; Schema: reminding; Owner: pavel
--

CREATE INDEX reminding_is_closed_idx ON reminding.reminding USING btree (is_closed, date_end);


--
-- Name: reminding_user_id_idx; Type: INDEX; Schema: reminding; Owner: pavel
--

CREATE INDEX reminding_user_id_idx ON reminding.reminding USING btree (user_id);


--
-- Name: avto avto_users_fk; Type: FK CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.avto
    ADD CONSTRAINT avto_users_fk FOREIGN KEY (user_id) REFERENCES profiles.users(user_id) ON DELETE CASCADE;


--
-- Name: groups groups_users_fk; Type: FK CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.groups
    ADD CONSTRAINT groups_users_fk FOREIGN KEY (user_id) REFERENCES profiles.users(user_id) ON DELETE CASCADE;


--
-- Name: services services_avto_fk; Type: FK CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.services
    ADD CONSTRAINT services_avto_fk FOREIGN KEY (avto_id) REFERENCES cars.avto(avto_id) ON DELETE CASCADE;


--
-- Name: services services_groups_fk; Type: FK CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.services
    ADD CONSTRAINT services_groups_fk FOREIGN KEY (group_id) REFERENCES cars.groups(group_id) ON DELETE CASCADE;


--
-- Name: services services_users_fk; Type: FK CONSTRAINT; Schema: cars; Owner: pavel
--

ALTER TABLE ONLY cars.services
    ADD CONSTRAINT services_users_fk FOREIGN KEY (user_id) REFERENCES profiles.users(user_id) ON DELETE CASCADE;


--
-- Name: reminding reminding_avto_fk; Type: FK CONSTRAINT; Schema: reminding; Owner: pavel
--

ALTER TABLE ONLY reminding.reminding
    ADD CONSTRAINT reminding_avto_fk FOREIGN KEY (avto_id) REFERENCES cars.avto(avto_id) ON DELETE CASCADE;


--
-- Name: reminding reminding_users_fk; Type: FK CONSTRAINT; Schema: reminding; Owner: pavel
--

ALTER TABLE ONLY reminding.reminding
    ADD CONSTRAINT reminding_users_fk FOREIGN KEY (user_id) REFERENCES profiles.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

