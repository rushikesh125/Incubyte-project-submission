--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
-- Name: Sweet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sweet" (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    price double precision NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "posterURL" text NOT NULL
);


ALTER TABLE public."Sweet" OWNER TO postgres;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sweetId" text NOT NULL,
    quantity integer NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Sweet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sweet" (id, name, category, price, quantity, "createdAt", "updatedAt", "posterURL") FROM stdin;
2aa092f9-d5e4-4cc9-917e-f14508496b88	Milk Chocolate Bar	Chocolate	2.99	18	2025-09-19 08:35:26.958	2025-09-19 18:47:27.028	http://static.vecteezy.com/system/resources/thumbnails/016/282/492/small_2x/lyangcha-langcha-or-lemcha-is-an-indian-sweet-dish-prepared-in-west-bengal-jharkhand-odisha-bihar-assam-tripura-free-photo.jpg
12bcfc3c-c63f-4fd7-960b-cc040b17b75b	Gulab Jamun	Dessert	3.49	7	2025-09-19 11:24:17.409	2025-09-19 19:47:02.825	https://i.ibb.co/QF1Cqjh2/Gulab-Jamun.jpg
ecde6062-84c7-494a-ad96-defac0a36249	Kaju Katli	Dessert	6.99	5	2025-09-19 11:25:42.271	2025-09-19 19:52:55.932	https://i.ibb.co/Rp9tcSBR/Kaju-Katli.jpg
e7e992d8-6943-4bb1-9845-b5187cb7a0c4	Rasgulla	Dessert	8.99	0	2025-09-19 11:26:45.987	2025-09-19 16:58:46.398	https://i.ibb.co/hFZPpz3M/Rasgulla.jpg
aaf91b11-01da-45d6-882b-1ee22fd63b3c	Caramel Toffee	Candy	1.49	5	2025-09-19 11:28:00.874	2025-09-19 17:31:22.679	https://i.ibb.co/vxLJPpzm/Caramel-Toffee.jpg
3707d265-d674-4ec2-aebd-8a6805246e5e	Vanilla Ice Cream Cup	Ice Cream	2.49	0	2025-09-19 11:29:33.651	2025-09-19 18:05:20.721	https://i.ibb.co/Mk9dMgpT/Vanilla-Ice-Cream-Cup.jpg
945d1dd9-93bb-424a-bdfc-2e0ce4893ab7	Choco Chip Cookies	Cookies	5.6	0	2025-09-19 11:28:38.793	2025-09-19 18:06:29.247	https://i.ibb.co/tpBcbQCZ/Choco-Chip-Cookies.jpg
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, "userId", "sweetId", quantity, "timestamp") FROM stdin;
bb25f967-0028-48da-b665-bbbb10154297	7fdfddca-d2ad-4a47-8e60-d7371339bb50	945d1dd9-93bb-424a-bdfc-2e0ce4893ab7	1	2025-09-19 17:26:26.205
aef64426-6201-429f-8b12-2d0cc41d0e9e	7fdfddca-d2ad-4a47-8e60-d7371339bb50	aaf91b11-01da-45d6-882b-1ee22fd63b3c	3	2025-09-19 17:26:26.207
4e2d7c98-c9e8-4f62-9daf-4f0a2cd68532	7fdfddca-d2ad-4a47-8e60-d7371339bb50	3707d265-d674-4ec2-aebd-8a6805246e5e	2	2025-09-19 17:26:26.299
314df8b3-6b81-4489-b4f4-acde53f8ad35	7fdfddca-d2ad-4a47-8e60-d7371339bb50	aaf91b11-01da-45d6-882b-1ee22fd63b3c	3	2025-09-19 17:26:32.662
a0812bbf-7e37-4d7a-920a-d3e32d76f564	7fdfddca-d2ad-4a47-8e60-d7371339bb50	aaf91b11-01da-45d6-882b-1ee22fd63b3c	3	2025-09-19 17:27:48.637
b4f80783-18d3-4655-9087-9d56d4278c0c	7fdfddca-d2ad-4a47-8e60-d7371339bb50	aaf91b11-01da-45d6-882b-1ee22fd63b3c	3	2025-09-19 17:28:00.225
1cdb05e7-8837-4fec-a292-8f5a4cb3641b	2308f3d3-ed3e-4e42-a556-e6895360502a	aaf91b11-01da-45d6-882b-1ee22fd63b3c	3	2025-09-19 17:31:22.638
0070891c-1b11-4492-8dc8-793532102ddb	2308f3d3-ed3e-4e42-a556-e6895360502a	945d1dd9-93bb-424a-bdfc-2e0ce4893ab7	1	2025-09-19 17:31:22.638
de2bb8ab-a635-4fe0-82d1-859ccd365e19	2308f3d3-ed3e-4e42-a556-e6895360502a	12bcfc3c-c63f-4fd7-960b-cc040b17b75b	2	2025-09-19 18:00:18.763
7baf7940-05af-4816-bcf8-c56a016586d1	2308f3d3-ed3e-4e42-a556-e6895360502a	3707d265-d674-4ec2-aebd-8a6805246e5e	1	2025-09-19 18:05:20.718
9724eecc-fd1c-4dd8-b6be-6d3ec0b6d7af	2308f3d3-ed3e-4e42-a556-e6895360502a	945d1dd9-93bb-424a-bdfc-2e0ce4893ab7	1	2025-09-19 18:06:29.205
384d9964-5064-4893-a273-fc2fc7695d0e	2308f3d3-ed3e-4e42-a556-e6895360502a	ecde6062-84c7-494a-ad96-defac0a36249	1	2025-09-19 18:23:46.619
0d140edb-070b-4b6a-b464-969595c82645	2308f3d3-ed3e-4e42-a556-e6895360502a	2aa092f9-d5e4-4cc9-917e-f14508496b88	2	2025-09-19 18:47:26.985
4af06617-294b-4c09-ba11-fc3537d545f1	2308f3d3-ed3e-4e42-a556-e6895360502a	ecde6062-84c7-494a-ad96-defac0a36249	2	2025-09-19 18:47:26.985
cf3c2373-0352-456a-9bcf-f6b3f355ec36	7fdfddca-d2ad-4a47-8e60-d7371339bb50	12bcfc3c-c63f-4fd7-960b-cc040b17b75b	1	2025-09-19 19:47:02.782
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "fullName", email, password, role, "createdAt", "updatedAt") FROM stdin;
2308f3d3-ed3e-4e42-a556-e6895360502a	Admin1	admin1@mail.com	$2b$10$gJQyeAaKfbFTupnfZm31Nuo5LUUQpPeh9EyI3pj8oPQbzqeSVOjkK	admin	2025-09-19 08:35:03.277	2025-09-19 08:35:03.277
7fdfddca-d2ad-4a47-8e60-d7371339bb50	Rushikesh 	rushi@mail.com	$2b$10$nICDJNeFqR.Ye9rzKg0hYOId4K.pbvloWY6tDl/Cw/gljbYRd4Xp.	user	2025-09-19 08:44:54.307	2025-09-19 08:44:54.307
1057435d-7250-4265-9f0c-9f4458540fbf	Regular User	user@example.com	$2b$10$1p7HYyUISo3lBp7na4.NIOXlY3rokhzcJsWAfFa6SwKlAGIEuTf.G	admin	2025-09-19 08:04:32.302	2025-09-19 12:30:23.891
31ef3323-1501-4cf4-a7a9-3948cb0659c4	admin	admin@mail.com	$2b$10$IgeGEnb6f6K3BY2VvtajR.EJo/J5yEh67/8Nl8JnznxqrUg.CYA9m	admin	2025-09-19 12:50:02.519	2025-09-19 12:50:19.236
3b5d7677-661a-410e-b561-59cfd12ff124	Admin User	admin@example.com	$2b$10$0RRyIuxJ12GOi6T5YQikZ.eF27LRkeLbkMv4.xOzmZeVZYsI5SB1u	admin	2025-09-19 08:04:32.425	2025-09-19 08:04:32.425
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1237f3b4-71a8-4e6f-99ba-a89025276788	ff9090bdd3f4cace7a5f854dd0fb856ef7974f5a372804296669132186068c9c	2025-09-18 17:28:54.490948+05:30	20250918115854_init	\N	\N	2025-09-18 17:28:54.449634+05:30	1
32522c22-f4f1-4734-8502-8f4aa3ae8e11	016ba146457e84f4e36391db1913fe243f0ce84c30b828a8f51dfb5e20f64dee	2025-09-19 13:14:19.504002+05:30	20250919074419_sweets_updated_with_poster_url	\N	\N	2025-09-19 13:14:19.494174+05:30	1
\.


--
-- Name: Sweet Sweet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sweet"
    ADD CONSTRAINT "Sweet_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Transaction Transaction_sweetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_sweetId_fkey" FOREIGN KEY ("sweetId") REFERENCES public."Sweet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

