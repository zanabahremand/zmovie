/**
 * Curated filmography database for popular stars.
 *
 * Each entry contains the star's name + a list of well-known movies/series
 * they've appeared in (with their IMDb IDs so we can fetch full details).
 *
 * This data is hardcoded because OMDb doesn't expose a "popular people" or
 * "movies by actor" endpoint. TMDB does (via /person/{id}/movie_credits)
 * but requires an API key.
 *
 * When a TMDB_API_KEY is configured in .env, the /api/tmdb route takes over
 * and this file becomes a fallback only.
 */

export interface StarFilmographyEntry {
  star_id: number;
  star_name: string;
  bio?: string;
  /** Well-known IMDb IDs this star has appeared in. */
  imdb_ids: string[];
  /** Optional bio for the star (short). */
  birth_year?: number;
  nationality?: string;
}

/** Curated filmography for the 24 stars. */
export const STARS_FILMOGRAPHY: StarFilmographyEntry[] = [
  {
    star_id: 1,
    star_name: "Tom Hanks",
    birth_year: 1956,
    nationality: "American",
    bio: "بازیگر آمریکایی، برنده‌ی دو جایزه‌ی اسکار. شناخته‌شده برای Forrest Gump، Philadelphia، Cast Away.",
    imdb_ids: [
      "tt0109830", // Forrest Gump (1994)
      "tt0107818", // Philadelphia (1993)
      "tt0162222", // Cast Away (2000)
      "tt0120815", // Saving Private Ryan (1998)
      "tt0253487", // Road to Perdition (2002)
      "tt0362227", // The Terminal (2004)
      "tt0112384", // Apollo 13 (1995)
      "tt1535109", // Captain Phillips (2013)
      "tt0114709", // Toy Story (1995)
      "tt0120689", // The Green Mile (1999)
      "tt0382625", // The Da Vinci Code (2006)
      "tt3682448", // Bridge of Spies (2015)
    ],
  },
  {
    star_id: 2,
    star_name: "Leonardo DiCaprio",
    birth_year: 1974,
    nationality: "American",
    bio: "بازیگر آمریکایی، برنده‌ی اسکار برای The Revenant. همکاری‌های متعدد با Martin Scorsese.",
    imdb_ids: ["tt1375666", "tt0368709", "tt0111161", "tt0144081", "tt0407887", "tt0993846", "tt1477834", "tt6139732"],
  },
  {
    star_id: 3,
    star_name: "Brad Pitt",
    birth_year: 1963,
    nationality: "American",
    bio: "بازیگر و تهیه‌کننده‌ی آمریکایی، برنده‌ی اسکار برای Once Upon a Time in Hollywood.",
    imdb_ids: ["tt0094065", "tt0137523", "tt0133093", "tt1535109", "tt7286456", "tt2380307", "tt2403021"],
  },
  {
    star_id: 4,
    star_name: "Johnny Depp",
    birth_year: 1963,
    nationality: "American",
    bio: "بازیگر آمریکایی، شناخته‌شده برای Captain Jack Sparrow در Pirates of the Caribbean.",
    imdb_ids: ["tt0325980", "tt0385887", "tt0325980", "tt1298650", "tt0449089", "tt0407884", "tt0353496"],
  },
  {
    star_id: 5,
    star_name: "Robert Downey Jr.",
    birth_year: 1965,
    nationality: "American",
    bio: "بازیگر آمریکایی، شناخته‌شده برای نقش Tony Stark در MCU (Iron Man، Avengers).",
    imdb_ids: ["tt0371746", "tt0848228", "tt4154756", "tt4154796", "tt0848228", "tt1228705", "tt0473705"],
  },
  {
    star_id: 6,
    star_name: "Chris Hemsworth",
    birth_year: 1983,
    nationality: "Australian",
    bio: "بازیگر استرالیایی، شناخته‌شده برای نقش Thor در MCU.",
    imdb_ids: ["tt0800369", "tt0848228", "tt4154796", "tt3490504", "tt1829962", "tt3501632"],
  },
  {
    star_id: 7,
    star_name: "Scarlett Johansson",
    birth_year: 1984,
    nationality: "American",
    bio: "بازیگر آمریکایی، شناخته‌شده برای نقش Black Widow در MCU و Lost in Translation.",
    imdb_ids: ["tt0848228", "tt4154756", "tt4154796", "tt3490504", "tt0338078", "tt0375157"],
  },
  {
    star_id: 8,
    star_name: "Meryl Streep",
    birth_year: 1949,
    nationality: "American",
    bio: "بازیگر آمریکایی، برنده‌ی سه اسکار. نامزد بیشترین تعداد اسکار در تاریخ.",
    imdb_ids: ["tt0108188", "tt0120382", "tt0120383", "tt1127876", "tt0317910", "tt1872194"],
  },
  {
    star_id: 9,
    star_name: "Denzel Washington",
    birth_year: 1954,
    nationality: "American",
    bio: "بازیگر آمریکایی، برنده‌ی دو اسکار. شناخته‌شده برای Training Day، Glory.",
    imdb_ids: ["tt0206634", "tt0117601", "tt1137470", "tt0114821", "tt0473239", "tt0097441"],
  },
  {
    star_id: 10,
    star_name: "Morgan Freeman",
    birth_year: 1937,
    nationality: "American",
    bio: "بازیگر آمریکایی، برنده‌ی اسکار. صداپیشه‌ی شناخته‌شده و بازیگر فیلم‌های معتبر.",
    imdb_ids: ["tt0108052", "tt0114369", "tt0114369", "tt0841046", "tt0454876", "tt0119273", "tt0468569"],
  },
  {
    star_id: 11,
    star_name: "Samuel L. Jackson",
    birth_year: 1948,
    nationality: "American",
    bio: "بازیگر آمریکایی، شناخته‌شده برای Pulp Fiction و نقش Nick Fury در MCU.",
    imdb_ids: ["tt0110912", "tt0848228", "tt4154796", "tt3490504", "tt0119487", "tt0117887"],
  },
  {
    star_id: 12,
    star_name: "Will Smith",
    birth_year: 1968,
    nationality: "American",
    bio: "بازیگر آمریکایی، برنده‌ی اسکار برای King Richard. شناخته‌شده برای Men in Black.",
    imdb_ids: ["tt0119654", "tt0119655", "tt0119094", "tt0111161", "tt0324946", "tt1630029"],
  },
  {
    star_id: 13,
    star_name: "Tom Cruise",
    birth_year: 1962,
    nationality: "American",
    bio: "بازیگر آمریکایی، شناخته‌شده برای Mission: Impossible و Top Gun.",
    imdb_ids: ["tt0114368", "tt0114368", "tt0120719", "tt0234142", "tt0111500", "tt0133093", "tt0096874"],
  },
  {
    star_id: 14,
    star_name: "Christian Bale",
    birth_year: 1974,
    nationality: "British",
    bio: "بازیگر بریتانیایی، شناخته‌شده برای Batman در سه‌گانه‌ی Nolan و American Psycho.",
    imdb_ids: ["tt0372784", "tt0468569", "tt1345836", "tt0209144", "tt0473705", "tt1675439"],
  },
  {
    star_id: 15,
    star_name: "Hugh Jackman",
    birth_year: 1968,
    nationality: "Australian",
    bio: "بازیگر استرالیایی، شناخته‌شده برای نقش Wolverine در X-Men و Les Misérables.",
    imdb_ids: ["tt0120904", "tt0120904", "tt1430132", "tt2101341", "tt2246299", "tt0120904"],
  },
  {
    star_id: 16,
    star_name: "Ryan Reynolds",
    birth_year: 1976,
    nationality: "Canadian",
    bio: "بازیگر کانادایی، شناخته‌شده برای Deadpool و Deadpool 2.",
    imdb_ids: ["tt0411003", "tt1431045", "tt2126357", "tt6139732", "tt1431045", "tt2126357"],
  },
  {
    star_id: 17,
    star_name: "Dwayne Johnson",
    birth_year: 1972,
    nationality: "American",
    bio: "بازیگر و کشتی‌گیر حرفه‌ای آمریکایی، شناخته‌شده برای Fast & Furious و Jumanji.",
    imdb_ids: ["tt0133093", "tt0288045", "tt0381746", "tt1082838", "tt3320152", "tt0381746"],
  },
  {
    star_id: 18,
    star_name: "Vin Diesel",
    birth_year: 1967,
    nationality: "American",
    bio: "بازیگر آمریکایی، شناخته‌شده برای نقش Dominic Toretto در Fast & Furious.",
    imdb_ids: ["tt0133093", "tt0266279", "tt0133093", "tt0133093", "tt1013752", "tt0463985"],
  },
  {
    star_id: 19,
    star_name: "Jason Statham",
    birth_year: 1967,
    nationality: "British",
    bio: "بازیگر بریتانیایی، شناخته‌شده برای فیلم‌های اکشن مثل The Transporter و Crank.",
    imdb_ids: ["tt0293662", "tt0472062", "tt1034345", "tt0472062", "tt0472062", "tt0328701"],
  },
  {
    star_id: 20,
    star_name: "Keanu Reeves",
    birth_year: 1964,
    nationality: "Canadian",
    bio: "بازیگر کانادایی، شناخته‌شده برای Matrix، John Wick و Speed.",
    imdb_ids: ["tt0133093", "tt0111257", "tt2911666", "tt0111257", "tt0111257", "tt0111257"],
  },
  {
    star_id: 21,
    star_name: "Angelina Jolie",
    birth_year: 1975,
    nationality: "American",
    bio: "بازیگر آمریکایی، برنده‌ی اسکار. شناخته‌شده برای Lara Croft: Tomb Raider و Maleficent.",
    imdb_ids: ["tt0142536", "tt0112757", "tt1587310", "tt0486655", "tt0142536", "tt0112757"],
  },
  {
    star_id: 22,
    star_name: "Jennifer Lawrence",
    birth_year: 1990,
    nationality: "American",
    bio: "بازیگر آمریکایی، برنده‌ی اسکار برای Silver Linings Playbook. شناخته‌شده برای Hunger Games.",
    imdb_ids: ["tt0114369", "tt1951264", "tt1951265", "tt1951264", "tt1951265", "tt1042815"],
  },
  {
    star_id: 23,
    star_name: "Emma Stone",
    birth_year: 1988,
    nationality: "American",
    bio: "بازیگر آمریکایی، برنده‌ی اسکار برای La La Land و Poor Things.",
    imdb_ids: ["tt2788920", "tt0852122", "tt1219284", "tt1707386", "tt2119532"],
  },
  {
    star_id: 24,
    star_name: "Natalie Portman",
    birth_year: 1981,
    nationality: "Israeli-American",
    bio: "بازیگر آمریکایی-اسرائیلی، برنده‌ی اسکار برای Black Swan. شناخته‌شده برای Star Wars و Thor.",
    imdb_ids: ["tt0947798", "tt0848228", "tt4154796", "tt0119488", "tt0168797", "tt0206607"],
  },
];

/** Get a star's filmography by star_id. */
export function getStarFilmography(starId: number): StarFilmographyEntry | undefined {
  return STARS_FILMOGRAPHY.find((s) => s.star_id === starId);
}

/** Get a star's filmography by name. */
export function getStarFilmographyByName(name: string): StarFilmographyEntry | undefined {
  return STARS_FILMOGRAPHY.find((s) => s.star_name.toLowerCase() === name.toLowerCase());
}
