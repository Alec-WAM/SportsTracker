export interface NBATeam {
    nba_id: string;
    full_name: string;
    short_name: string;
    url_slug: string;
    conference: string;
    image: string;
    espn_id: string;
    primary_color: string;
    secondary_color: string;
}

export const EMPTY_NBA_TEAM: NBATeam = {
    nba_id: "",
    full_name: "",
    short_name: "",
    url_slug: "",
    conference: "",
    image: "",
    espn_id: "",
    primary_color: "",
    secondary_color: ""
}

export const TEAMS: NBATeam[] = [
    {
        nba_id: "1610612737",
        full_name: "Atlanta Hawks",
        short_name: "Hawks",
        url_slug: "hawks",
        conference: "East",
        image: "hawks",
        espn_id: "1",
        primary_color: "#c8102e",
        secondary_color: "#fdb927"
    },
    {
        nba_id: "1610612738",
        full_name: "Boston Celtics",
        short_name: "Celtics",
        url_slug: "celtics",
        conference: "East",
        image: "celtics",
        espn_id: "2",
        primary_color: "#008348",
        secondary_color: "#ffffff"
    },
    {
        nba_id: "1610612751",
        full_name: "Brooklyn Nets",
        short_name: "Nets",
        url_slug: "nets",
        conference: "East",
        image: "nets",
        espn_id: "17",
        primary_color: "#000000",
        secondary_color: "#ffffff"
    },
    {
        nba_id: "1610612766",
        full_name: "Charlotte Hornets",
        short_name: "Hornets",
        url_slug: "hornets",
        conference: "East",
        image: "hornets",
        espn_id: "30",
        primary_color: "#008ca8",
        secondary_color: "#1d1060"
    },
    {
        nba_id: "1610612741",
        full_name: "Chicago Bulls",
        short_name: "Bulls",
        url_slug: "bulls",
        conference: "East",
        image: "bulls",
        espn_id: "4",
        primary_color: "#ce1141",
        secondary_color: "#000000"
    },
    {
        nba_id: "1610612739",
        full_name: "Cleveland Cavaliers",
        short_name: "Cavaliers",
        url_slug: "cavs",
        conference: "East",
        image: "cavs",
        espn_id: "5",
        primary_color: "#860038",
        secondary_color: "#bc945c"
    },
    {
        nba_id: "1610612742",
        full_name: "Dallas Mavericks",
        short_name: "Mavericks",
        url_slug: "mavs",
        conference: "West",
        image: "mavs",
        espn_id: "6",
        primary_color: "#0064b1",
        secondary_color: "#bbc4ca"
    },
    {
        nba_id: "1610612743",
        full_name: "Denver Nuggets",
        short_name: "Nuggets",
        url_slug: "nuggets",
        conference: "West",
        image: "nuggets",
        espn_id: "7",
        primary_color: "#0e2240",
        secondary_color: "#fec524"
    },
    {
        nba_id: "1610612765",
        full_name: "Detroit Pistons",
        short_name: "Pistons",
        url_slug: "pistons",
        conference: "East",
        image: "pistons",
        espn_id: "8",
        primary_color: "#1d428a",
        secondary_color: "#c8102e"
    },
    {
        nba_id: "1610612744",
        full_name: "Golden State Warriors",
        short_name: "Warriors",
        url_slug: "warriors",
        conference: "West",
        image: "warriors",
        espn_id: "9",
        primary_color: "#fdb927",
        secondary_color: "#1d428a"
    },
    {
        nba_id: "1610612745",
        full_name: "Houston Rockets",
        short_name: "Rockets",
        url_slug: "rockets",
        conference: "West",
        image: "rockets",
        espn_id: "10",
        primary_color: "#ce1141",
        secondary_color: "#000000"
    },
    {
        nba_id: "1610612754",
        full_name: "Indiana Pacers",
        short_name: "Pacers",
        url_slug: "pacers",
        conference: "East",
        image: "pacers",
        espn_id: "11",
        primary_color: "#002d62",
        secondary_color: "#fdbb30"
    },
    {
        nba_id: "1610612746",
        full_name: "Los Angeles Clippers",
        short_name: "Clippers",
        url_slug: "clippers",
        conference: "West",
        image: "clippers",
        espn_id: "12",
        primary_color: "#1d428a",
        secondary_color: "#c8102e"
    },
    {
        nba_id: "1610612747",
        full_name: "Los Angeles Lakers",
        short_name: "Lakers",
        url_slug: "lakers",
        conference: "West",
        image: "lakers",
        espn_id: "13",
        primary_color: "#552583",
        secondary_color: "#fdb927"
    },
    {
        nba_id: "1610612763",
        full_name: "Memphis Grizzlies",
        short_name: "Grizzlies",
        url_slug: "grizzlies",
        conference: "West",
        image: "grizzlies",
        espn_id: "29",
        primary_color: "#5d76a9",
        secondary_color: "#12173f"
    },
    {
        nba_id: "1610612748",
        full_name: "Miami Heat",
        short_name: "Heat",
        url_slug: "heat",
        conference: "East",
        image: "heat",
        espn_id: "14",
        primary_color: "#98002e",
        secondary_color: "#000000"
    },
    {
        nba_id: "1610612749",
        full_name: "Milwaukee Bucks",
        short_name: "Bucks",
        url_slug: "bucks",
        conference: "East",
        image: "bucks",
        espn_id: "15",
        primary_color: "#00471b",
        secondary_color: "#eee1c6"
    },
    {
        nba_id: "1610612750",
        full_name: "Minnesota Timberwolves",
        short_name: "Timberwolves",
        url_slug: "timberwolves",
        conference: "West",
        image: "timberwolves",
        espn_id: "16",
        primary_color: "#266092",
        secondary_color: "#79bc43"
    },
    {
        nba_id: "1610612740",
        full_name: "New Orleans Pelicans",
        short_name: "Pelicans",
        url_slug: "pelicans",
        conference: "West",
        image: "pelicans",
        espn_id: "3",
        primary_color: "#0a2240",
        secondary_color: "#b4975a"
    },
    {
        nba_id: "1610612752",
        full_name: "New York Knicks",
        short_name: "Knicks",
        url_slug: "knicks",
        conference: "East",
        image: "knicks",
        espn_id: "18",
        primary_color: "#1d428a",
        secondary_color: "#f58426"
    },
    {
        nba_id: "1610612760",
        full_name: "Oklahoma City Thunder",
        short_name: "Thunder",
        url_slug: "thunder",
        conference: "West",
        image: "thunder",
        espn_id: "25",
        primary_color: "#007ac1",
        secondary_color: "#ef3b24"
    },
    {
        nba_id: "1610612753",
        full_name: "Orlando Magic",
        short_name: "Magic",
        url_slug: "magic",
        conference: "East",
        image: "magic",
        espn_id: "19",
        primary_color: "#0077c0",
        secondary_color: "#c4ced4"
    },
    {
        nba_id: "1610612755",
        full_name: "Philadelphia 76ers",
        short_name: "76ers",
        url_slug: "76ers",
        conference: "East",
        image: "76ers",
        espn_id: "20",
        primary_color: "#1d428a",
        secondary_color: "#e01234"
    },
    {
        nba_id: "1610612756",
        full_name: "Phoenix Suns",
        short_name: "Suns",
        url_slug: "suns",
        conference: "West",
        image: "suns",
        espn_id: "21",
        primary_color: "#29127a",
        secondary_color: "#e56020"
    },
    {
        nba_id: "1610612757",
        full_name: "Portland Trail Blazers",
        short_name: "Blazers",
        url_slug: "trail-blazers",
        conference: "West",
        image: "blazers",
        espn_id: "22",
        primary_color: "#e03a3e",
        secondary_color: "#000000"
    },
    {
        nba_id: "1610612758",
        full_name: "Sacramento Kings",
        short_name: "Kings",
        url_slug: "kings",
        conference: "West",
        image: "kings",
        espn_id: "23",
        primary_color: "#5a2d81",
        secondary_color: "#6a7a82"
    },
    {
        nba_id: "1610612759",
        full_name: "San Antonio Spurs",
        short_name: "Spurs",
        url_slug: "spurs",
        conference: "West",
        image: "spurs",
        espn_id: "24",
        primary_color: "#000000",
        secondary_color: "#c4ced4"
    },
    {
        nba_id: "1610612761",
        full_name: "Toronto Raptors",
        short_name: "Raptors",
        url_slug: "raptors",
        conference: "East",
        image: "raptors",
        espn_id: "28",
        primary_color: "#d91244",
        secondary_color: "#000000"
    },
    {
        nba_id: "1610612762",
        full_name: "Utah Jazz",
        short_name: "Jazz",
        url_slug: "jazz",
        conference: "West",
        image: "jazz",
        espn_id: "26",
        primary_color: "#000000",
        secondary_color: "#fff21f"
    },
    {
        nba_id: "1610612764",
        full_name: "Washington Wizards",
        short_name: "Wizards",
        url_slug: "wizards",
        conference: "East",
        image: "wizards",
        espn_id: "27",
        primary_color: "#e31837",
        secondary_color: "#002b5c"
    }
];