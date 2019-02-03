--
-- PostgreSQL database dump
--

-- Dumped from database version 11.1 (Debian 11.1-1.pgdg90+1)
-- Dumped by pg_dump version 11.1 (Debian 11.1-1.pgdg90+1)

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
-- Name: eventtypes; Type: TYPE; Schema: cars; Owner: postgreadmin
--

CREATE TYPE cars.eventtypes AS ENUM (
    'insurance',
    'docs'
);


ALTER TYPE cars.eventtypes OWNER TO postgreadmin;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: avto; Type: TABLE; Schema: cars; Owner: postgreadmin
--

CREATE TABLE cars.avto (
    avto_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    odo integer,
    user_id bigint NOT NULL,
    avatar boolean DEFAULT false NOT NULL,
    public boolean DEFAULT false NOT NULL,
    CONSTRAINT avto_odo_check CHECK ((odo >= 0))
);


ALTER TABLE cars.avto OWNER TO postgreadmin;

--
-- Name: createavto(character varying, integer, bigint); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.createavto(_name character varying, _odo integer, _user_id bigint) RETURNS cars.avto
    LANGUAGE plpgsql
    AS $$
declare
	new_avto cars.avto;
begin
	if length(_name) = 0 then
		raise 'Name is empty'
		using HINT = 'Не указано название';
	end if;

	if _user_id = 0 then
		raise 'User ID is empty'
		using HINT = 'Не указан пользователь';
	end if;

	insert into cars.avto (name,odo,user_id,avatar,public) values (_name, _odo, _user_id, false, false) returning * into new_avto;
	return new_avto;
end
$$;


ALTER FUNCTION cars.createavto(_name character varying, _odo integer, _user_id bigint) OWNER TO postgreadmin;

--
-- Name: groups; Type: TABLE; Schema: cars; Owner: postgreadmin
--

CREATE TABLE cars.groups (
    group_id bigint NOT NULL,
    user_id bigint,
    name character varying(42) NOT NULL,
    sort smallint DEFAULT 0 NOT NULL,
    global boolean DEFAULT false NOT NULL
);


ALTER TABLE cars.groups OWNER TO postgreadmin;

--
-- Name: creategroup(bigint, character varying); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.creategroup(_user_id bigint, _name character varying) RETURNS cars.groups
    LANGUAGE plpgsql
    AS $_$
declare
	next_sort int2;
	new_group cars."groups";
begin
	if length(_name) = 0 then
		raise 'Name is empty'
		using HINT = 'Не указано название';
	end if;

	if _user_id = 0 then
		raise 'User ID is empty'
		using HINT = 'Не указан пользователь';
	end if;

	select coalesce(max(sort)+1, 1) into next_sort from cars."groups" where user_id=$1;

	insert into cars."groups" (user_id,name,sort,global)
	values (_user_id, _name, next_sort, false) returning * into new_group;
	
	return new_group;
end
$_$;


ALTER FUNCTION cars.creategroup(_user_id bigint, _name character varying) OWNER TO postgreadmin;

--
-- Name: reminding; Type: TABLE; Schema: cars; Owner: postgreadmin
--

CREATE TABLE cars.reminding (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    event_type cars.eventtypes NOT NULL,
    date_start date NOT NULL,
    date_end date NOT NULL,
    days_before_event smallint DEFAULT 30 NOT NULL,
    comment text,
    is_closed boolean DEFAULT false,
    CONSTRAINT reminding_days_before_event_check CHECK ((days_before_event > 0))
);


ALTER TABLE cars.reminding OWNER TO postgreadmin;

--
-- Name: createremind(bigint, cars.eventtypes, date, date, smallint, text); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.createremind(_user_id bigint, _event_type cars.eventtypes, _date_start date, _date_end date, _days smallint, _comment text) RETURNS cars.reminding
    LANGUAGE plpgsql
    AS $$
declare
	new_remind cars.reminding;
begin
	if _user_id = 0 then
		raise 'User ID is empty'
		using HINT = 'Не указан пользователь';
	end if;

	insert into cars.reminding (
		user_id,event_type,date_start,date_end,days_before_event,comment,is_closed
	) values (
		_user_id, _event_type, _date_start, _date_end, _days, _comment, false
	) returning * into new_remind;
	return new_remind;
end
$$;


ALTER FUNCTION cars.createremind(_user_id bigint, _event_type cars.eventtypes, _date_start date, _date_end date, _days smallint, _comment text) OWNER TO postgreadmin;

--
-- Name: services; Type: TABLE; Schema: cars; Owner: postgreadmin
--

CREATE TABLE cars.services (
    service_id bigint NOT NULL,
    avto_id bigint NOT NULL,
    user_id bigint NOT NULL,
    group_id bigint NOT NULL,
    odo integer,
    next_odo integer,
    date date,
    comment text,
    price money
);


ALTER TABLE cars.services OWNER TO postgreadmin;

--
-- Name: createservice(bigint, bigint, bigint, integer, integer, date, text, money); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.createservice(_avto_id bigint, _user_id bigint, _group_id bigint, _odo integer, _next_odo integer, _date date, _comment text, _price money) RETURNS cars.services
    LANGUAGE plpgsql
    AS $$
declare
	curr_avto_odo int4;
	new_service cars.services;
begin
	if _avto_id = 0 then
		raise 'Avto ID is empty'
		using HINT = 'Не указано авто';
	end if;

	if _user_id = 0 then
		raise 'User ID is empty'
		using HINT = 'Не указан пользователь';
	end if;

	if _group_id = 0 then
		raise 'Group ID is empty'
		using HINT = 'Не указана группа';
	end if;

	insert into cars.services (avto_id,user_id,group_id,odo,next_odo,"date","comment",price)
	values (_avto_id,_user_id,_group_id,_odo,_next_odo,_date,_comment,_price) returning * into new_service;

	select odo into curr_avto_odo from cars.avto where cars.avto.avto_id=avto_id;
	if new_service.odo > curr_avto_odo then
		update cars.avto set odo=curr_avto_odo where avto_id=avto_id;
	end if;

	return new_service;
end
$$;


ALTER FUNCTION cars.createservice(_avto_id bigint, _user_id bigint, _group_id bigint, _odo integer, _next_odo integer, _date date, _comment text, _price money) OWNER TO postgreadmin;

--
-- Name: deleteavto(bigint, bigint); Type: FUNCTION; Schema: cars; Owner: postgreadmin
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

	if avto_id is null then
		raise 'Avto not found. ID: %', _avto_id
		using HINT = 'Авто не найдено', ERRCODE = 'H0404';
	end if;

	if user_id != _user_id then
		raise 'Forbidden. Avto_id: %, UserID: %', _avto_id, _user_id
		using HINT = 'Пользователь не является владельцем авто', ERRCODE = 'H0403';
	end if;

	delete from cars.avto where avto.avto_id=_avto_id;
end
$$;


ALTER FUNCTION cars.deleteavto(_avto_id bigint, _user_id bigint) OWNER TO postgreadmin;

--
-- Name: deletegroup(bigint, bigint); Type: FUNCTION; Schema: cars; Owner: postgreadmin
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

	if group_id is null or is_global then
		raise 'Group not found. ID: %', _group_id
		using HINT = 'Группа не найдена', ERRCODE = 'H0404';
	end if;

	if user_id != _user_id then
		raise 'Forbidden. Group_id: %, UserID: %', _service_id, _user_id
		using HINT = 'Пользователь не является владельцем группы', ERRCODE = 'H0403';
	end if;

	delete from cars.groups where cars.groups.group_id=_group_id;
end
$$;


ALTER FUNCTION cars.deletegroup(_group_id bigint, _user_id bigint) OWNER TO postgreadmin;

--
-- Name: deleteremind(bigint, bigint); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.deleteremind(_remind_id bigint, _user_id bigint) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
	remind_id int8;
	user_id int8;
begin
	select
		reminding.id,
		reminding.user_id
	into
		remind_id,
		user_id
	from cars.reminding
	where reminding.id=_remind_id;

	if remind_id is null then
		raise 'Reminding not found. ID: %', _remind_id
		using HINT = 'Напоминание не найдено', ERRCODE = 'H0404';
	end if;

	if user_id != _user_id then
		raise 'Forbidden. Remind_id: %, UserID: %', _remind_id, _user_id
		using HINT = 'Пользователь не является владельцем напоминания', ERRCODE = 'H0403';
	end if;

	delete from cars.reminding where id=_remind_id;
end
$$;


ALTER FUNCTION cars.deleteremind(_remind_id bigint, _user_id bigint) OWNER TO postgreadmin;

--
-- Name: deleteservice(bigint, bigint); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.deleteservice(_service_id bigint, _user_id bigint) RETURNS void
    LANGUAGE plpgsql
    AS $_$
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
		raise 'Service not found. ID: %', _service_id
		using HINT = 'Сервис не найден', ERRCODE = 'H0404';
	end if;

	if user_id != $2 then
		raise 'Forbidden. Service_id: %, UserID: %', _service_id, _user_id
		using HINT = 'Пользователь не является владельцем сервиса', ERRCODE = 'H0403';
	end if;

	delete from cars.services where services.service_id=_service_id;
end
$_$;


ALTER FUNCTION cars.deleteservice(_service_id bigint, _user_id bigint) OWNER TO postgreadmin;

--
-- Name: getprofile(character varying, bytea); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.getprofile(INOUT login character varying, passwd bytea, OUT user_id bigint) RETURNS record
    LANGUAGE plpgsql
    AS $_$
declare
	row_password bytea;
begin
	select
		cars.users.user_id,
		cars.users.login,
		cars.users.password_hash
	into
		user_id,
		login,
		row_password
	from cars.users where cars.users.login=$1;

	if user_id is null then
		raise 'not found';
	end if;

	if sha256(passwd) != row_password then
		raise 'login error';
	end if;
end
$_$;


ALTER FUNCTION cars.getprofile(INOUT login character varying, passwd bytea, OUT user_id bigint) OWNER TO postgreadmin;

--
-- Name: getprofile(character varying, character varying); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.getprofile(INOUT login character varying, passwd character varying, OUT user_id bigint) RETURNS record
    LANGUAGE plpgsql
    AS $_$
declare
	row_password bytea;
begin
	select
		users.user_id,
		users.login,
		users.password_hash
	into
		user_id,
		login,
		row_password
	from users where users.login=$1;

	if user_id is null then
		raise 'not found';
	end if;

	if sha256(passwd) != row_password then
		raise 'login error';
	end if;
end
$_$;


ALTER FUNCTION cars.getprofile(INOUT login character varying, passwd character varying, OUT user_id bigint) OWNER TO postgreadmin;

--
-- Name: setavtoodo(bigint, integer, bigint); Type: FUNCTION; Schema: cars; Owner: postgreadmin
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

	if found_car.avto_id is null then
		raise 'Avto not found. ID: %', _avto_id
		using HINT = 'Авто не найдено', ERRCODE = 'H0404';
	end if;

	if found_car.user_id != _user_id then
		raise 'Forbidden. Avto_id: %, UserID: %', _avto_id, _user_id
		using HINT = 'Пользователь не является владельцем авто', ERRCODE = 'H0403';
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


ALTER FUNCTION cars.setavtoodo(_avto_id bigint, _odo integer, _user_id bigint) OWNER TO postgreadmin;

--
-- Name: updateavto(bigint, integer, character varying, bigint, boolean); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.updateavto(_avto_id bigint, _odo integer, _name character varying, _user_id bigint, _public boolean DEFAULT NULL::boolean) RETURNS cars.avto
    LANGUAGE plpgsql
    AS $$
declare
	found_car cars.avto;
begin
	if length(_name) = 0 then
		raise 'Name is empty'
		using HINT = 'Не указано название';
	end if;
	
	select * into found_car
	from cars.avto
	where avto.avto_id=_avto_id;

	if found_car.avto_id is null then
		raise 'Avto not found. ID: %', _avto_id
		using HINT = 'Авто не найдено', ERRCODE = 'H0404';
	end if;

	if found_car.user_id != _user_id then
		raise 'Forbidden. Avto_id: %, UserID: %', _avto_id, _user_id
		using HINT = 'Пользователь не является владельцем авто', ERRCODE = 'H0403';
	end if;

	if _public is null then
		update cars.avto set "name"=_name,odo=_odo where cars.avto.avto_id=_avto_id returning * into found_car;
	else
		update cars.avto set "name"=_name,odo=_odo,public=_public where cars.avto.avto_id=_avto_id returning * into found_car;
	end if;
	
	return found_car;
end
$$;


ALTER FUNCTION cars.updateavto(_avto_id bigint, _odo integer, _name character varying, _user_id bigint, _public boolean) OWNER TO postgreadmin;

--
-- Name: updateavto(bigint, integer, character varying, bigint, boolean, boolean); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.updateavto(_avto_id bigint, _odo integer, _name character varying, _user_id bigint, _avatar boolean DEFAULT NULL::boolean, _public boolean DEFAULT NULL::boolean) RETURNS cars.avto
    LANGUAGE plpgsql
    AS $$
declare
	found_car cars.avto;
begin
	if length(_name) = 0 then
		raise 'Name is empty'
		using HINT = 'Не указано название';
	end if;
	
	select * into found_car
	from cars.avto
	where avto.avto_id=_avto_id;

	if found_car.avto_id is null then
		raise 'Avto not found. ID: %', _avto_id
		using HINT = 'Авто не найдено', ERRCODE = 'H0404';
	end if;

	if found_car.user_id != _user_id then
		raise 'Forbidden. Avto_id: %, UserID: %', _avto_id, _user_id
		using HINT = 'Пользователь не является владельцем авто', ERRCODE = 'H0403';
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


ALTER FUNCTION cars.updateavto(_avto_id bigint, _odo integer, _name character varying, _user_id bigint, _avatar boolean, _public boolean) OWNER TO postgreadmin;

--
-- Name: updategroup(bigint, bigint, character varying); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.updategroup(_group_id bigint, _user_id bigint, _name character varying) RETURNS cars.groups
    LANGUAGE plpgsql
    AS $$
declare
	found_group cars."groups";
begin
	if length(_name) = 0 then
		raise 'Name is empty'
		using HINT = 'Не указано название';
	end if;
	
	select * into found_group
	from cars."groups"
	where group_id=_group_id;

	if found_group.group_id is null or found_group."global" then
		raise 'Group not found. ID: %', _group_id
		using HINT = 'Группа не найдена', ERRCODE = 'H0404';
	end if;

	if found_group.user_id != _user_id then
		raise 'Forbidden. Group_id: %, UserID: %', _group_id, _user_id
		using HINT = 'Пользователь не является владельцем группы', ERRCODE = 'H0403';
	end if;

	update cars."groups" set "name"=_name where group_id=_group_id returning * into found_group;
	return found_group;
end
$$;


ALTER FUNCTION cars.updategroup(_group_id bigint, _user_id bigint, _name character varying) OWNER TO postgreadmin;

--
-- Name: updateremind(bigint, bigint, cars.eventtypes, date, date, smallint, text); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.updateremind(_id bigint, _user_id bigint, _event_type cars.eventtypes, _date_start date, _date_end date, _days smallint, _comment text) RETURNS cars.reminding
    LANGUAGE plpgsql
    AS $$
declare
	found_remind cars.reminding;
begin
	if _user_id = 0 then
		raise 'User ID is empty'
		using HINT = 'Не указан пользователь';
	end if;

	select * into found_remind
	from cars.reminding
	where cars.reminding.id=_id;

	if found_remind.id is null then
		raise 'Remind not found. ID: %', _id
		using HINT = 'Напоминание не найдено', ERRCODE = 'H0404';
	end if;

	if found_remind.user_id != _user_id then
		raise 'Forbidden. Remind_id: %, UserID: %', _id, _user_id
		using HINT = 'Пользователь не является владельцем напоминания', ERRCODE = 'H0403';
	end if;

	update cars.reminding set event_type=_event_type,date_start=_date_start,date_end=_date_end,days_before_event=_days,comment=_comment
	where id=_id returning * into found_remind;

	return found_remind;
end
$$;


ALTER FUNCTION cars.updateremind(_id bigint, _user_id bigint, _event_type cars.eventtypes, _date_start date, _date_end date, _days smallint, _comment text) OWNER TO postgreadmin;

--
-- Name: updateservice(bigint, bigint, integer, integer, date, character varying, money); Type: FUNCTION; Schema: cars; Owner: postgreadmin
--

CREATE FUNCTION cars.updateservice(_service_id bigint, _user_id bigint, _odo integer, _next_odo integer, _date date, _comment character varying, _price money) RETURNS cars.services
    LANGUAGE plpgsql
    AS $$
declare
	found_service cars.services;
begin
	select * into found_service
	from cars.services
	where services.service_id=_service_id;

	if found_service.service_id is null then
		raise 'Service not found. ID: %', _service_id
		using HINT = 'Сервис не найден', ERRCODE = 'H0404';
	end if;

	if found_service.user_id != _user_id then
		raise 'Forbidden. Service_id: %, UserID: %', _service_id, _user_id
		using HINT = 'Сервис не принадлежит пользователю', ERRCODE = 'H0403';
	end if;

	update cars.services set odo=_odo,next_odo=_next_odo,"date"=_date,comment=_comment,price=_price where service_id=_service_id returning * into found_service;
	return found_service;
end
$$;


ALTER FUNCTION cars.updateservice(_service_id bigint, _user_id bigint, _odo integer, _next_odo integer, _date date, _comment character varying, _price money) OWNER TO postgreadmin;

--
-- Name: avto_avto_id_seq; Type: SEQUENCE; Schema: cars; Owner: postgreadmin
--

CREATE SEQUENCE cars.avto_avto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.avto_avto_id_seq OWNER TO postgreadmin;

--
-- Name: avto_avto_id_seq; Type: SEQUENCE OWNED BY; Schema: cars; Owner: postgreadmin
--

ALTER SEQUENCE cars.avto_avto_id_seq OWNED BY cars.avto.avto_id;


--
-- Name: groups_group_id_seq; Type: SEQUENCE; Schema: cars; Owner: postgreadmin
--

CREATE SEQUENCE cars.groups_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.groups_group_id_seq OWNER TO postgreadmin;

--
-- Name: groups_group_id_seq; Type: SEQUENCE OWNED BY; Schema: cars; Owner: postgreadmin
--

ALTER SEQUENCE cars.groups_group_id_seq OWNED BY cars.groups.group_id;


--
-- Name: reminding_id_seq; Type: SEQUENCE; Schema: cars; Owner: postgreadmin
--

CREATE SEQUENCE cars.reminding_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.reminding_id_seq OWNER TO postgreadmin;

--
-- Name: reminding_id_seq; Type: SEQUENCE OWNED BY; Schema: cars; Owner: postgreadmin
--

ALTER SEQUENCE cars.reminding_id_seq OWNED BY cars.reminding.id;


--
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: cars; Owner: postgreadmin
--

CREATE SEQUENCE cars.services_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.services_service_id_seq OWNER TO postgreadmin;

--
-- Name: services_service_id_seq; Type: SEQUENCE OWNED BY; Schema: cars; Owner: postgreadmin
--

ALTER SEQUENCE cars.services_service_id_seq OWNED BY cars.services.service_id;


--
-- Name: users; Type: TABLE; Schema: cars; Owner: postgreadmin
--

CREATE TABLE cars.users (
    user_id bigint NOT NULL,
    login character varying(255) NOT NULL,
    password_hash bytea
);


ALTER TABLE cars.users OWNER TO postgreadmin;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: cars; Owner: postgreadmin
--

CREATE SEQUENCE cars.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cars.users_user_id_seq OWNER TO postgreadmin;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: cars; Owner: postgreadmin
--

ALTER SEQUENCE cars.users_user_id_seq OWNED BY cars.users.user_id;


--
-- Name: avto avto_id; Type: DEFAULT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.avto ALTER COLUMN avto_id SET DEFAULT nextval('cars.avto_avto_id_seq'::regclass);


--
-- Name: groups group_id; Type: DEFAULT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.groups ALTER COLUMN group_id SET DEFAULT nextval('cars.groups_group_id_seq'::regclass);


--
-- Name: reminding id; Type: DEFAULT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.reminding ALTER COLUMN id SET DEFAULT nextval('cars.reminding_id_seq'::regclass);


--
-- Name: services service_id; Type: DEFAULT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.services ALTER COLUMN service_id SET DEFAULT nextval('cars.services_service_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.users ALTER COLUMN user_id SET DEFAULT nextval('cars.users_user_id_seq'::regclass);


--
-- Data for Name: avto; Type: TABLE DATA; Schema: cars; Owner: postgreadmin
--

COPY cars.avto (avto_id, name, odo, user_id, avatar, public) FROM stdin;
17	MyAvto	180000	1	f	f
16	Test	180000	1	t	f
1	Nissan Teana	181000	1	t	f
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: cars; Owner: postgreadmin
--

COPY cars.groups (group_id, user_id, name, sort, global) FROM stdin;
1	0	Моторное масло	2	t
2	0	Трансмиссионное масло	3	t
3	0	Фильтры	4	t
4	0	Охлаждающие жидкости	5	t
5	0	Жидкость гидроусилителя руля	6	t
6	0	Тормозная жидкость	7	t
7	0	Ходовая часть	8	t
8	0	Двигатель	9	t
11	1	Прочее	10	f
\.


--
-- Data for Name: reminding; Type: TABLE DATA; Schema: cars; Owner: postgreadmin
--

COPY cars.reminding (id, user_id, event_type, date_start, date_end, days_before_event, comment, is_closed) FROM stdin;
4	1	insurance	2018-04-14	2018-04-15	30	hello	t
5	1	insurance	2018-04-01	2018-06-10	30	test2	t
6	1	docs	2003-10-22	2013-11-09	30	\N	t
7	1	docs	2013-11-09	2023-11-09	90	\N	f
3	1	insurance	2018-05-12	2018-05-14	31	Test update	t
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: cars; Owner: postgreadmin
--

COPY cars.services (service_id, avto_id, user_id, group_id, odo, next_odo, date, comment, price) FROM stdin;
1	1	1	1	119850	\N	2015-11-08	Totachi 5W30 синт. Фильтр C-224 Zic	\N
2	1	1	2	119850	\N	2015-11-08	Totachi ATF CVT, 9.2	\N
3	1	1	1	127425	\N	2015-04-02	Totachi 5W30 синт.	\N
4	1	1	1	136070	\N	2016-08-06	Totachi 5W30 синт.	\N
5	1	1	2	136140	\N	2016-08-14	Замена на оригинал NS-3. С промывкой.	\N
6	1	1	1	144600	\N	2017-01-14	Totachi 5W30 синт.	\N
7	1	1	8	144600	\N	2017-01-14	Denso, 6шт	1 500.00 ₽
8	1	1	2	151060	\N	2017-04-28	Чистка гидроблока. Стоимость со всеми расходниками.	21 800.00 ₽
9	1	1	1	153800	\N	2017-06-16	Totachi 5W30 синт.	\N
10	1	1	1	160700	\N	2017-09-23	Totachi 5W30 синт.	\N
11	1	1	1	168700	\N	2018-02-24	Totachi 5W30 синт.	\N
12	1	1	11	156000	\N	2017-08-05	Подшипник натяжного и обводного роликов. Ремень.	320.00 ₽
13	1	1	3	168700	\N	2018-02-24	Воздушный	\N
14	1	1	1	177300	\N	2018-07-14	Totachi 5W30 синт.	\N
15	1	1	4	170000	\N	2018-04-14	Антифриз "KYK" -40C Зеленый	\N
16	1	1	5	177300	\N	2018-07-14	Castrol Dext III	800.00 ₽
17	1	1	6	177300	\N	2018-07-14	Nissan DOT4	800.00 ₽
19	1	1	1	9	\N	2018-01-01	\N	1 300.00 ₽
30	1	1	1	180000	\N	2019-01-14	2019-01-14T18:04:58.208Z	\N
31	1	1	1	180001	\N	2019-01-14	2019-01-14T18:07:21.013Z	\N
32	1	1	1	180000	\N	2019-01-15	test	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: cars; Owner: postgreadmin
--

COPY cars.users (user_id, login, password_hash) FROM stdin;
1	mil-ast@yandex.ru	\\xa320480f534776bddb5cdb54b1e93d210a3c7d199e80a23c1b2178497b184c76
0	admin	\\x3509c18dce81d24b7d3780748e7b80024b5d802023e58f030d905395b1d192a1
\.


--
-- Name: avto_avto_id_seq; Type: SEQUENCE SET; Schema: cars; Owner: postgreadmin
--

SELECT pg_catalog.setval('cars.avto_avto_id_seq', 17, true);


--
-- Name: groups_group_id_seq; Type: SEQUENCE SET; Schema: cars; Owner: postgreadmin
--

SELECT pg_catalog.setval('cars.groups_group_id_seq', 32, true);


--
-- Name: reminding_id_seq; Type: SEQUENCE SET; Schema: cars; Owner: postgreadmin
--

SELECT pg_catalog.setval('cars.reminding_id_seq', 9, true);


--
-- Name: services_service_id_seq; Type: SEQUENCE SET; Schema: cars; Owner: postgreadmin
--

SELECT pg_catalog.setval('cars.services_service_id_seq', 32, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: cars; Owner: postgreadmin
--

SELECT pg_catalog.setval('cars.users_user_id_seq', 1, true);


--
-- Name: avto avto_id; Type: CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.avto
    ADD CONSTRAINT avto_id PRIMARY KEY (avto_id);


--
-- Name: groups group_id; Type: CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.groups
    ADD CONSTRAINT group_id PRIMARY KEY (group_id);


--
-- Name: reminding reminding_pkey; Type: CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.reminding
    ADD CONSTRAINT reminding_pkey PRIMARY KEY (id);


--
-- Name: services services_pk; Type: CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.services
    ADD CONSTRAINT services_pk PRIMARY KEY (service_id);


--
-- Name: users user_id; Type: CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.users
    ADD CONSTRAINT user_id PRIMARY KEY (user_id);


--
-- Name: users users_un; Type: CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.users
    ADD CONSTRAINT users_un UNIQUE (login);


--
-- Name: avto_user_id_idx; Type: INDEX; Schema: cars; Owner: postgreadmin
--

CREATE INDEX avto_user_id_idx ON cars.avto USING btree (user_id);


--
-- Name: groups_global_idx; Type: INDEX; Schema: cars; Owner: postgreadmin
--

CREATE INDEX groups_global_idx ON cars.groups USING btree (global);


--
-- Name: reminding_is_closed_idx; Type: INDEX; Schema: cars; Owner: postgreadmin
--

CREATE INDEX reminding_is_closed_idx ON cars.reminding USING btree (is_closed);


--
-- Name: services_user_group_id_idx; Type: INDEX; Schema: cars; Owner: postgreadmin
--

CREATE INDEX services_user_group_id_idx ON cars.services USING btree (user_id, group_id);


--
-- Name: services_user_id_idx; Type: INDEX; Schema: cars; Owner: postgreadmin
--

CREATE INDEX services_user_id_idx ON cars.services USING btree (user_id, avto_id);


--
-- Name: avto avto_users_fk; Type: FK CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.avto
    ADD CONSTRAINT avto_users_fk FOREIGN KEY (user_id) REFERENCES cars.users(user_id) ON DELETE CASCADE;


--
-- Name: groups groups_users_fk; Type: FK CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.groups
    ADD CONSTRAINT groups_users_fk FOREIGN KEY (user_id) REFERENCES cars.users(user_id) ON DELETE CASCADE;


--
-- Name: reminding reminding_users_fk; Type: FK CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.reminding
    ADD CONSTRAINT reminding_users_fk FOREIGN KEY (user_id) REFERENCES cars.users(user_id) ON DELETE CASCADE;


--
-- Name: services services_avto_fk; Type: FK CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.services
    ADD CONSTRAINT services_avto_fk FOREIGN KEY (avto_id) REFERENCES cars.avto(avto_id) ON DELETE CASCADE;


--
-- Name: services services_groups_fk; Type: FK CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.services
    ADD CONSTRAINT services_groups_fk FOREIGN KEY (group_id) REFERENCES cars.groups(group_id) ON DELETE CASCADE;


--
-- Name: services services_users_fk; Type: FK CONSTRAINT; Schema: cars; Owner: postgreadmin
--

ALTER TABLE ONLY cars.services
    ADD CONSTRAINT services_users_fk FOREIGN KEY (user_id) REFERENCES cars.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

