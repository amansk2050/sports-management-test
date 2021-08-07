//-------------sports table ---------------------

create table sports(
  sport_id serial,
  sports_name varchar(225),
  created_at timestamp default now(),
  status boolean default true,
  updated_at timestamp default now(),
  primary key(sport_id),
);

//-----------------coach table ----------------

create table coach(
  coach_id serial,
  coach_name varchar(225),
  status boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  primay key(coach_id)
);

//----------------team table ------------------------


create table team(
  team_id serial
  team_name varchar(225),
  coach_id integer,
  sport_id integer,
  status boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  primay key(team_id),
  foreign key(coach_id) references coach(coach_id),
  foreign key(sport_id) references sports(sport_id)
);

//----------------player_details table ------------------


create table player_details(
  player_id serial
  player_name varchar(225),
  team_id integer,
  match_played integer,
  point integer,
  status boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  primay key(player_id),
  foreign key(team_id) references team(team_id)
);