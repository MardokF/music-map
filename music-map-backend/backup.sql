--
-- PostgreSQL database dump
--

-- Dumped from database version 17.3
-- Dumped by pg_dump version 17.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: songs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.songs (
    id integer NOT NULL,
    user_id integer,
    song_name character varying(255) NOT NULL,
    artist character varying(255) NOT NULL,
    lat numeric(9,6) NOT NULL,
    lon numeric(9,6) NOT NULL,
    spotify_url text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_votes integer DEFAULT 0,
    sun integer DEFAULT 1
);


ALTER TABLE public.songs OWNER TO postgres;

--
-- Name: songs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.songs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.songs_id_seq OWNER TO postgres;

--
-- Name: songs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.songs_id_seq OWNED BY public.songs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.votes (
    id integer NOT NULL,
    user_id integer,
    song_id integer,
    vote integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT votes_vote_check CHECK ((vote = ANY (ARRAY['-1'::integer, 1])))
);


ALTER TABLE public.votes OWNER TO postgres;

--
-- Name: votes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.votes_id_seq OWNER TO postgres;

--
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.votes_id_seq OWNED BY public.votes.id;


--
-- Name: songs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs ALTER COLUMN id SET DEFAULT nextval('public.songs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes ALTER COLUMN id SET DEFAULT nextval('public.votes_id_seq'::regclass);


--
-- Data for Name: songs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.songs (id, user_id, song_name, artist, lat, lon, spotify_url, created_at, total_votes, sun) FROM stdin;
23	6	Prova2	Prova2	44.925918	9.179077	https://open.spotify.com/intl-it/track/3wMJQ5qeN02ljNn3lRMVka	2025-02-23 16:11:12.952924	2	1
42	6	Not Like Us	Kendrick Lamar	37.502361	15.087372	https://open.spotify.com/intl-it/track/6AI3ezQ4o3HUoP6Dhudph3	2025-02-27 11:09:37.671536	0	1
1	1	Bohemian Rhapsody	Queen	45.464200	9.190000	https://open.spotify.com/track/xyz	2025-02-22 16:46:57.993517	5	1
30	7	Not like us	Kendrick Lamar	45.587591	9.351295	https://open.spotify.com/intl-it/track/6AI3ezQ4o3HUoP6Dhudph3	2025-02-24 19:00:31.736378	2	1
3	1	Blinding Lights	The Weeknd	40.712800	-74.006000	https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b	2025-02-22 16:55:34.458946	1	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password) FROM stdin;
1	testuser	test@example.com	hashedpassword
2	user2	user2@example.com	hashedpassword2
3	user3	user3@example.com	hashedpassword3
4	user4	user4@example.com	hashedpassword4
5	Prova1	prova1@gmail.com	$2b$10$ly4wDzl.EpaEhMHYIyuyg.2legQ20jGj5.kIk4xWpvG22texcHUoS
6	prova2	prova2@gmail.com	$2b$10$b69efXzw5r9zTDvJS8UXeuD6KXXOooTFtA5sUY2cfyJgXfZjz5JBK
7	prova3	prova3@gmail.com	$2b$10$dh4S7W1SI5lh0EHf6T/ize1H998Di2U77NFPTAmY1KGFhr24DoO8O
8	serena	serena@gmail.com	$2b$10$MWKuIPvLIqRSHTjxCBvGUuZugYxojMZkkg2cbDGmSm7TAtd/kSz26
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.votes (id, user_id, song_id, vote, created_at) FROM stdin;
1	1	1	1	2025-02-22 16:47:02.196095
64	6	23	1	2025-02-23 16:11:18.838534
116	5	3	-1	2025-02-26 21:20:53.614512
5	1	3	1	2025-02-22 16:56:08.343073
7	2	3	1	2025-02-22 17:03:48.269793
8	2	1	1	2025-02-22 17:04:46.54707
9	4	1	1	2025-02-22 17:05:52.531461
75	\N	1	1	2025-02-23 16:20:20.13948
76	\N	1	1	2025-02-23 16:21:53.884555
182	\N	1	1	2025-02-28 13:00:37.744514
183	\N	1	-1	2025-02-28 13:00:38.224648
184	\N	1	-1	2025-02-28 13:01:21.143054
83	6	1	-1	2025-02-23 18:31:43.711197
185	\N	1	1	2025-02-28 13:01:21.655009
89	7	23	1	2025-02-24 18:21:34.784468
187	\N	1	1	2025-02-28 13:08:10.220414
189	\N	30	1	2025-02-28 13:08:46.950767
192	\N	1	-1	2025-02-28 13:09:18.262113
193	\N	30	1	2025-02-28 13:09:26.442112
195	\N	1	1	2025-02-28 14:22:12.171462
\.


--
-- Name: songs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.songs_id_seq', 83, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.votes_id_seq', 232, true);


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: votes votes_user_id_song_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_song_id_key UNIQUE (user_id, song_id);


--
-- Name: songs songs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: votes votes_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE CASCADE;


--
-- Name: votes votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

