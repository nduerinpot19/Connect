-- ============================================
-- coNNect · 93 DIMENSIONI DELL'UNIVERSO
-- Inserisci nel SQL Editor di Supabase
-- ============================================

create table if not exists dimensions (
  id          uuid primary key default gen_random_uuid(),
  number      integer unique not null,  -- da 01 a 93
  icon        text not null,
  name        text not null,
  area        text not null,            -- macro-area
  tags        text[] default '{}',
  description text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

insert into dimensions (number, icon, name, area, tags) values
-- SCIENZE & NATURA (13)
(1,'⚛️','Fisica','Scienze & Natura',ARRAY['#universo','#energia','#relatività']),
(2,'🔢','Matematica','Scienze & Natura',ARRAY['#numeri','#logica','#infinito']),
(3,'🧬','Biologia','Scienze & Natura',ARRAY['#vita','#evoluzione','#DNA']),
(4,'💊','Medicina','Scienze & Natura',ARRAY['#salute','#corpo','#cura']),
(5,'🌌','Astronomia','Scienze & Natura',ARRAY['#stelle','#cosmo','#infinito']),
(6,'🧪','Chimica','Scienze & Natura',ARRAY['#elementi','#reazioni','#molecole']),
(7,'🌊','Ecologia','Scienze & Natura',ARRAY['#ambiente','#clima','#futuro']),
(8,'🌍','Geografia','Scienze & Natura',ARRAY['#luoghi','#confini','#popoli']),
(9,'🌱','Botanica','Scienze & Natura',ARRAY['#piante','#natura','#vita']),
(10,'🌋','Geologia','Scienze & Natura',ARRAY['#terra','#tempo','#strati']),
(11,'🧠','Neuroscienze','Scienze & Natura',ARRAY['#cervello','#mente','#coscienza']),
(12,'🔬','Ricerca','Scienze & Natura',ARRAY['#scoperta','#metodo','#domande']),
(13,'🌡','Meteorologia','Scienze & Natura',ARRAY['#clima','#tempo','#previsioni']),
-- ECONOMIA & SOCIETÀ (13)
(14,'📈','Economia','Economia & Società',ARRAY['#mercati','#denaro','#lavoro']),
(15,'⚖️','Diritto','Economia & Società',ARRAY['#legge','#giustizia','#diritti']),
(16,'🏛','Politica','Economia & Società',ARRAY['#potere','#democrazia','#società']),
(17,'🤝','Sociologia','Economia & Società',ARRAY['#comunità','#relazioni','#gruppi']),
(18,'🌐','Geopolitica','Economia & Società',ARRAY['#nazioni','#conflitti','#potere']),
(19,'📊','Statistica','Economia & Società',ARRAY['#dati','#numeri','#analisi']),
(20,'🏗','Urbanistica','Economia & Società',ARRAY['#città','#spazi','#architettura']),
(21,'🌍','Antropologia','Economia & Società',ARRAY['#culture','#umanità','#diversità']),
(22,'📰','Giornalismo','Economia & Società',ARRAY['#informazione','#verità','#media']),
(23,'🎓','Educazione','Economia & Società',ARRAY['#apprendimento','#scuola','#futuro']),
(24,'💼','Lavoro','Economia & Società',ARRAY['#carriera','#fatica','#scopo']),
(25,'🏠','Abitare','Economia & Società',ARRAY['#casa','#spazio','#radici']),
(26,'🤲','Volontariato','Economia & Società',ARRAY['#dono','#comunità','#solidarietà']),
-- ARTE & CULTURA (15)
(27,'📚','Letteratura','Arte & Cultura',ARRAY['#libri','#parole','#storie']),
(28,'🎵','Musica','Arte & Cultura',ARRAY['#melodia','#emozione','#ascolto']),
(29,'🎬','Cinema','Arte & Cultura',ARRAY['#film','#immagini','#storie']),
(30,'🎨','Arte visiva','Arte & Cultura',ARRAY['#colore','#forma','#bellezza']),
(31,'📸','Fotografia','Arte & Cultura',ARRAY['#immagine','#tempo','#memoria']),
(32,'🎭','Teatro','Arte & Cultura',ARRAY['#scena','#emozione','#pubblico']),
(33,'🏺','Archeologia','Arte & Cultura',ARRAY['#passato','#civiltà','#oggetti']),
(34,'🎪','Design','Arte & Cultura',ARRAY['#forma','#funzione','#estetica']),
(35,'✍️','Scrittura','Arte & Cultura',ARRAY['#parole','#espressione','#diario']),
(36,'🎮','Videogiochi','Arte & Cultura',ARRAY['#gioco','#digitale','#storie']),
(37,'📺','Serie TV','Arte & Cultura',ARRAY['#storie','#personaggi','#emozioni']),
(38,'🎤','Podcast','Arte & Cultura',ARRAY['#voci','#idee','#ascolto']),
(39,'🖼','Musei','Arte & Cultura',ARRAY['#arte','#storia','#contemplazione']),
(40,'🎻','Musica classica','Arte & Cultura',ARRAY['#sinfonia','#emozione','#storia']),
(41,'🎤','Rap & Hip-hop','Arte & Cultura',ARRAY['#parole','#ritmo','#strada']),
-- MENTE & SPIRITO (10)
(42,'🧠','Filosofia','Mente & Spirito',ARRAY['#senso','#esistenza','#verità']),
(43,'🙏','Spiritualità','Mente & Spirito',ARRAY['#anima','#fede','#pace']),
(44,'💭','Psicologia','Mente & Spirito',ARRAY['#mente','#inconscio','#emozioni']),
(45,'🧘','Meditazione','Mente & Spirito',ARRAY['#presente','#respiro','#silenzio']),
(46,'💡','Creatività','Mente & Spirito',ARRAY['#idee','#ispirazione','#innovazione']),
(47,'🌙','Sogni','Mente & Spirito',ARRAY['#inconscio','#visioni','#desideri']),
(48,'🔮','Etica','Mente & Spirito',ARRAY['#valori','#bene','#scelte']),
(49,'🪷','Mindfulness','Mente & Spirito',ARRAY['#presenza','#consapevolezza','#calma']),
(50,'📿','Religione','Mente & Spirito',ARRAY['#fede','#riti','#comunità']),
(51,'⚡','Motivazione','Mente & Spirito',ARRAY['#energia','#forza','#direzione']),
-- VITA & RELAZIONI (13)
(52,'🌍','Quotidianità','Vita & Relazioni',ARRAY['#vita','#giorno','#presente']),
(53,'❤️','Amore','Vita & Relazioni',ARRAY['#relazione','#cuore','#legame']),
(54,'👨‍👩‍👧','Famiglia','Vita & Relazioni',ARRAY['#genitori','#radici','#legami']),
(55,'🤗','Amicizia','Vita & Relazioni',ARRAY['#amici','#fiducia','#presenza']),
(56,'💪','Crescita','Vita & Relazioni',ARRAY['#cambiamento','#sfida','#resilienza']),
(57,'😔','Dolore','Vita & Relazioni',ARRAY['#sofferenza','#perdita','#guarigione']),
(58,'😂','Umorismo','Vita & Relazioni',ARRAY['#ridere','#ironia','#leggerezza']),
(59,'🌙','Notte','Vita & Relazioni',ARRAY['#insonnia','#buio','#pensieri']),
(60,'💔','Solitudine','Vita & Relazioni',ARRAY['#isolamento','#silenzio','#connessione']),
(61,'🧩','Identità','Vita & Relazioni',ARRAY['#chi sono','#valori','#cambiamento']),
(62,'🔑','Libertà','Vita & Relazioni',ARRAY['#scelta','#autonomia','#confini']),
(63,'🌅','Speranza','Vita & Relazioni',ARRAY['#futuro','#possibilità','#domani']),
(64,'💑','Coppia','Vita & Relazioni',ARRAY['#relazione','#complicità','#tempo']),
-- NATURA & CORPO (10)
(65,'🌿','Natura','Natura & Corpo',ARRAY['#terra','#cielo','#silenzio']),
(66,'⚽','Sport','Natura & Corpo',ARRAY['#corpo','#gara','#fatica']),
(67,'🍝','Cibo','Natura & Corpo',ARRAY['#sapore','#tradizione','#memoria']),
(68,'✈️','Viaggi','Natura & Corpo',ARRAY['#luoghi','#scoperta','#lontano']),
(69,'🧬','Salute mentale','Natura & Corpo',ARRAY['#benessere','#equilibrio','#cura']),
(70,'🌱','Sostenibilità','Natura & Corpo',ARRAY['#futuro','#ambiente','#scelte']),
(71,'🏃','Fitness','Natura & Corpo',ARRAY['#corpo','#movimento','#salute']),
(72,'😴','Sonno','Natura & Corpo',ARRAY['#riposo','#sogni','#corpo']),
(73,'🌊','Mare','Natura & Corpo',ARRAY['#acqua','#vastità','#pace']),
(74,'🏔','Montagna','Natura & Corpo',ARRAY['#altitudine','#silenzio','#fatica']),
-- FUTURO & INNOVAZIONE (10)
(75,'🤖','Intelligenza Artificiale','Futuro & Innovazione',ARRAY['#AI','#futuro','#umanità']),
(76,'🚀','Spazio','Futuro & Innovazione',ARRAY['#universo','#esplorazione','#infinito']),
(77,'🔋','Energia','Futuro & Innovazione',ARRAY['#rinnovabile','#clima','#innovazione']),
(78,'🧬','Biotecnologie','Futuro & Innovazione',ARRAY['#DNA','#vita','#etica']),
(79,'💻','Programmazione','Futuro & Innovazione',ARRAY['#codice','#logica','#creazione']),
(80,'🌐','Internet','Futuro & Innovazione',ARRAY['#rete','#libertà','#informazione']),
(81,'📱','Social media','Futuro & Innovazione',ARRAY['#connessione','#identità','#attenzione']),
(82,'🔐','Privacy','Futuro & Innovazione',ARRAY['#dati','#sicurezza','#libertà']),
(83,'⚡','Startup','Futuro & Innovazione',ARRAY['#innovazione','#rischio','#futuro']),
(84,'🎯','Futuro','Futuro & Innovazione',ARRAY['#domani','#cambiamento','#possibilità']),
-- DIMENSIONI EXTRA (9 · per arrivare a 93)
(85,'🎲','Giochi & Scacchi','Extra',ARRAY['#strategia','#mente','#sfida']),
(86,'🌺','Moda','Extra',ARRAY['#stile','#identità','#espressione']),
(87,'🏡','Giardinaggio','Extra',ARRAY['#cura','#natura','#pazienza']),
(88,'🐾','Animali','Extra',ARRAY['#natura','#amore','#compagnia']),
(89,'🎰','Economia comportamentale','Extra',ARRAY['#decisioni','#bias','#psicologia']),
(90,'🌍','Lingue','Extra',ARRAY['#comunicazione','#cultura','#traduzione']),
(91,'🎙','Oratoria','Extra',ARRAY['#parola','#persuasione','#voce']),
(92,'🧶','Artigianato','Extra',ARRAY['#mani','#creazione','#tradizione']),
(93,'✨','Miscellanea','Extra',ARRAY['#libero','#aperto','#tutto'])
on conflict (number) do nothing;

-- indice per ricerca rapida per area
create index if not exists idx_dimensions_area on dimensions(area);
create index if not exists idx_dimensions_tags on dimensions using gin(tags);

-- aggiungi dimension_id alla tabella thoughts
alter table thoughts add column if not exists dimension_id uuid references dimensions(id);
alter table thoughts add column if not exists dimension_number integer;

-- vista: dimensioni più attive
create or replace view top_dimensions as
select
  d.number, d.icon, d.name, d.area,
  count(t.id) as thoughts_count,
  count(distinct t.user_id) as users_count,
  count(distinct c.id) as connections_count
from dimensions d
left join thoughts t on t.dimension_id = d.id
  and t.created_at > now() - interval '30 days'
left join connections c on c.thought_a_id = t.id
group by d.number, d.icon, d.name, d.area
order by connections_count desc, thoughts_count desc;
