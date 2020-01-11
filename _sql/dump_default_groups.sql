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
-- Data for Name: defaut_groups; Type: TABLE DATA; Schema: service_groups; Owner: pavel
--

COPY service_groups.defaut_groups (group_id, group_name, sort) FROM stdin;
1	Моторное масло	1
2	Трансмиссионное масло	2
3	Фильтры	3
4	Охлаждающие жидкости	4
5	Тормозная жидкость	5
\.


--
-- Name: defaut_groups_group_id_seq; Type: SEQUENCE SET; Schema: service_groups; Owner: pavel
--

SELECT pg_catalog.setval('service_groups.defaut_groups_group_id_seq', 10, true);


--
-- PostgreSQL database dump complete
--

