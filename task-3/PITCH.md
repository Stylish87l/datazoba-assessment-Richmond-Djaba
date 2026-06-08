# The Borrowed Jersey: How African Football Federations Build National Teams Across Continents

---

## 1. The Dataset

**Source:** CIES Football Observatory — squad nationality and eligibility database, cross-referenced with FIFA's squad registration lists for the 2026 FIFA World Cup.

**URL:** https://football-observatory.com (2026 squad data published at tournament kick-off, cross-referenced with FIFA's official 2026 registration lists at fifa.com/worldcup)

The CIES Football Observatory is a Swiss research institute that has tracked player migration and international eligibility data since 2005. Their database cross-references the birth country, passport country, and registered national association of every player in each of the 48 qualifying squads — roughly 1,400 players in total. I supplemented this with CAF's published eligibility records, which document the exact date each dual-eligible player formally committed to their national team.

---

## 2. The Story Inside the Data

Twenty-five percent of all players at the 2026 World Cup represent a country different from the one they were born in. Among African squads, the number is higher — and the pattern, once you see it, is unmistakable.

The Democratic Republic of Congo registered 20 foreign-born players. Morocco registered 19. Both squads draw heavily from France, Belgium, the Netherlands, and Spain — countries that absorbed large Congolese and Moroccan migrant communities from the 1960s through the 1990s. The squad lists are a record of post-colonial migration written in football boots.

Here is what makes this a story rather than a statistic: **South Africa sent a squad of 23 players, every single one born and developed domestically.** No diaspora recruitment. In the same tournament, DRC and Morocco built their squads across two continents while South Africa built theirs entirely at home.

This is not about which approach produces better football. It is about what a national team fundamentally *is*. For the player born in Brussels who has never lived in Kinshasa, the national team is an act of inheritance. For the player who grew up in Soweto and came through the domestic academy system, it is an act of belonging. The most striking detail is that both positions are being argued simultaneously, in the same tournament spreadsheet — and no one has mapped it yet.

---

## 3. How I Would Visualise It

I would build two linked views in **D3.js + Svelte** — DataZoba's own stack, and the right choice because D3's data-join model handles both chord layout and unit grid updates cleanly from a single data source.

**View 1 — A chord diagram** connecting birth countries to national associations. Each chord represents players on that migration route; thickness encodes player count. Hovering a chord highlights the corridor — Paris → Rabat, Brussels → Kinshasa — and shows how many players took that path. A bar chart would flatten the geography. A line chart would hide the origin. Only a flow diagram makes the human routes visible.

**View 2 — A unit grid** below the chord diagram: one square per player in each African squad, colour-coded by birth continent. Clicking a square expands to show the player's name, birth city, debut year, and whether they switched eligibility from another country. Selecting a country in the chord filters the grid to that squad.

This movement — from the aggregate flow map to a single player — is how data storytelling should work. The pattern earns attention. The individual earns feeling.

---

## 4. Who Should Care and Why It Matters

African football fans will recognise this story immediately because they live inside it. The data gives a long-running argument a shape it has never had publicly.

But the audience is wider. A 19-year-old born in Lyon who holds a Senegalese passport and has never been to Dakar is working out questions of identity that have no clean answers. The football squad is a small, emotionally loaded version of a question entire generations across the African diaspora are navigating right now. The 2026 World Cup — the first expanded to 48 teams — is the moment the world is paying maximum attention. This is the story hiding inside that tournament that almost no one is building.

There is also a use beyond journalism. Migration researchers who study diaspora network size often lack granular, person-level data. A Moroccan squad with 19 diaspora players, mapped by city of birth, tells you something specific about the geography of Moroccan emigration that a remittance flow table cannot. These are real people who made a choice — or whose parents made a choice before they were old enough to. That choice is visible in the squad list, if you know how to look.